import React, { useState } from 'react';
import { Listing } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { X, Heart, Share2, MessageSquare, Trash2, Clock, User, Tag, Check } from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  currentUserId: string;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isFavorite,
  onToggleFavorite,
  onDelete,
  currentUserId,
}) => {
  const [copied, setCopied] = useState(false);
  const [contacted, setContacted] = useState(false);

  if (!listing) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = listing.sellerId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 flex flex-col md:flex-row max-h-[85vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Image Column */}
        <div className="md:w-1/2 bg-slate-950 flex items-center justify-center min-h-[260px] md:min-h-full relative overflow-hidden">
          {listing.imageBase64 ? (
            <img
              src={listing.imageBase64}
              alt={listing.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[400px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
              <div className="p-6 rounded-full bg-slate-800/80 mb-3">
                <CategoryIcon category={listing.category} className="w-14 h-14 text-sky-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {listing.category} Placeholder
              </span>
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-xs font-medium border border-slate-700/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Condition: {listing.condition}</span>
          </div>
        </div>

        {/* Information Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category & Actions Bar */}
            <div className="flex items-center justify-between mb-3 pr-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200 dark:border-sky-800">
                <Tag className="w-3.5 h-3.5" />
                {listing.category}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => onToggleFavorite(listing.id, e)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                  }`}
                  title={isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors"
                  title="Share listing"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Title & Price */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              {listing.name}
            </h2>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mb-4">
              {formatPrice(listing.price)}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Description
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {listing.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Seller & Post Date Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <User className="w-3.5 h-3.5 text-sky-500" /> Seller ID:
                </span>
                <span className="font-mono font-medium">{listing.sellerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-sky-500" /> Listed:
                </span>
                <span>
                  {listing.createdAt?.seconds
                    ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact / Delete Footer Action */}
          <div className="space-y-2 pt-2">
            {contacted ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs text-center font-medium">
                Seller contacted! Check your messages or email.
              </div>
            ) : (
              <button
                onClick={() => setContacted(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </button>
            )}

            {isOwner && onDelete && (
              <button
                onClick={(e) => {
                  onDelete(listing.id, e);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete My Listing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
