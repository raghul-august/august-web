'use client';

import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import type { Severity } from '@/types/bill-analyser';
import { formatCurrency } from '@/utils/file-helpers';

const SEVERITY_LABELS: Record<Severity, { label: string; color: string; bg: string }> = {
    red: { label: 'OVERCHARGED', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
    amber: { label: 'ABOVE AVERAGE', color: '#d97706', bg: 'rgba(245,158,11,0.08)' },
    green: { label: 'FAIR PRICE', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    unknown: { label: 'UNPRICED', color: '#7a756a', bg: '#faf8f3' },
};

const REASON_FALLBACK: Record<string, string> = {
    above_typical_range: 'This charge is above the typical price range for this procedure in your area.',
    significantly_above_range: 'This charge is significantly higher than what most hospitals charge for this procedure.',
    near_upper_range: 'This charge is near the upper end of the typical range and may be worth questioning.',
    within_range: 'This charge falls within the typical price range for this procedure.',
    below_range: 'This charge is at or below the typical price range.',
    no_reference_data: 'We could not find enough reference data to evaluate this charge.',
    duplicate_suspected: 'This charge may be a duplicate of another line item on your bill.',
};

export function ItemDetail() {
    const selectedItemIndex = useBillAnalyserStore((s) => s.selectedItemIndex);
    const analysis = useBillAnalyserStore((s) => s.analysis);

    const item = selectedItemIndex !== null && analysis ? analysis.items[selectedItemIndex] : null;
    const isOpen = item !== null;

    const handleClose = () => {
        useBillAnalyserStore.getState().setSelectedItemIndex(null);
    };

    if (!item) return null;

    const config = SEVERITY_LABELS[item.severity] || SEVERITY_LABELS.unknown;
    const hasRange = item.typicalRange && item.typicalRange[0] !== null && item.typicalRange[1] !== null;

    // Bar position calculation
    let barPercent = 50;
    if (hasRange) {
        const [low, high] = item.typicalRange!;
        const range = high - low;
        if (range > 0) {
            barPercent = Math.min(100, Math.max(0, ((item.chargeAmount - low) / (range * 1.5)) * 100));
        }
    }

    // Savings calculation
    const fairPrice = item.medianPrice ?? (hasRange ? item.typicalRange![1] : null);
    const potentialSavings = fairPrice !== null ? Math.max(0, item.chargeAmount - fairPrice) : 0;

    const showPatientOwes = item.patientResponsibility != null && item.patientResponsibility > 0;
    const fairLabel = item.medianPrice !== null ? 'Median Price' : 'Fair Price';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent
                className="max-w-[600px] p-0 border-none fixed bottom-0 sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] sm:left-[50%] sm:translate-x-[-50%] translate-y-0 max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-[20px] sm:rounded-none"
                style={{
                    background: '#faf8f3',
                    boxShadow: '0 -4px 40px rgba(0,0,0,0.12)',
                }}
                showCloseButton={false}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Mobile drag handle */}
                    <div className="sm:hidden pt-[10px] pb-[8px] text-center">
                        <button
                            onClick={handleClose}
                            className="w-[36px] h-[4px] bg-[#d9d3c8] rounded-full inline-block border-none cursor-pointer"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                            aria-label="Close"
                        />
                    </div>

                    {/* Desktop close button */}
                    <button
                        onClick={handleClose}
                        className="hidden sm:flex absolute top-[20px] right-[20px] w-8 h-8 items-center justify-center text-[#7a756a] hover:text-[#302e28] transition-colors bg-transparent border-none cursor-pointer z-10"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Header area */}
                    <div className="px-5 sm:px-12 pt-1 sm:pt-12">
                        {/* Mobile: header row with badge + close */}
                        <div className="flex justify-between items-start sm:block">
                            <div>
                                {/* Severity badge */}
                                <span
                                    className="inline-block text-[11px] font-semibold uppercase mb-3 sm:mb-5"
                                    style={{
                                        background: config.bg,
                                        color: config.color,
                                        letterSpacing: '0.08em',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                    }}
                                >
                                    {config.label}
                                </span>
                            </div>
                            {/* Mobile close button */}
                            <button
                                onClick={handleClose}
                                className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#7a756a] flex-shrink-0"
                                style={{ background: '#faf8f3', WebkitTapHighlightColor: 'transparent' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <DialogHeader className="text-left">
                            <DialogTitle
                                className="text-[#1a1a18] leading-tight text-[24px] sm:text-[28px] font-bold"
                                style={{ letterSpacing: '-0.01em' }}
                            >
                                {item.description}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Details for {item.description}
                            </DialogDescription>
                        </DialogHeader>

                        {item.cptCode && (
                            <p className="text-[13px] text-[#7a756a] mt-1 mb-6 sm:mb-8">
                                CPT {item.cptCode}
                            </p>
                        )}
                        {!item.cptCode && <div className="mb-6 sm:mb-8" />}
                    </div>

                    {/* ── Desktop price comparison (side-by-side flex) ── */}
                    <div className="hidden sm:block px-12">
                        <div className="flex gap-10 mb-7">
                            <div>
                                <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">Your Charge</div>
                                <div className="text-[28px] font-bold text-[#dc2626]" style={{ letterSpacing: '-0.01em' }}>
                                    {formatCurrency(item.chargeAmount)}
                                </div>
                            </div>
                            {fairPrice !== null ? (
                                <div>
                                    <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">{fairLabel}</div>
                                    <div className="text-[28px] font-bold text-[#206E55]" style={{ letterSpacing: '-0.01em' }}>
                                        {formatCurrency(fairPrice)}
                                    </div>
                                </div>
                            ) : showPatientOwes ? (
                                <div>
                                    <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">You Owe</div>
                                    <div className="text-[28px] font-bold text-[#206E55]" style={{ letterSpacing: '-0.01em' }}>
                                        {formatCurrency(item.patientResponsibility!)}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {potentialSavings > 0 && (
                            <p className="text-[18px] font-medium mb-8">
                                Potential savings: <span className="text-[#206E55] font-bold">{formatCurrency(potentialSavings)}</span>
                            </p>
                        )}

                        {hasRange && (
                            <div className="mb-7 pb-7" style={{ borderBottom: '1px solid #d9d3c8' }}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[11px] text-[#7a756a]">{formatCurrency(item.typicalRange![0])}</span>
                                    <span className="text-[11px] text-[#7a756a]">{formatCurrency(item.typicalRange![1])}</span>
                                </div>
                                <div className="relative h-1.5 rounded-[3px] overflow-visible" style={{ background: '#ddd7cc' }}>
                                    <div
                                        className="absolute h-full rounded-[3px]"
                                        style={{ left: '10%', right: '25%', background: '#4d8b77' }}
                                    />
                                    <div
                                        className="absolute rounded-full"
                                        style={{
                                            top: '-5px',
                                            left: `${barPercent}%`,
                                            width: '16px',
                                            height: '16px',
                                            background: config.color,
                                            border: '2px solid #fff',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                            transform: 'translateX(-50%)',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Mobile price cards (2-col grid) ── */}
                    <div className="sm:hidden px-5 mb-6">
                        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                            <div className="p-4 border border-[#d9d3c8] rounded-xl" style={{ background: '#faf8f3' }}>
                                <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">Your Charge</div>
                                <div className="text-[22px] font-bold text-[#dc2626]">
                                    {formatCurrency(item.chargeAmount)}
                                </div>
                            </div>
                            {fairPrice !== null ? (
                                <div className="p-4 border border-[#d9d3c8] rounded-xl" style={{ background: '#faf8f3' }}>
                                    <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">{fairLabel}</div>
                                    <div className="text-[22px] font-bold text-[#206E55]">
                                        {formatCurrency(fairPrice)}
                                    </div>
                                </div>
                            ) : showPatientOwes ? (
                                <div className="p-4 border border-[#d9d3c8] rounded-xl" style={{ background: '#faf8f3' }}>
                                    <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">You Owe</div>
                                    <div className="text-[22px] font-bold text-[#206E55]">
                                        {formatCurrency(item.patientResponsibility!)}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {potentialSavings > 0 && (
                            <div
                                className="p-4 border rounded-xl col-span-2"
                                style={{ background: 'rgba(22,163,74,0.04)', borderColor: 'rgba(22,163,74,0.15)' }}
                            >
                                <div className="text-[11px] text-[#7a756a] uppercase tracking-wider mb-1">Potential Savings</div>
                                <div className="text-[22px] font-bold text-[#16a34a]">
                                    {formatCurrency(potentialSavings)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile range bar */}
                    {hasRange && (
                        <div className="sm:hidden px-5 mb-7">
                            <div className="flex justify-between mb-2">
                                <span className="text-[11px] text-[#7a756a]">{formatCurrency(item.typicalRange![0])}</span>
                                <span className="text-[11px] text-[#7a756a]">{formatCurrency(item.typicalRange![1])}</span>
                            </div>
                            <div className="relative h-1.5 rounded-[3px] overflow-visible" style={{ background: '#ddd7cc' }}>
                                <div
                                    className="absolute h-full rounded-[3px]"
                                    style={{ left: '10%', right: '25%', background: '#4d8b77' }}
                                />
                                <div
                                    className="absolute rounded-full"
                                    style={{
                                        top: '-5px',
                                        left: `${barPercent}%`,
                                        width: '16px',
                                        height: '16px',
                                        background: config.color,
                                        border: '2px solid #fff',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                        transform: 'translateX(-50%)',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Mobile divider */}
                    <div className="sm:hidden h-px mx-5 mb-6" style={{ background: '#d9d3c8' }} />

                    {/* ── Sections ── */}
                    <div className="px-5 sm:px-12 sm:pb-12">
                        {item.whatThisCovers && (
                            <div className="mb-6">
                                <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#302e28] mb-2">What This Covers</h4>
                                <p className="text-[14px] text-[#7a756a]" style={{ lineHeight: 1.65 }}>{item.whatThisCovers}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#302e28] mb-2">Analysis</h4>
                            <p className="text-[14px] text-[#7a756a]" style={{ lineHeight: 1.65 }}>
                                {item.plainExplanation || REASON_FALLBACK[item.severityReason] || item.severityReason}
                            </p>
                        </div>

                        {item.whyFlagged && (item.severity === 'red' || item.severity === 'amber') && (
                            <div className="mb-6">
                                <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#302e28] mb-2">Why This Was Flagged</h4>
                                <p className="text-[14px] text-[#7a756a]" style={{ lineHeight: 1.65 }}>{item.whyFlagged}</p>
                            </div>
                        )}

                        {item.suggestedQuestion && (
                            <div className="mb-6">
                                <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#206E55] mb-2">What to Ask Your Provider</h4>
                                {/* Desktop blockquote */}
                                <blockquote
                                    className="hidden sm:block italic text-[15px] text-[#302e28] pl-4"
                                    style={{ borderLeft: '2px solid #4d8b77', lineHeight: 1.55 }}
                                >
                                    {item.suggestedQuestion}
                                </blockquote>
                                {/* Mobile blockquote */}
                                <blockquote
                                    className="sm:hidden italic text-[14px] text-[#302e28]"
                                    style={{
                                        padding: '12px 16px',
                                        background: '#faf8f3',
                                        borderLeft: '3px solid #4d8b77',
                                        borderRadius: '0 8px 8px 0',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {item.suggestedQuestion}
                                </blockquote>
                            </div>
                        )}

                        {item.duplicateFlag && (
                            <div className="mb-6">
                                <h4 className="text-[14px] sm:text-[15px] font-semibold text-[#d97706] mb-2">Possible Duplicate</h4>
                                <p className="text-[13px] text-[#302e28]" style={{ lineHeight: 1.65 }}>{item.duplicateFlag.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom padding for mobile safe area */}
                    <div className="sm:hidden h-6" />
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
