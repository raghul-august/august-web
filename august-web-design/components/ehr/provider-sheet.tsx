'use client';

import { X, Plus, Loader2 } from 'lucide-react';
import type { EhrProvider } from '@/stores/ehr-store';

interface ProviderSheetProps {
  open: boolean;
  onClose: () => void;
  providers: EhrProvider[];
  selectedProvider: string;
  onSelectProvider: (id: string) => void;
  onAddProvider: () => void;
  canAddProvider: boolean;
  addProviderLoading?: boolean;
  onDisconnect?: () => void;
}

export function ProviderSheet({
  open,
  onClose,
  providers,
  selectedProvider,
  onSelectProvider,
  onAddProvider,
  canAddProvider,
  addProviderLoading,
  onDisconnect,
}: ProviderSheetProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white rounded-t-2xl shadow-xl border border-gray-100 overflow-hidden max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-200">
          {/* Handle */}
          <div className="px-4 pt-4 pb-2 sm:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-xs font-semibold text-[#8A9290] tracking-wider uppercase">
              Connected Providers
            </p>
            <button onClick={onClose} className="sm:hidden w-6 h-6 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Provider list */}
          <div className="py-1">
            {providers.length > 1 && (
              <button
                onClick={() => { onSelectProvider('all'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  selectedProvider === 'all' ? 'bg-[#E8F4F0]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  selectedProvider === 'all' ? 'bg-[#206E55] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  All
                </div>
                <span className={`text-sm font-medium ${selectedProvider === 'all' ? 'text-[#206E55]' : 'text-[#141515]'}`}>
                  All Providers
                </span>
                {selectedProvider === 'all' && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#206E55]" />
                )}
              </button>
            )}

            {providers.map((provider) => {
              const name = provider.platformType || 'Provider';
              const initial = name.charAt(0).toUpperCase();
              const isSelected = selectedProvider === provider.jobId
                || (selectedProvider === 'all' && providers.length === 1);

              return (
                <button
                  key={provider.jobId}
                  onClick={() => { onSelectProvider(provider.jobId); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isSelected ? 'bg-[#E8F4F0]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    isSelected ? 'bg-[#206E55] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {initial}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-[#206E55]' : 'text-[#141515]'}`}>
                    {name}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[#206E55]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100">
            {canAddProvider && (
              <button
                onClick={() => { onAddProvider(); onClose(); }}
                disabled={addProviderLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#206E55] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {addProviderLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-[#206E55]/30 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-medium">Add Provider</span>
              </button>
            )}

            {onDisconnect && (
              <button
                onClick={() => { onDisconnect(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
              >
                <span className="text-sm font-medium ml-11">Disconnect Provider</span>
              </button>
            )}
          </div>

          <div className="h-2 sm:hidden" />
        </div>
      </div>
    </>
  );
}
