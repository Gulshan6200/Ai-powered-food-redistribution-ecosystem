# FoodCycle AI — Predict. Prevent. Redistribute.
### AI-Powered Smart Food Waste Reduction & Sustainable Redistribution Platform
**Smart India Hackathon Problem Statement SIH26234** | *Ministry of Food Processing Industries (MoFPI)*

---

## 🌟 Executive Overview
**FoodCycle AI** is a production-grade, enterprise web application engineered to solve the systemic food loss and waste crisis across institutional kitchens, food processing units, community food banks, and humanitarian shelters. Built for large-scale operations (corporate cafeterias, university dining halls, centralized catering facilities, food manufacturing lines, and NGO networks), the platform transitions food surplus management from reactive disposal to predictive prevention and automated redistribution.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                    FOODCYCLE AI                        │
                  │           "Predict. Prevent. Redistribute."            │
                  └───────────────────────────┬────────────────────────────┘
                                              │
         ┌───────────────────┬────────────────┴───────────────────┬───────────────────┐
         ▼                   ▼                                    ▼                   ▼
┌─────────────────┐ ┌─────────────────┐                  ┌─────────────────┐ ┌─────────────────┐
│  AI DEMAND &    │ │ SMART COLD-CHAIN│                  │ SMART NGO       │ │ ESG IMPACT &    │
│  SURPLUS ENGINE │ │ & QUALITY CV    │                  │ ROUTE DISPATCH  │ │ AUDIT REPORTING │
└────────┬────────┘ └────────┬────────┘                  └────────┬────────┘ └────────┬────────┘
         │                   │                                    │                   │
         ▼                   ▼                                    ▼                   ▼
• Exponential       • IoT Telemetry Adapters             • Haversine Match    • Scope 3 Emissions
  Smoothing (α=0.35)• Temp/Humidity Excursions           • Capacity Fit       • Landfill Diversion
• Day-of-Week Season• Modular CV Freshness               • Deadline-Aware TSP • Real PDF / CSV /
• Confidence Bounds • Advisory Disclaimers               • Leaflet OSM Maps     JSON Export
```

---

## 🏛️ The Four Architectural Pillars

### 1. AI Food Intelligence
- **Demand Forecasting Engine**: Implements Holt-Winters & Exponential Smoothing ($\alpha = 0.35$) with day-of-week seasonality factors, headcount normalization, and 95% confidence intervals ($z \cdot \sigma \cdot \sqrt{h}$). Provides safety buffer recommendations to eliminate overproduction at source.
- **Surplus Prediction & Risk Scoring**: Continuously monitors inventory velocity against scheduled meal shifts. Evaluates urgency with multi-criteria priority scoring:
  $$\text{Priority Score} = w_1 \cdot \text{Qty} + w_2 \cdot \frac{1}{\text{ShelfHours}} + w_3 \cdot \text{QualityRisk} + w_4 \cdot \text{Demand}$$
- **Contextual Intelligence Assistant**: Dockable sidecar analyzing real-time database state to surface actionable cards (e.g., imminent batch expiry, unallocated surplus, cold storage excursion, fleet route suggestions).

### 2. Smart Monitoring
- **Cold/Dry Storage IoT Telemetry**: Telemetry simulation adapter tracking temperature (-20°C to +65°C), relative humidity, and gas quality. Emits automatic excursion alerts when sensors breach critical thresholds.
- **Computer Vision Freshness Assessment**: Modular image analysis adapter calculating freshness scores (0–100%), quality grading (EXCELLENT, GOOD, FAIR, SPOILED), and spoilage indicators with explicit advisory disclaimers distinguishing automated analysis from laboratory microbiology testing.

### 3. Smart Redistribution
- **Dynamic Surplus Listing**: Seamless conversion of surplus batches into redistribution requests with dietary classifications (VEG, NON_VEG, VEGAN, JAIN), packaging conditions, and shelf-life deadlines.
- **Explainable Multi-Factor NGO Matching**: Transparent scoring algorithm evaluating candidate NGOs within reachable radius based on:
  - Proximity via Haversine distance formula (40% weight)
  - Dietary requirement compatibility (25% weight)
  - Beneficiary capacity fit (20% weight)
  - Transit deadline feasibility (15% weight)
  Provides complete, human-readable match explanations.
- **Deadline-Aware Route Optimization**: Nearest-neighbor vehicle routing heuristics with vehicle capacity constraints, delivery time windows, and interactive Leaflet OpenStreetMap route visualization.
- **Digital Receipt Confirmation**: Full chain-of-custody tracking with arrival temperature verification, digital OTP, and cryptographic delivery signatures.

### 4. Impact & Sustainability Analytics
- **Preventable vs. Unavoidable Waste Breakdown**: Granular categorization separating overproduction and spoilage from unpreventable prep trimmings.
- **Live Impact Counters**: Real-time recalculation of rescued food (kg), meals distributed, Scope 3 greenhouse gas avoidance ($\text{kg CO}_2\text{e}$), water conservation (liters), and financial value saved (₹ INR).
- **Executive ESG Compliance Reports**: Complete compliance reporting ready for CSR and regulatory audit with working **PDF download** (via PDFKit), **CSV export**, and **JSON API feed**.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet, React-Leaflet |
| **Backend API** | Node.js, Express, TypeScript, Prisma ORM, Server-Sent Events (SSE), PDFKit, Multer |
| **Database** | SQLite (`dev.db` zero-friction local), fully schema-compatible with PostgreSQL / CockroachDB |
| **AI / Math Engine**| Native TypeScript AI algorithms (Exponential Smoothing, Haversine, TSP Heuristic, CV Adapter) + Python FastAPI microservice |
| **Testing** | Node.js native test runner (`tsx --test`), E2E integration test suite |

---

## 👥 Demo User Accounts & Roles

All demo accounts share the password: **`Password123!`**

| Email | Full Name | Role | Scope / Organization |
|---|---|---|---|
| `admin@foodcycle.ai` | Dr. Rajesh Verma | `ADMIN` | National MoFPI Platform Oversight |
| `kitchen@foodcycle.ai` | Chef Rajesh Nair | `KITCHEN_MANAGER` | Apex Institutional Catering Ltd. |
| `processing@foodcycle.ai` | Priya Sharma | `PROCESSING_MANAGER` | AgriFresh Agro-Processing Unit |
| `ngo@foodcycle.ai` | Sister Philomena | `NGO_COORDINATOR` | Hope Community Kitchen & Shelter |
| `logistics@foodcycle.ai` | Vikram Rathore | `LOGISTICS_OPERATOR` | GreenPath Fleet & Cold Chain |

> **Interactive Role Switcher**: Use the 1-click role switcher in the top navigation bar to seamlessly alternate between Kitchen Manager, NGO Coordinator, Logistics Operator, and System Admin without manual re-login.

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows PowerShell, Command Prompt, or Linux/macOS terminal

### Installation & Initialization

1. **Clone repository and enter project**:
   ```bash
   cd foodcycle-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm run --prefix server install
   npm run --prefix client install
   ```

3. **Generate Prisma Client & Seed Database**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Execute Core AI Unit & Workflow Tests**:
   ```bash
   npm test
   ```
   *Expected Output: 5/5 test suites passed.*

5. **Start Development Environment**:
   ```bash
   npm run dev
   ```
   Or start backend and frontend in separate terminals:
   ```bash
   # Terminal 1: Backend API (Port 5000)
   npm run dev:server

   # Terminal 2: Frontend Client (Port 5173)
   npm run dev:client
   ```

6. **Open in Browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 🔄 The 18-Step End-to-End Verification Workflow

The system is tested and verified through an uninterrupted, 18-step interactive lifecycle where actions persist directly to the database:

1. **Platform Access**: Open [http://localhost:5173](http://localhost:5173) and view the high-impact landing page.
2. **Authentication**: Sign in with `kitchen@foodcycle.ai` (`Password123!`).
3. **Executive Dashboard**: Review live KPIs, production trends, active excursion alerts, and contextual AI recommendations.
4. **Inventory Auditing**: Navigate to `/inventory` to monitor 10+ active batches with dynamic shelf-life countdowns.
5. **Demand Forecasting**: Navigate to `/forecast`, select an Indian menu item (e.g., Dal Makhani or Chapati), and trigger exponential smoothing to generate a 3-day production recommendation with safety buffers.
6. **Surplus Intelligence**: Navigate to `/surplus` to inspect AI-predicted surpluses and priority scores.
7. **Surplus Listing**: Click **"List New Surplus"** and create a 45 kg surplus entry with packaging condition and pickup deadline.
8. **Explainable NGO Matching**: Trigger the matching algorithm to view ranked candidate NGOs scored on proximity, dietary preference, and daily capacity.
9. **Donation Allocation**: Offer the donation to the top-ranked match (e.g., Hope Community Kitchen).
10. **NGO Acceptance**: Switch role to NGO Coordinator or accept the donation offer, automatically scheduling a logistics pickup request.
11. **Logistics Fleet Dispatch**: Switch role to Logistics Operator at `/logistics` to review pending pickups and available cold-chain vehicles.
12. **Route Optimization**: Run the nearest-neighbor route optimizer to calculate total mileage, transit duration, and mapped stops.
13. **Route Visualizer**: View interactive route polylines and stop markers rendered on the Leaflet OpenStreetMap canvas.
14. **In-Transit Transition**: Update pickup status to `IN_TRANSIT` with driver departure timestamps.
15. **Digital Receipt & Delivery**: Mark `DELIVERED`, enter arrival core temperature (e.g., 64°C), and sign with the digital OTP token.
16. **Live Impact Metric Update**: Navigate to `/sustainability` to observe instantaneous counter increments (rescued kg, meals provided, $\text{CO}_2\text{e}$ avoided, water saved).
17. **IoT Cold-Chain Simulation**: Navigate to `/monitoring` to simulate temperature fluctuations and observe excursion alert triggers.
18. **ESG Report Export**: Navigate to `/reports` and download the finalized ESG Compliance Report in **PDF**, **CSV**, or **JSON** format.

---

## 🧪 Automated Testing & Verification Script

Run the standalone 18-step programmatic verification script:
```bash
node server/src/tests/verify_e2e_workflow.cjs
```
This script exercises the full lifecycle via HTTP REST requests against the live server, validating every database mutation, math engine calculation, and audit trail record.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and uptime status |
| `GET` | `/api/events` | Real-time Server-Sent Events (SSE) stream |
| `POST` | `/api/auth/login` | JWT authentication and role assignment |
| `GET` | `/api/dashboard/summary` | Real-time KPIs, charts, alerts, and recommendations |
| `POST` | `/api/forecast` | Run exponential smoothing demand forecast |
| `GET` | `/api/inventory` | Paginated, searchable inventory batch catalog |
| `GET` | `/api/surplus` | Surplus predictions and active redistribution listings |
| `POST` | `/api/surplus` | Create a new surplus redistribution request |
| `POST` | `/api/surplus/:id/match` | Run multi-factor explainable NGO matching |
| `POST` | `/api/donations` | Allocate surplus donation to NGO |
| `PUT` | `/api/donations/:id/status` | Update donation lifecycle (auto-creates pickup on ACCEPTED) |
| `GET` | `/api/logistics/overview` | Fleet, driver, pickup, and active route overview |
| `POST` | `/api/logistics/optimize` | Solve multi-stop vehicle route optimization |
| `PUT` | `/api/logistics/pickups/:id/status` | Advance logistics status (IN_TRANSIT, DELIVERED) |
| `GET` | `/api/sensors` | IoT cold/dry sensor telemetry and active excursions |
| `POST` | `/api/sensors/simulate` | Trigger realistic sensor telemetry readings or anomalies |
| `GET` | `/api/quality` | Computer vision freshness inspection logs |
| `POST` | `/api/quality/analyze` | Submit image for freshness and spoilage assessment |
| `GET` | `/api/analytics/sustainability`| Comprehensive impact counters and environmental factors |
| `POST` | `/api/reports/generate` | Generate dynamic ESG performance report |
| `GET` | `/api/reports/export/pdf` | Download official ESG compliance report in PDF |
| `GET` | `/api/reports/export/csv` | Export redistribution ledger as CSV |

---

## 🔬 Hardware & AI Simulation Architecture
- **Simulated Hardware Disclaimers**: Where physical IoT microcontrollers (ESP32/Raspberry Pi) and industrial hyperspectral cameras are not connected, FoodCycle AI employs typed simulation adapters (`SensorSimulator`, `CVInspectionAdapter`). Telemetry and computer vision outputs are transparently labeled as *simulated telemetry* or *automated advisory screening* rather than certified physical lab tests.
- **Production Integration Path**:
  - IoT: Replace `SensorSimulator` with the provided `MQTTAdapter` listening on topics like `kitchen/coldchain/+/telemetry`.
  - CV: Point `CVInspectionAdapter` to a production YOLOv8 / ResNet-50 endpoint or the included Python FastAPI microservice (`ai-service/main.py`).

---

## 📄 License & Intellectual Property
Developed for the **Smart India Hackathon 2026** under the auspices of the **Ministry of Food Processing Industries (MoFPI)**. Distributed under the ISC License.
