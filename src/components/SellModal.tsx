import React, { useState } from 'react';
import { NewListingFormData, Category, Condition } from '../types';
import { compressImageToBase64, createListingDoc } from '../lib/firebase';
import { CategoryIcon } from './CategoryIcon';
import { X, Upload, Send, Sparkles, AlertCircle, Check } from 'lucide-react';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const CATEGORIES: Category[] = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Vehicles',
  'Books',
  'Toys & Games',
  'Sports & Outdoors',
  'Other',
];

const CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, currentUserId }) => {
  const [formData, setFormData] = useState<NewListingFormData>({
    name: '',
    category: 'Electronics',
    price: '',
    condition: 'Like New',
    description: '',
    imageBase64: '',
    sellerId: currentUserId,
  });

  const [imageFileName, setImageFileName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setError(null);
      setIsCompressing(true);
      setImageFileName(file.name);

      // Client-side compression to base64
      const base64 = await compressImageToBase64(file, 600, 600, 0.7);
      setFormData((prev) => ({ ...prev, imageBase64: base64 }));
    } catch (err: any) {
      console.error('Image processing error:', err);
      setError('Failed to process and compress image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageBase64: '' }));
    setImageFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a listing title.');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Write document to Firestore
      await createListingDoc({
        ...formData,
        sellerId: currentUserId,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setFormData({
          name: '',
          category: 'Electronics',
          price: '',
          condition: 'Like New',
          description: '',
          imageBase64: '',
          sellerId: currentUserId,
        });
        setImageFileName('');
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Firestore save error:', err);
      setError(err?.message || 'Failed to publish listing to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Listing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Post an item for sale to real-time Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Listing published successfully! Syncing live across tabs...</span>
            </div>
          )}

          {/* Title / Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Wireless Noise-Canceling Headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Price (USD $) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="49"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: cond })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formData.condition === cond
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Include details about brand, model, usage history, features, or reason for selling..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all resize-none"
            />
          </div>

          {/* Image Upload Area with Client-Side Compression */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Item Photo (Client-Side Compressed)
            </label>

            {isCompressing ? (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl">
                <Send className="w-6 h-6 text-sky-500 animate-bounce mb-2" />
                <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                  Compressing photo to Base64…
                </span>
              </div>
            ) : formData.imageBase64 ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-900 flex items-center justify-center">
                <img
                  src={formData.imageBase64}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="max-h-48 w-full object-contain"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-rose-700 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
                {imageFileName && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] rounded-md truncate max-w-[200px]">
                    {imageFileName}
                  </span>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50/30 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-all">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-xs mb-2 text-slate-500 dark:text-slate-400">
                  <Upload className="w-5 h-5 text-sky-500" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click or drag photo to upload
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Auto-compressed client-side under 100KB for Firestore
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {!formData.imageBase64 && !isCompressing && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>If no photo is selected, a placeholder icon matching</span>
                <CategoryIcon category={formData.category} className="w-4 h-4 text-sky-500 inline" />
                <span className="font-medium text-slate-600 dark:text-slate-300">{formData.category}</span>
                <span>will be shown.</span>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Send className="w-4 h-4 animate-spin" />
                  <span>Publishing to Firestore…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
