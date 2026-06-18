'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import { track } from '@/services/analytics-service';
import { formatCurrency } from '@/utils/file-helpers';
import { toUnicodeBold, toUnicodeItalic } from '@/utils/text-format';
import type { BillLineItem } from '@/types/bill-analyser';

const ease = [0.16, 1, 0.3, 1] as const;

type FlagGroup = 'duplicate' | 'overcharged' | 'above_average';

const FLAG_GROUP_META: Record<FlagGroup, { label: string; color: string }> = {
    duplicate: { label: 'Duplicate Charges', color: '#dc2626' },
    overcharged: { label: 'Overcharged', color: '#dc2626' },
    above_average: { label: 'Above Average', color: '#d97706' },
};

const FLAG_GROUP_ORDER: FlagGroup[] = ['duplicate', 'overcharged', 'above_average'];

function getFlagGroup(item: BillLineItem): FlagGroup {
    if (item.duplicateFlag) return 'duplicate';
    if (item.severityReason === 'far_above_range' || item.severityReason === 'should_not_be_billed') return 'overcharged';
    return 'above_average';
}

function groupFlaggedItems(items: BillLineItem[]) {
    const buckets = new Map<FlagGroup, BillLineItem[]>();
    for (const item of items) {
        const group = getFlagGroup(item);
        if (!buckets.has(group)) buckets.set(group, []);
        buckets.get(group)!.push(item);
    }
    return FLAG_GROUP_ORDER
        .filter((g) => buckets.has(g))
        .map((g) => ({ group: g, items: buckets.get(g)! }));
}

interface RecapStepProps {
    onBack: () => void;
}

function getItemSavings(item: BillLineItem): number {
    if (item.typicalRange) {
        const fairHigh = item.typicalRange[1];
        return Math.max(0, item.chargeAmount - fairHigh);
    }
    if (item.medianPrice != null) {
        return Math.max(0, item.chargeAmount - item.medianPrice);
    }
    return 0;
}

function buildEmailDraft(
    selectedItems: BillLineItem[],
    provider: string | null,
    patientName: string | null,
    dateOfService: string | null,
) {
    const providerLine = provider || '[Provider Name]';
    const totalDisputed = selectedItems.reduce((sum, item) => sum + item.chargeAmount, 0);

    const groups: { items: BillLineItem[]; question: string | null }[] = [];
    const cptGroupMap = new Map<string, number>();

    for (const item of selectedItems) {
        const key = item.cptCode && item.duplicateFlag ? item.cptCode : null;
        if (key && cptGroupMap.has(key)) {
            groups[cptGroupMap.get(key)!].items.push(item);
        } else {
            const idx = groups.length;
            groups.push({ items: [item], question: item.suggestedQuestion || item.whyFlagged || null });
            if (key) cptGroupMap.set(key, idx);
        }
    }

    const itemLines = groups.map((group, i) => {
        const first = group.items[0];
        const isGrouped = group.items.length > 1;
        const amount = isGrouped
            ? group.items.reduce((s, it) => s + it.chargeAmount, 0)
            : first.chargeAmount;
        const suffix = isGrouped ? ` (x${group.items.length})` : '';

        const parts: string[] = [
            `${i + 1}. ${first.description}${suffix} · ${formatCurrency(amount)}`,
        ];
        if (first.cptCode) parts.push(`   CPT Code: ${first.cptCode}`);
        if (group.question) parts.push(`   ${group.question}`);
        return parts.join('\n');
    });

    const subject = `Billing Inquiry - ${dateOfService || 'Recent Visit'} - ${providerLine}`;

    const body = [
        toUnicodeBold(`Dear ${providerLine} Billing Department,`),
        '',
        `I am writing to request a review of charges from my ${dateOfService ? `visit on ${dateOfService}` : 'recent visit'}. After reviewing my bill, I have questions about the following ${selectedItems.length === 1 ? 'charge' : `${selectedItems.length} charges`} totaling ${formatCurrency(totalDisputed)}:`,
        '',
        toUnicodeBold('Charges in Question'),
        ...itemLines,
        '',
        'I would appreciate an itemized breakdown and explanation of these charges. If any adjustments are warranted, please let me know the corrected amounts.',
        '',
        toUnicodeItalic('Thank you for your time.'),
        '',
        patientName || '[Your Name]',
    ].join('\n');

    return { subject, body };
}

export function RecapStep({ onBack }: RecapStepProps) {
    const analysis = useBillAnalyserStore((s) => s.analysis);
    const isWebview = useBillAnalyserStore((s) => s.isWebview);
    const [selectedForEmail, setSelectedForEmail] = useState<Set<string>>(new Set());
    const [showDraft, setShowDraft] = useState(false);
    const [copied, setCopied] = useState(false);

    const flaggedItems = useMemo(
        () => analysis?.items.filter((i) => i.severity === 'red' || i.severity === 'amber') ?? [],
        [analysis],
    );

    useEffect(() => {
        if (isWebview) {
            useBillAnalyserStore.getState().setActiveSubView(showDraft ? 'draft' : 'recap');
        }
    }, [showDraft, isWebview]);

    useEffect(() => {
        const handler = () => setShowDraft(false);
        window.addEventListener('bill-analyser-close-draft', handler);
        return () => window.removeEventListener('bill-analyser-close-draft', handler);
    }, []);

    if (!analysis) return null;

    const toggleEmailItem = (id: string) => {
        setSelectedForEmail((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAllForEmail = () => {
        if (selectedForEmail.size === flaggedItems.length) {
            setSelectedForEmail(new Set());
        } else {
            setSelectedForEmail(new Set(flaggedItems.map((i) => i.id)));
        }
    };

    const toggleGroupForEmail = (groupItems: BillLineItem[]) => {
        setSelectedForEmail((prev) => {
            const next = new Set(prev);
            const allSelected = groupItems.every((i) => next.has(i.id));
            if (allSelected) {
                groupItems.forEach((i) => next.delete(i.id));
            } else {
                groupItems.forEach((i) => next.add(i.id));
            }
            return next;
        });
    };

    const selectedItems = flaggedItems.filter((i) => selectedForEmail.has(i.id));
    const draft = selectedItems.length > 0
        ? buildEmailDraft(selectedItems, analysis.provider, analysis.patientName, analysis.dateOfService)
        : null;

    const handleCopy = async () => {
        if (!draft) return;
        const text = `Subject: ${draft.subject}\n\n${draft.body}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        track('bill_analyser_email_copied', { count: selectedItems.length });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMailto = () => {
        if (!draft) return;
        const mailto = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body.replace(/\n/g, '\r\n'))}`;
        const a = document.createElement('a');
        a.href = mailto;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        track('bill_analyser_email_opened', { count: selectedItems.length });
    };

    const handleOpenDraft = () => {
        setShowDraft(true);
        track('bill_analyser_draft_email_opened', { count: selectedItems.length });
    };

    const handleStartOver = () => {
        track('bill_analyser_start_over');
        useBillAnalyserStore.getState().reset();
    };

    const { recap } = analysis;
    const items = analysis.items;
    const redDollars = items.filter(i => i.severity === 'red').reduce((s, i) => s + i.chargeAmount, 0);
    const amberDollars = items.filter(i => i.severity === 'amber').reduce((s, i) => s + i.chargeAmount, 0);
    const totalCharges = recap.totalCharges;
    const redWidth = totalCharges > 0 ? (redDollars / totalCharges) * 100 : 0;
    const amberWidth = totalCharges > 0 ? (amberDollars / totalCharges) * 100 : 0;
    const greenWidth = totalCharges > 0 ? ((totalCharges - redDollars - amberDollars) / totalCharges) * 100 : 0;

    const noIssues = flaggedItems.length === 0;

    const allItemsContent = noIssues ? (
        <div className="divide-y divide-[#d9d3c8]">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex items-start gap-3 text-left"
                    style={{ padding: '14px 16px', background: '#faf8f3' }}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center" style={{ background: '#e8f5f0' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#302e28] leading-snug">{item.description}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {item.cptCode && <span className="text-[11px] text-[#7a756a]">CPT {item.cptCode}</span>}
                            {item.category && (
                                <>
                                    {item.cptCode && <span className="text-[11px] text-[#c8c1b5]">|</span>}
                                    <span className="text-[11px] text-[#7a756a]">{item.category}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end">
                        <span className="text-[13px] font-semibold text-[#302e28] tabular-nums">{formatCurrency(item.chargeAmount)}</span>
                        <span className="text-[11px] text-[#16a34a]">Within range</span>
                    </div>
                </div>
            ))}
        </div>
    ) : null;

    const chargeListContent = (
        <>
            {!showDraft ? (
                <div className="space-y-5">
                    {groupFlaggedItems(flaggedItems).map(({ group, items: groupItems }) => {
                        const meta = FLAG_GROUP_META[group];
                        const groupAllSelected = groupItems.every((i) => selectedForEmail.has(i.id));
                        const groupSomeSelected = groupItems.some((i) => selectedForEmail.has(i.id));
                        return (
                            <div key={group}>
                                {isWebview ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleGroupForEmail(groupItems)}
                                        className="flex items-center gap-2.5 mb-2.5 px-1 w-full text-left"
                                    >
                                        <div
                                            className="w-[20px] h-[20px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-150 flex-shrink-0"
                                            style={{
                                                borderColor: groupAllSelected || groupSomeSelected ? '#206E55' : '#c8c1b5',
                                                background: groupAllSelected ? '#206E55' : groupSomeSelected ? '#e8f5f0' : '#faf8f3',
                                            }}
                                        >
                                            {groupAllSelected && (
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                            {!groupAllSelected && groupSomeSelected && (
                                                <div className="w-[10px] h-[2px] rounded bg-[#206E55]" />
                                            )}
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                                        <span className="text-[14px] font-bold" style={{ color: meta.color }}>
                                            {meta.label}
                                        </span>
                                        <span className="text-[12px] text-[#7a756a]">({groupItems.length})</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 mb-2.5 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                                            {meta.label}
                                        </span>
                                        <span className="text-[11px] text-[#7a756a]">({groupItems.length})</span>
                                    </div>
                                )}
                                <div className={isWebview ? 'ml-7' : ''}>
                                    <div className="divide-y divide-[#d9d3c8]">
                                        {groupItems.map((item) => {
                                            const isSelected = selectedForEmail.has(item.id);
                                            const savings = getItemSavings(item);
                                            const rangeStr = item.typicalRange
                                                ? `${formatCurrency(item.typicalRange[0])}-${formatCurrency(item.typicalRange[1])}`
                                                : item.medianPrice != null
                                                    ? `~${formatCurrency(item.medianPrice)}`
                                                    : null;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleEmailItem(item.id)}
                                                    className="w-full flex items-start gap-3 text-left transition-all duration-150"
                                                    style={{
                                                        padding: isWebview ? '10px 16px' : '14px 16px',
                                                        background: isSelected ? '#f0ebe3' : '#faf8f3',
                                                    }}
                                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f5f1eb'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? '#f0ebe3' : '#faf8f3'; }}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <div
                                                            className={`rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-150 ${isWebview ? 'w-[16px] h-[16px]' : 'w-[20px] h-[20px]'}`}
                                                            style={{
                                                                borderColor: isSelected ? '#206E55' : '#c8c1b5',
                                                                background: isSelected ? '#206E55' : '#faf8f3',
                                                            }}
                                                        >
                                                            {isSelected && (
                                                                <svg width={isWebview ? '9' : '11'} height={isWebview ? '9' : '11'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-semibold text-[#302e28] leading-snug ${isWebview ? 'text-[12px]' : 'text-[14px]'}`}>{item.description}</div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {item.cptCode && <span className={`text-[#7a756a] ${isWebview ? 'text-[10px]' : 'text-[11px]'}`}>CPT {item.cptCode}</span>}
                                                            {rangeStr && (
                                                                <>
                                                                    <span className={`text-[#c8c1b5] ${isWebview ? 'text-[10px]' : 'text-[11px]'}`}>|</span>
                                                                    <span className={`text-[#7a756a] ${isWebview ? 'text-[10px]' : 'text-[11px]'}`}>typical {rangeStr}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {savings > 0 && (
                                                        <div className={`flex-shrink-0 font-bold whitespace-nowrap tabular-nums ${isWebview ? 'text-[12px]' : 'text-[13px]'}`} style={{ color: group === 'above_average' ? '#d97706' : '#dc2626' }}>
                                                            -{formatCurrency(savings)}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : draft && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease }}
                >
                    <div
                        className="rounded-[16px] px-5 sm:px-7 pt-8 pb-8 overflow-hidden"
                        style={{ background: '#f0ebe3', border: '1px solid #d9d3c8' }}
                    >
                        <div className="mb-4">
                            <div className="text-[11px] text-[#7a756a] mb-1">To: {analysis.provider || '[Provider]'} Billing Department</div>
                            <div className="text-[14px] font-semibold text-[#302e28] pb-3" style={{ borderBottom: '1px solid #d9d3c8' }}>{draft.subject}</div>
                        </div>
                        <pre className="text-[13px] text-[#4E5553] whitespace-pre-wrap font-sans" style={{ lineHeight: 1.7 }}>{draft.body}</pre>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopy}
                            className="flex-1 h-[44px] rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-2 border border-[#d9d3c8] bg-[#faf8f3] hover:bg-[#faf8f3] text-[#302e28]"
                        >
                            {copied ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Copied
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                    Copy
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleMailto}
                            className="flex-1 h-[44px] rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-2 bg-[#206E55] hover:bg-[#185544] text-white"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            Open in Mail
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </>
    );

    const emailCta = (
        <div className="flex-shrink-0">
            {flaggedItems.length > 0 && !showDraft && (
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={selectedItems.length === 0}
                    onClick={handleOpenDraft}
                    className="w-full h-[52px] rounded-full text-[15px] font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    style={{ background: selectedItems.length === 0 ? '#9ab5aa' : '#206E55' }}
                    onMouseEnter={(e) => { if (selectedItems.length > 0) e.currentTarget.style.background = '#185544'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#206E55'; }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    {selectedItems.length === 0 && 'Select charges to draft email'}
                    {selectedItems.length === 1 && 'Draft Email (1 charge)'}
                    {selectedItems.length > 1 && `Draft Email (${selectedItems.length} charges)`}
                </motion.button>
            )}
            {showDraft && !isWebview && (
                <button
                    type="button"
                    onClick={() => setShowDraft(false)}
                    className="w-full h-[52px] rounded-full text-[15px] font-medium transition-all flex items-center justify-center gap-2 border border-[#d9d3c8] bg-[#faf8f3] hover:bg-[#faf8f3] text-[#302e28]"
                >
                    Back to charges
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop: two-column split */}
            <div className="hidden sm:flex h-full">
                {/* Left panel */}
                <div className="w-[42%] h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto px-10 pt-11 pb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease }}
                        >
                            {noIssues ? (
                                <>
                                    <p className="text-[15px] text-[#7a756a] leading-relaxed mb-4">
                                        Your bill of <strong className="text-[#302e28] font-semibold">{formatCurrency(recap.totalCharges)}</strong> was reviewed.
                                    </p>

                                    <div
                                        className="font-bold text-[#206E55] mb-1"
                                        style={{ fontSize: 'clamp(36px, 4vw, 48px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
                                    >
                                        No issues were found
                                    </div>
                                    <div className="text-[14px] font-medium text-[#206E55] mb-10">
                                        All charges appear within typical pricing ranges
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-[#d9d3c8]">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Total billed</span>
                                            <span className="text-[15px] font-semibold text-[#302e28] tabular-nums">{formatCurrency(recap.totalCharges)}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Items reviewed</span>
                                            <span className="text-[15px] font-semibold text-[#302e28] tabular-nums">{recap.totalItems}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Overcharged</span>
                                            <span className="text-[15px] font-semibold text-[#16a34a] tabular-nums">$0</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Items flagged</span>
                                            <span className="text-[15px] font-semibold text-[#16a34a] tabular-nums">0</span>
                                        </div>
                                    </div>

                                    {totalCharges > 0 && (
                                        <div className="mt-8">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-1 h-2 gap-0.5">
                                                    <div className="rounded w-full" style={{ background: '#16a34a' }} />
                                                </div>
                                                {!isWebview && (
                                                    <span className="flex items-center gap-1 text-[12px] text-[#7a756a]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                        <strong className="text-[#302e28] font-bold">{recap.totalItems}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-[15px] text-[#7a756a] leading-relaxed mb-1">
                                        Your bill of <strong className="text-[#302e28] font-semibold">{formatCurrency(recap.totalCharges)}</strong> has potential overcharges.
                                    </p>
                                    <p className="text-[15px] text-[#7a756a] leading-relaxed mb-4">
                                        You could save up to
                                    </p>

                                    <div
                                        className="font-bold text-[#206E55] mb-1"
                                        style={{ fontSize: 'clamp(48px, 5vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1 }}
                                    >
                                        {formatCurrency(recap.potentialSavings)}
                                    </div>
                                    <div className="text-[14px] font-medium text-[#206E55] mb-10">
                                        in recoverable savings
                                    </div>

                                    {/* 2x2 stat grid */}
                                    <div className="space-y-2 pt-4 border-t border-[#d9d3c8]">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Total billed</span>
                                            <span className="text-[15px] font-semibold text-[#302e28] tabular-nums">{formatCurrency(recap.totalCharges)}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Overcharged</span>
                                            <span className="text-[15px] font-semibold text-[#dc2626] tabular-nums">{formatCurrency(recap.flaggedTotal)}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Items reviewed</span>
                                            <span className="text-[15px] font-semibold text-[#302e28] tabular-nums">{recap.totalItems}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[13px] text-[#7a756a]">Items flagged</span>
                                            <span className="text-[15px] font-semibold text-[#302e28] tabular-nums">{flaggedItems.length}</span>
                                        </div>
                                    </div>

                                    {/* Distribution bar + counts inline */}
                                    {totalCharges > 0 && (
                                        <div className="mt-8">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-1 h-2 gap-0.5">
                                                    {redWidth > 0 && <div className="rounded" style={{ width: `${redWidth}%`, background: '#dc2626' }} />}
                                                    {amberWidth > 0 && <div className="rounded" style={{ width: `${amberWidth}%`, background: '#f59e0b' }} />}
                                                    {greenWidth > 0 && <div className="rounded" style={{ width: `${greenWidth}%`, background: '#16a34a' }} />}
                                                </div>
                                                {!isWebview && (
                                                    <div className="flex gap-3 flex-shrink-0">
                                                        {recap.redCount > 0 && (
                                                            <span className="flex items-center gap-1 text-[12px] text-[#7a756a]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                                                                <strong className="text-[#302e28] font-bold">{recap.redCount}</strong>
                                                            </span>
                                                        )}
                                                        {recap.amberCount > 0 && (
                                                            <span className="flex items-center gap-1 text-[12px] text-[#7a756a]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                                                                <strong className="text-[#302e28] font-bold">{recap.amberCount}</strong>
                                                            </span>
                                                        )}
                                                        {recap.greenCount > 0 && (
                                                            <span className="flex items-center gap-1 text-[12px] text-[#7a756a]">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                                <strong className="text-[#302e28] font-bold">{recap.greenCount}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nudge */}
                                    <div className="flex items-center gap-1.5 mt-auto pt-8 text-[13px] text-[#9a958b]">
                                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                                        Select charges on the right to draft your dispute
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* Footer nav */}
                    {!isWebview && (
                        <div className="flex-shrink-0 px-10 pb-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 h-[52px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] text-[14px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Results
                            </button>
                            <button
                                type="button"
                                onClick={handleStartOver}
                                className="flex-1 h-[52px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] text-[14px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Start Over
                            </button>
                        </div>
                    )}
                </div>

                {/* Right panel */}
                <div className="w-[58%] h-full flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease }}
                        className="flex flex-col h-full"
                    >
                        {noIssues ? (
                            <div className="flex items-center justify-between px-9 pt-9 pb-1 flex-shrink-0">
                                <div>
                                    <h3 className="text-[#302e28] font-semibold text-[20px] tracking-tight">Charges Reviewed</h3>
                                    <p className="text-[13px] text-[#7a756a] mt-1">All {items.length} items verified against typical pricing</p>
                                </div>
                            </div>
                        ) : (
                            flaggedItems.length > 0 && (
                                <div className="flex items-center justify-between px-9 pt-9 pb-1 flex-shrink-0">
                                    <div>
                                        <h3 className="text-[#302e28] font-semibold text-[20px] tracking-tight">
                                            {showDraft ? 'Your Draft' : 'Draft Your Dispute'}
                                        </h3>
                                        {!showDraft && (
                                            <p className="text-[13px] text-[#7a756a] mt-1">Select charges to include in your dispute email</p>
                                        )}
                                    </div>
                                    {!showDraft && (
                                        <button
                                            type="button"
                                            onClick={selectAllForEmail}
                                            className="text-[13px] font-semibold text-[#206E55] hover:text-[#185544] transition-colors px-2 py-1 rounded-md hover:bg-[rgba(32,110,85,0.06)]"
                                        >
                                            {selectedForEmail.size === flaggedItems.length ? 'Deselect all' : 'Select all'}
                                        </button>
                                    )}
                                </div>
                            )
                        )}
                        <div className="flex-1 min-h-0 flex flex-col px-9 pt-4 pb-4">
                            <div className="flex-1 min-h-0 overflow-y-auto rounded-[12px] border border-[#d9d3c8] bg-[#faf8f3] p-4">
                                {noIssues ? allItemsContent : chargeListContent}
                            </div>
                        </div>
                        {!noIssues && (
                            <div className="flex-shrink-0 px-9 pb-4">
                                {emailCta}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Mobile: scrollable content + fixed bottom buttons */}
            <div className="sm:hidden px-4 pt-5">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                    >
                        <div className={showDraft ? 'hidden' : ''}>
                            {noIssues ? (
                                <>
                                    <p className="text-[14px] text-[#7a756a] leading-relaxed mb-1">
                                        Your bill of <strong className="text-[#302e28] font-semibold">{formatCurrency(recap.totalCharges)}</strong> was reviewed.
                                    </p>
                                    <div className="text-[28px] font-bold text-[#206E55] tracking-tight leading-tight mt-2 mb-1">
                                        No issues were found
                                    </div>
                                    <div className="text-[13px] font-medium text-[#206E55] mb-5">
                                        All charges appear within typical pricing ranges
                                    </div>

                                    <div className={`flex mb-5 ${isWebview ? '' : 'border-t-2 border-[#302e28]'}`}>
                                        <div className={`flex-1 py-3 pr-4 ${isWebview ? '' : 'border-b border-r border-[#d9d3c8]'}`}>
                                            <div className="text-[18px] font-bold text-[#302e28] tabular-nums">{formatCurrency(recap.totalCharges)}</div>
                                            <div className="text-[11px] text-[#7a756a]">Total billed</div>
                                        </div>
                                        <div className={`flex-1 py-3 pl-4 ${isWebview ? '' : 'border-b border-[#d9d3c8]'}`}>
                                            <div className="text-[18px] font-bold text-[#302e28] tabular-nums">{recap.totalItems}</div>
                                            <div className="text-[11px] text-[#7a756a]">Items reviewed</div>
                                        </div>
                                    </div>

                                    {totalCharges > 0 && (
                                        <div className={`flex items-center gap-3 ${isWebview ? 'mb-5' : 'pb-5 mb-5 border-b border-[#d9d3c8]'}`}>
                                            <div className="flex flex-1 h-1.5 gap-0.5">
                                                <div className="rounded w-full" style={{ background: '#16a34a' }} />
                                            </div>
                                            {!isWebview && (
                                                <span className="flex items-center gap-1 text-[11px] text-[#7a756a]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                    <strong className="text-[#302e28] font-bold">{recap.totalItems}</strong>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-[14px] text-[#7a756a] leading-relaxed mb-1">
                                        Your bill of <strong className="text-[#302e28] font-semibold">{formatCurrency(recap.totalCharges)}</strong> has potential overcharges. You could save up to
                                    </p>
                                    <div className="text-[36px] font-bold text-[#206E55] tracking-tight leading-none mt-2 mb-1">
                                        {formatCurrency(recap.potentialSavings)}
                                    </div>
                                    <div className="text-[13px] font-medium text-[#206E55] mb-5">
                                        in recoverable savings
                                    </div>

                                    <div className={`flex mb-5 ${isWebview ? '' : 'border-t-2 border-[#302e28]'}`}>
                                        <div className={`flex-1 py-3 pr-4 ${isWebview ? '' : 'border-b border-r border-[#d9d3c8]'}`}>
                                            <div className="text-[18px] font-bold text-[#302e28] tabular-nums">{formatCurrency(recap.totalCharges)}</div>
                                            <div className="text-[11px] text-[#7a756a]">Total billed</div>
                                        </div>
                                        <div className={`flex-1 py-3 pl-4 ${isWebview ? '' : 'border-b border-[#d9d3c8]'}`}>
                                            <div className="text-[18px] font-bold text-[#dc2626] tabular-nums">{formatCurrency(recap.flaggedTotal)}</div>
                                            <div className="text-[11px] text-[#7a756a]">Overcharged</div>
                                        </div>
                                    </div>

                                    {totalCharges > 0 && (
                                        <div className={`flex items-center gap-3 ${isWebview ? 'mb-5' : 'pb-5 mb-5 border-b border-[#d9d3c8]'}`}>
                                            <div className="flex flex-1 h-1.5 gap-0.5">
                                                {redWidth > 0 && <div className="rounded" style={{ width: `${redWidth}%`, background: '#dc2626' }} />}
                                                {amberWidth > 0 && <div className="rounded" style={{ width: `${amberWidth}%`, background: '#f59e0b' }} />}
                                                {greenWidth > 0 && <div className="rounded" style={{ width: `${greenWidth}%`, background: '#16a34a' }} />}
                                            </div>
                                            {!isWebview && (
                                                <div className="flex gap-2 flex-shrink-0">
                                                    {recap.redCount > 0 && (
                                                        <span className="flex items-center gap-1 text-[11px] text-[#7a756a]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                                                            <strong className="text-[#302e28] font-bold">{recap.redCount}</strong>
                                                        </span>
                                                    )}
                                                    {recap.amberCount > 0 && (
                                                        <span className="flex items-center gap-1 text-[11px] text-[#7a756a]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                                                            <strong className="text-[#302e28] font-bold">{recap.amberCount}</strong>
                                                        </span>
                                                    )}
                                                    {recap.greenCount > 0 && (
                                                        <span className="flex items-center gap-1 text-[11px] text-[#7a756a]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                                                            <strong className="text-[#302e28] font-bold">{recap.greenCount}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>

                    {noIssues ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25, ease }}
                        >
                            <div className="mb-3">
                                <h3 className="text-[#302e28] font-semibold text-[16px]">Charges Reviewed</h3>
                                <p className="text-[12px] text-[#7a756a] mt-0.5">All {items.length} items verified against typical pricing</p>
                            </div>
                            <div className="rounded-[12px] border border-[#d9d3c8] bg-[#faf8f3] overflow-hidden">
                                {allItemsContent}
                            </div>
                        </motion.div>
                    ) : flaggedItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25, ease }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[#302e28] font-semibold text-[16px]">
                                    {showDraft ? 'Your Draft' : 'Draft Your Dispute'}
                                </h3>
                                {!showDraft && (
                                    <button type="button" onClick={selectAllForEmail} className="text-[12px] font-medium text-[#206E55] hover:text-[#185544] transition-colors">
                                        {selectedForEmail.size === flaggedItems.length ? 'Deselect all' : 'Select all'}
                                    </button>
                                )}
                            </div>
                            {showDraft ? (
                                chargeListContent
                            ) : (
                                <div className="rounded-[12px] border border-[#d9d3c8] bg-[#faf8f3] overflow-hidden p-4">
                                    {chargeListContent}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Mobile bottom buttons — in normal flow */}
                    <div className="space-y-2 mt-4 pb-8">
                        {!noIssues && <div>{emailCta}</div>}
                        {!isWebview && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 h-[44px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] text-[13px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-all flex items-center justify-center gap-1.5"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Back to Results
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartOver}
                                    className="flex-1 h-[44px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] text-[13px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-all flex items-center justify-center gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Start Over
                                </button>
                            </div>
                        )}
                    </div>
                </div>
        </>
    );
}
