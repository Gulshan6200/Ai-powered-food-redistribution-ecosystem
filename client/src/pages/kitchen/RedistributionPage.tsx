import React, { useState, useEffect } from 'react';
import {
  Share2,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { SurplusListing, MatchScoreResult } from '../../types';

interface RedistributionPageProps {
  onNavigate: (path: string) => void;
}

export const RedistributionPage: React.FC<RedistributionPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();

  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<SurplusListing | null>(null);
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadListings = async () => {
    try {
      const res = await api.get('/surplus');
      if (res.success && res.listings) {
        const available = res.listings.filter((l: any) => l.availableQuantity > 0);
        setListings(available);
        if (available.length > 0 && !selectedListing) {
          fetchMatches(available[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const fetchMatches = async (listing: SurplusListing) => {
    setSelectedListing(listing);
    setIsLoadingMatches(true);
    try {
      const res = await api.post(`/surplus/${listing.id}/match`);
      if (res.success && res.matches) {
        setMatches(res.matches);
      }
    } catch (err: any) {
      showToast('Failed to calculate NGO matches', 'error', 'Error');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleCreateDonationOffer = async (match: MatchScoreResult) => {
    if (!selectedListing) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/donations', {
        surplusListingId: selectedListing.id,
        ngoId: match.ngoId,
        quantity: selectedListing.availableQuantity,
        matchScore: match.platformMatchScore,
        matchReasoning: match.explanationText
      });

      if (res.success) {
        showToast(
          `Donation offer sent to ${match.ngoName}! (${selectedListing.availableQuantity} kg)`,
          'success',
          'Donation Dispatched'
        );
        loadListings();
        onNavigate('/ngo');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch donation', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-emerald-600" />
            <span>Smart Surplus Redistribution Marketplace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Matching available institutional kitchen surplus with local verified NGOs and community food banks
          </p>
        </div>

        <button
          onClick={() => onNavigate('/ngo')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Switch to NGO Hub View</span>
        </button>
      </div>

      {/* Available Surplus Selection Carousel / Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          1. Select Prepared Surplus Batch for Redistribution:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {listings.map((listing) => {
            const isSelected = selectedListing?.id === listing.id;
            return (
              <div
                key={listing.id}
                onClick={() => fetchMatches(listing)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 shadow-lg bg-emerald-50/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 shadow-sm bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {listing.dietaryCategory}
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    {listing.availableQuantity} {listing.unit}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">{listing.foodItem?.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{listing.storageCondition}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Window: {listing.shelfLifeHours}h</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Verified Safe
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>2. Algorithmic NGO Matches for</span>
              <span className="text-emerald-700 underline underline-offset-4 decoration-emerald-400">
                {selectedListing?.foodItem?.name || 'Selected Batch'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by distance, dietary compatibility, beneficiary capacity, and delivery transit deadlines
            </p>
          </div>
        </div>

        {isLoadingMatches ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Calculating optimal multi-factor NGO matches...
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No matching NGOs within transit radius for this batch.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, idx) => (
              <div
                key={match.ngoId}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{match.ngoName}</h4>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase">
                            Top Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.distanceKm} km away</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{match.recommendedPickupWindow}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black text-emerald-600">
                        {match.platformMatchScore}%
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Platform Match Score</span>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5 my-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Match Reasoning:
                    </span>
                    <p className="font-mono text-[11px] text-slate-700 leading-relaxed">
                      {match.explanationText}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateDonationOffer(match)}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Offer Donation ({selectedListing?.availableQuantity} kg)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
