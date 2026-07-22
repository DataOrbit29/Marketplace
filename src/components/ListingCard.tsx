import React from 'react';
import { Listing } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Heart, Send, Trash2, Clock, User, Tag } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onClick: (listing: Listing) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  currentUserId: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDelete,
  currentUserId,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'like new':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'good':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'fair':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'poor':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getTimeAgo = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    let millis: number;
    if (typeof createdAt?.toMillis === 'function') {
      millis = createdAt.toMillis();
    } else if (typeof createdAt === 'number') {
      millis = createdAt;
    } else if (createdAt instanceof Date) {
      millis = createdAt.getTime();
    } else {
      return 'Just now';
    }

    const diffSec = Math.floor((Date.now() - millis) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const isOwner = listing.sellerId === currentUserId;

  return (
    <div
      onClick={() => onClick(listing)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Card Image / Placeholder Area */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center">
        {listing.isUploading ? (
          /* Paper-plane "uploading..." state requirement */
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white p-4">
            <div className="relative mb-2 flex items-center justify-center">
              <Send className="w-8 h-8 text-sky-400 animate-bounce" />
              <div className="absolute -inset-1 bg-sky-400/20 rounded-full blur-xs animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-sky-200">
              <Send className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading photo…</span>
            </div>
          </div>
        ) : listing.imageBase64 ? (
          <img
            src={listing.imageBase64}
            alt={listing.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          /* Category Placeholder Icon requirement */
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            <div className="p-4 rounded-full bg-slate-200/60 dark:bg-slate-800/60 mb-2 group-hover:scale-110 transition-transform duration-300">
              <CategoryIcon category={listing.category} className="w-10 h-10 stroke-[1.5]" />
            </div>
            <span className="text-xs font-medium tracking-wide uppercase text-slate-400 dark:text-slate-500">
              No photo available
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md scale-105'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500 hover:scale-110'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Category Tag Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md text-white text-xs font-medium">
          <Tag className="w-3 h-3 text-sky-400" />
          <span>{listing.category}</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {listing.name}
          </h3>
          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight shrink-0">
            {formatPrice(listing.price)}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {listing.description || 'No description provided.'}
        </p>

        {/* Metadata Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getConditionColor(
                listing.condition
              )}`}
            >
              {listing.condition}
            </span>
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
              <Clock className="w-3 h-3" />
              {getTimeAgo(listing.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500" title={`Seller ID: ${listing.sellerId}`}>
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">
                {isOwner ? ' You' : listing.sellerId}
              </span>
            </span>

            {isOwner && onDelete && (
              <button
                type="button"
                onClick={(e) => onDelete(listing.id, e)}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                title="Delete listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
