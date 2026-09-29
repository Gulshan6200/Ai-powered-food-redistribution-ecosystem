import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { activeVisionAdapter, evaluateIoTSensorQuality } from '../ai/quality.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'food-inspect-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are supported'));
    }
  }
});

// GET /api/quality (list all inspections)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const inspections = await prisma.qualityInspection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        foodItem: true,
        batch: true,
        inspector: true
      }
    });

    res.json({ success: true, inspections });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch inspections' });
  }
});

// POST /api/quality/analyze (Assess food quality via IoT Sensor Probes or CV analysis)
router.post('/analyze', authenticateToken, upload.single('image'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      foodItemId,
      imageUrl: rawUrl,
      batchId,
      probeId = 'PROBE-QC-01',
      coreTemperature,
      temperature,
      vocGasPpm,
      gasPpm,
      phLevel,
      ph,
      moistureAw
    } = req.body;

    // Default food item if unselected
    let targetFoodItemId = foodItemId;
    if (!targetFoodItemId) {
      const defaultItem = await prisma.foodItem.findFirst();
      targetFoodItemId = defaultItem?.id;
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: targetFoodItemId }
    });

    let qualityScore: number;
    let freshnessCategory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'SPOILED';
    let spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    let diagnosticsText: string;
    let recommendedAction: string;
    let disclaimer: string;
    let analysisDetails: any;

    // Check if IoT sensor parameters were submitted (default flow)
    const hasSensorData = coreTemperature !== undefined || temperature !== undefined || vocGasPpm !== undefined || phLevel !== undefined;

    if (hasSensorData || !req.file) {
      const coreTemp = coreTemperature !== undefined ? Number(coreTemperature) : (temperature !== undefined ? Number(temperature) : 64.0);
      const gas = vocGasPpm !== undefined ? Number(vocGasPpm) : (gasPpm !== undefined ? Number(gasPpm) : 9.5);
      const foodPh = phLevel !== undefined ? Number(phLevel) : (ph !== undefined ? Number(ph) : 6.4);
      const moist = moistureAw !== undefined ? Number(moistureAw) : 0.86;

      const sensorEval = evaluateIoTSensorQuality({
        foodItemId: targetFoodItemId,
        foodName: foodItem?.name,
        category: foodItem?.category,
        coreTemperature: coreTemp,
        vocGasPpm: gas,
        phLevel: foodPh,
        moistureAw: moist,
        probeId
      });

      qualityScore = sensorEval.qualityScore;
      freshnessCategory = sensorEval.freshnessCategory;
      spoilageRisk = sensorEval.spoilageRisk;
      diagnosticsText = sensorEval.diagnosticsText;
      recommendedAction = sensorEval.recommendedAction;
      disclaimer = sensorEval.disclaimer;
      analysisDetails = sensorEval;
    } else {
      let finalImageUrl = req.file ? `/uploads/${req.file.filename}` : (rawUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60');
      const cvEval = await activeVisionAdapter.analyzeFoodImage(finalImageUrl, foodItem?.category);
      qualityScore = cvEval.qualityScore;
      freshnessCategory = cvEval.freshnessCategory;
      spoilageRisk = cvEval.spoilageRisk;
      diagnosticsText = cvEval.visualIssues;
      recommendedAction = cvEval.recommendedAction;
      disclaimer = cvEval.disclaimer;
      analysisDetails = cvEval;
    }

    const defaultSensorIcon = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60';

    // Save Quality Inspection in database
    const inspection = await prisma.qualityInspection.create({
      data: {
        foodItemId: targetFoodItemId,
        batchId: batchId || null,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : (rawUrl || defaultSensorIcon),
        qualityScore,
        freshnessCategory,
        spoilageRisk,
        visualIssues: diagnosticsText,
        recommendedAction,
        reviewerStatus: 'PENDING',
        disclaimer,
        inspectedById: req.user?.id
      },
      include: { foodItem: true, inspector: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'RAN_IOT_SENSOR_QUALITY_INSPECTION',
        entity: 'QualityInspection',
        entityId: inspection.id,
        newValue: { score: qualityScore, category: freshnessCategory, probeId },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('QUALITY_INSPECTED', { inspection });

    res.status(201).json({
      success: true,
      inspection,
      analysisDetails
    });
  } catch (error: any) {
    console.error('Quality analyze error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze food quality with IoT sensor probe' });
  }
});

// POST /api/quality/:id/review (Human Reviewer: APPROVE, REJECT, REVIEW_REQUESTED)
router.post('/:id/review', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reviewerStatus, inspectorNotes } = req.body;

    if (!['APPROVED', 'REJECTED', 'REVIEW_REQUESTED'].includes(reviewerStatus)) {
      res.status(400).json({ success: false, error: 'Invalid reviewer status' });
      return;
    }

    const updated = await prisma.qualityInspection.update({
      where: { id },
      data: {
        reviewerStatus,
        inspectorNotes,
        inspectedById: req.user?.id
      },
      include: { foodItem: true, inspector: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: `QUALITY_REVIEW_${reviewerStatus}`,
        entity: 'QualityInspection',
        entityId: id,
        newValue: { reviewerStatus, notes: inspectorNotes },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('QUALITY_REVIEWED', { inspection: updated });

    res.json({ success: true, inspection: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to record human review' });
  }
});

export default router;
