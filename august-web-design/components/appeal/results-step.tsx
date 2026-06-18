'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Download, RotateCcw, Mail, Pencil, Check, MessageCircle, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppealStore, type DownloadTokens, type PendingEdits } from '@/stores/appeal-store';
import { useAuthStore } from '@/stores/auth-store';
import { track } from '@/services/analytics-service';
import { downloadUrl, regenerateDocuments } from '@/services/appeal-service';
import logger from '@/utils/logger';
import { toUnicodeBold, toUnicodeItalic } from '@/utils/text-format';

type LetterTab = 'patient' | 'physician';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, isActive: boolean, onClose: () => void): void {
    useEffect(() => {
        if (!isActive) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isActive, ref, onClose]);
}

function resolveLetterPair(patientLetter: string, physicianLetter: string, edits: PendingEdits | null): { patient: string; physician: string } {
    return {
        patient: stripEmDashes(edits?.patient ? applyPlaceholders(patientLetter, edits.patient) : patientLetter),
        physician: stripEmDashes(edits?.physician ? applyPlaceholders(physicianLetter, edits.physician) : physicianLetter),
    };
}

function parseTips(text: string): Array<{ content: string; tip?: string }> {
    const parts: Array<{ content: string; tip?: string }> = [];
    const tipRegex = /<!--\s*tip:\s*(.*?)\s*-->/g;
    let lastIndex = 0;
    let match;

    while ((match = tipRegex.exec(text)) !== null) {
        const before = text.slice(lastIndex, match.index).trim();
        if (before) {
            parts.push({ content: before, tip: match[1] });
        } else if (parts.length > 0) {
            parts[parts.length - 1].tip ??= match[1];
        }
        lastIndex = match.index + match[0].length;
    }

    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
        parts.push({ content: remaining });
    }

    return parts;
}

const BRACKET_PLACEHOLDER = /(\[.*?\])/;

function makeTransformPlaceholders(renderBracket: (part: string, i: number) => ReactNode) {
    function transform(children: ReactNode): ReactNode {
        if (typeof children === 'string') {
            const parts = children.split(BRACKET_PLACEHOLDER);
            if (parts.length === 1) return children;
            return parts.map((part, i) =>
                part.startsWith('[') && part.endsWith(']') ? renderBracket(part, i) : part
            );
        }
        if (Array.isArray(children)) {
            return children.map((child, i) => <span key={i}>{transform(child)}</span>);
        }
        return children;
    }
    return transform;
}

function makeHighlightPlaceholders(filledValues?: Record<string, string>, occurrenceOffsets?: Record<string, number>, occCounts?: Record<string, number>) {
    return makeTransformPlaceholders((part, i) => {
        const counts = occCounts ?? {};
        const localIdx = counts[part] ?? 0;
        counts[part] = localIdx + 1;
        const occIdx = localIdx + (occurrenceOffsets?.[part] ?? 0);
        const filled = filledValues?.[`${part}::${occIdx}`]?.trim() || filledValues?.[part]?.trim();
        if (filled) {
            return <span key={`${part}-${occIdx}`} className="font-medium text-[#4d8b77] bg-[#4d8b77]/5 px-1 rounded">{filled}</span>;
        }
        return <span key={`${part}-${occIdx}`} className="font-medium text-red-600 bg-red-50 px-1 rounded">{part}</span>;
    });
}

function PlaceholderInput({ placeholder, initialValue, occurrence, onInput }: { placeholder: string; initialValue?: string; occurrence: number; onInput?: (v: string) => void }) {
    const label = placeholder.slice(1, -1);
    const spanRef = useRef<HTMLSpanElement>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current && spanRef.current && initialValue) {
            spanRef.current.textContent = initialValue;
        }
        initializedRef.current = true;
    }, [initialValue]);

    return (
        <span
            ref={spanRef}
            role="textbox"
            contentEditable
            suppressContentEditableWarning
            data-placeholder={label}
            data-occurrence={occurrence}
            onInput={(e) => onInput?.((e.target as HTMLSpanElement).textContent || '')}
            className="inline border-b-2 border-[#4d8b77] bg-[#4d8b77]/5 rounded-t-sm px-1 py-0.5 text-[#4d8b77] font-medium focus:outline-none focus:bg-[#4d8b77]/10 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-[#4d8b77]/40"
            style={{ fontSize: 'inherit', lineHeight: 'inherit', minWidth: '3ch' }}
        />
    );
}

function makeEditablePlaceholders(valuesRef: React.RefObject<Record<string, string> | null>, occurrenceOffsets?: Record<string, number>, occCounts?: Record<string, number>) {
    return makeTransformPlaceholders((part, i) => {
        if (!valuesRef.current) return part;
        const counts = occCounts ?? {};
        const localIdx = counts[part] ?? 0;
        counts[part] = localIdx + 1;
        const occIdx = localIdx + (occurrenceOffsets?.[part] ?? 0);
        const compositeKey = `${part}::${occIdx}`;
        const initialValue = valuesRef.current[compositeKey] ?? valuesRef.current[part] ?? '';
        return <PlaceholderInput key={`${part}-${occIdx}`} placeholder={part} occurrence={occIdx} initialValue={initialValue} onInput={(v) => { if (valuesRef.current) valuesRef.current[compositeKey] = v; }} />;
    });
}

function buildMarkdownComponents(transform: (children: ReactNode) => ReactNode): Components {
    return {
        p: ({ children }) => <p>{transform(children)}</p>,
        li: ({ children, className, ...props }) => (
            <li className={className?.includes('task-list-item') ? 'list-disc' : className} {...props}>
                {transform(children)}
            </li>
        ),
        input: () => null,
        strong: ({ children }) => <strong>{transform(children)}</strong>,
        em: ({ children }) => <em>{transform(children)}</em>,
        td: ({ children }) => <td>{transform(children)}</td>,
    };
}

const defaultMarkdownComponents = buildMarkdownComponents(makeHighlightPlaceholders());


function InfoIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4d8b77]">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}

function InsightBubble({ tip }: { tip: string }) {
    const [open, setOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useClickOutside(ref, open, () => setOpen(false));

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUp(spaceBelow < 160);
        }
        setOpen(!open);
    };

    return (
        <span ref={ref} className="relative inline-block">
            <button
                ref={btnRef}
                onClick={handleToggle}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#4d8b77]/15 hover:bg-[#4d8b77]/25 transition-colors"
                aria-label="Show insight"
            >
                <InfoIcon size={20} />
            </button>
            {open && (
                <div className={`absolute right-0 z-50 w-64 bg-[#F0F7F4] border border-[#4d8b77]/15 rounded-lg shadow-lg px-3 py-2.5 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                    <p className="text-xs text-[#4E5553] leading-relaxed">{tip}</p>
                </div>
            )}
        </span>
    );
}

type LetterSectionProps = {
    content: string;
    tip?: string;
    isEditing?: boolean;
    placeholderValuesRef?: React.RefObject<Record<string, string>>;
    filledValues?: Record<string, string>;
    occurrenceOffsets?: Record<string, number>;
};

function LetterSection({ content, tip, isEditing, placeholderValuesRef, filledValues, occurrenceOffsets }: LetterSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [iconTop, setIconTop] = useState(0);
    const occCounts = useRef<Record<string, number>>({});
    // reset each render so occurrence indices start fresh when ReactMarkdown re-invokes transforms
    for (const k in occCounts.current) delete occCounts.current[k];

    const components = useMemo(() => {
        if (isEditing && placeholderValuesRef) return buildMarkdownComponents(makeEditablePlaceholders(placeholderValuesRef, occurrenceOffsets, occCounts.current));
        if (filledValues) return buildMarkdownComponents(makeHighlightPlaceholders(filledValues, occurrenceOffsets, occCounts.current));
        return defaultMarkdownComponents;
    }, [isEditing, placeholderValuesRef, filledValues, occurrenceOffsets]);

    useEffect(() => {
        if (!tip || !sectionRef.current) return;
        const heading = sectionRef.current.querySelector('h2, h3');
        if (heading) {
            const sectionRect = sectionRef.current.getBoundingClientRect();
            const headingRect = heading.getBoundingClientRect();
            setIconTop(headingRect.top - sectionRect.top + (headingRect.height - 32) / 2);
        }
    }, [content, tip]);

    return (
        <div ref={sectionRef} className={`relative ${tip ? 'pr-10' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content.replaceAll('[', '\\[')}
            </ReactMarkdown>
            {tip && (
                <div className="absolute right-0" style={{ top: iconTop }}>
                    <InsightBubble tip={tip} />
                </div>
            )}
        </div>
    );
}

function stripEmDashes(text: string): string {
    return text.replaceAll('\u2014', '-').replaceAll('\u2013', '-');
}

function fieldKeyLabel(fk: string): string {
    const sep = fk.lastIndexOf('::');
    return sep !== -1 ? fk.slice(1, sep - 1) : fk.slice(1, -1);
}

function FieldNavBar({ fieldKeys, activeFieldIndex, onNavigate, isFilled }: { fieldKeys: string[]; activeFieldIndex: number; onNavigate: (i: number) => void; isFilled: (key: string) => boolean }) {
    const label = fieldKeyLabel(fieldKeys[activeFieldIndex] ?? '') || '';
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv || !barRef.current) return;
        const update = () => {
            if (!barRef.current) return;
            barRef.current.style.top = `${vv.offsetTop + vv.height}px`;
        };
        update();
        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);
        return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
    }, []);

    return (
        <div ref={barRef} onMouseDown={(e) => e.preventDefault()} onTouchEnd={(e) => e.stopPropagation()} className="fixed left-0 right-0 z-20 -translate-y-full px-3.5 py-2 flex items-center gap-2.5 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] backdrop-blur-md select-none sm:hidden" style={{ background: 'rgba(237,234,227,0.95)', borderTop: '1px solid rgba(48,46,40,0.15)' }}>
            <div className="flex gap-1.5">
                <button type="button" tabIndex={-1} onTouchEnd={(e) => { e.preventDefault(); onNavigate((activeFieldIndex - 1 + fieldKeys.length) % fieldKeys.length); }} onClick={() => onNavigate((activeFieldIndex - 1 + fieldKeys.length) % fieldKeys.length)} className="w-9 h-9 flex items-center justify-center bg-[#302e28]/10 rounded-lg hover:bg-[#302e28]/18 text-[#302e28] transition-colors">
                    <ChevronUp className="h-5 w-5" />
                </button>
                <button type="button" tabIndex={-1} onTouchEnd={(e) => { e.preventDefault(); onNavigate((activeFieldIndex + 1) % fieldKeys.length); }} onClick={() => onNavigate((activeFieldIndex + 1) % fieldKeys.length)} className="w-9 h-9 flex items-center justify-center bg-[#302e28]/10 rounded-lg hover:bg-[#302e28]/18 text-[#302e28] transition-colors">
                    <ChevronDown className="h-5 w-5" />
                </button>
            </div>
            <div className="flex-1 text-[13px] font-medium text-[#302e28] truncate">{label}</div>
            <div className="text-[11px] text-[#4E5553] font-medium whitespace-nowrap">{activeFieldIndex + 1} / {fieldKeys.length}</div>
        </div>
    );
}

function applyPlaceholders(letter: string, values: Record<string, string>): string {
    let result = letter;
    const positional: Record<string, string[]> = {};
    const plain: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
        if (!val.trim()) continue;
        const sep = key.lastIndexOf('::');
        if (sep !== -1) {
            const base = key.slice(0, sep);
            const idx = parseInt(key.slice(sep + 2), 10);
            if (!positional[base]) positional[base] = [];
            positional[base][idx] = val.trim();
        } else {
            plain[key] = val.trim();
        }
    }
    for (const [base, vals] of Object.entries(positional)) {
        let occ = 0;
        result = result.replace(new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => {
            const replacement = vals[occ];
            occ++;
            return replacement ?? match;
        });
    }
    for (const [key, val] of Object.entries(plain)) {
        if (!(key in positional)) result = result.replaceAll(key, val);
    }
    return result;
}

function hasUnfilledPlaceholders(letter: string, edits?: Record<string, string>): boolean {
    const resolved = edits ? applyPlaceholders(letter, edits) : letter;
    const cleaned = resolved.replace(/<!--\s*tip:.*?-->/g, '');
    return /\[[a-zA-Z].*?\]/.test(cleaned);
}

function formatLetterAsPlainText(text: string): string {
    let c = text.replace(/<!--\s*tip:.*?-->/g, '');
    c = stripEmDashes(c);
    c = c.replace(/^#{1,3}\s*(.+)$/gm, (_m, heading) => `\n\n${toUnicodeBold(heading)}\n`);
    c = c.replace(/\*\*(.+?)\*\*/g, (_m, bold) => toUnicodeBold(bold));
    c = c.replace(/\*(.+?)\*/g, (_m, italic) => toUnicodeItalic(italic));
    c = c.replace(/^[-*]\s+/gm, '\u2022 '); // bullet character
    c = c.replace(/^---+$/gm, '\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n');
    c = c.replace(/\n{4,}/g, '\n\n\n');
    return c.trim();
}

const TAB_HINTS: Record<LetterTab, string> = {
    patient: 'This letter explains your medical situation, why the denial is incorrect, and cites clinical guidelines supporting your case.',
    physician: 'Insurers highly value physician appeals, and a clear statement from your doctor can strengthen your case.',
};

const stagger = {
    initial: { opacity: 0, y: 16 },
    animate: (delay: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const, delay },
    }),
};

export function ResultsStep() {
    const [activeTab, setActiveTab] = useState<LetterTab>('patient');
    const [isEditing, setIsEditing] = useState(false);
    const [fieldKeys, setFieldKeys] = useState<string[]>([]);
    const [activeFieldIndex, setActiveFieldIndex] = useState(0);
    const placeholderValuesRef = useRef<Record<string, string>>({});
    const letterCardRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const skipNextFieldEffect = useRef(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ kind: 'pdf' | 'docx' | 'email' } | null>(null);
    const [emailDisclaimer, setEmailDisclaimer] = useState(false);
    const [downloadToast, setDownloadToast] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const downloadRef = useRef<HTMLDivElement>(null);
    const regenPromiseRef = useRef<Promise<{ downloadTokens: DownloadTokens }> | null>(null);

    useClickOutside(downloadRef, showDownloadOptions, useCallback(() => setShowDownloadOptions(false), []));
    const { patientLetter, physicianLetter, downloadTokens, reset, hasBeenEdited, setAnnotatedLetters, setHasBeenEdited, setDownloadTokens, pendingEdits, setPendingEdits, runId } = useAppealStore();
    const getAccessToken = useAuthStore((s) => s.getAccessToken);

    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const container = document.querySelector('[data-scroll-container]') as HTMLElement | null;
        scrollContainerRef.current = container;
        const target = container || window;
        const onScroll = () => {
            const scrollY = container ? container.scrollTop : window.scrollY;
            const cardScrollY = letterCardRef.current?.scrollTop ?? 0;
            setShowScrollTop(scrollY > 400 || cardScrollY > 300);
        };
        target.addEventListener('scroll', onScroll, { passive: true });
        const card = letterCardRef.current;
        if (card) card.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            target.removeEventListener('scroll', onScroll);
            if (card) card.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        if (!isEditing || fieldKeys.length === 0 || !letterCardRef.current) return;
        if (skipNextFieldEffect.current) { skipNextFieldEffect.current = false; return; }
        const compositeKey = fieldKeys[activeFieldIndex];
        if (!compositeKey) return;
        const sep = compositeKey.lastIndexOf('::');
        const label = sep !== -1 ? compositeKey.slice(1, sep - 1) : compositeKey.slice(1, -1);
        const occurrenceIndex = sep !== -1 ? parseInt(compositeKey.slice(sep + 2), 10) : 0;
        const container = letterCardRef.current;
        const allWithLabel = container.querySelectorAll(`[data-placeholder="${label}"]`);
        const el = (allWithLabel[occurrenceIndex] ?? allWithLabel[0]) as HTMLElement | null;
        if (!el) return;

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const navbarHeight = 52;
        const visibleHeight = container.clientHeight - navbarHeight;
        const offsetInContainer = elRect.top - containerRect.top + container.scrollTop;
        const targetScroll = offsetInContainer - visibleHeight * 0.33;
        container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });

        el.focus({ preventScroll: true });

        el.classList.add('ring-2', 'ring-[#302e28]/30', 'ring-offset-1');
        const timer = setTimeout(() => el.classList.remove('ring-2', 'ring-[#302e28]/30', 'ring-offset-1'), 1200);
        return () => clearTimeout(timer);
    }, [activeFieldIndex, isEditing, fieldKeys]);

    const rawLetter = activeTab === 'patient' ? patientLetter : physicianLetter;
    const currentLetter = stripEmDashes(rawLetter);
    const tabEdits = pendingEdits?.[activeTab];
    const resolvedLetter = tabEdits ? applyPlaceholders(currentLetter, tabEdits) : currentLetter;
    const sections = parseTips(currentLetter);

    const sectionOffsets = useMemo(() => {
        const offsets: Record<string, number>[] = [];
        const running: Record<string, number> = {};
        for (const section of sections) {
            offsets.push({ ...running });
            const matches = section.content.match(/\[[^\[\]]+\]/g) || [];
            for (const m of matches) running[m] = (running[m] ?? 0) + 1;
        }
        return offsets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLetter]);

    function getResolvedLetter(): string {
        if (isEditing) {
            const domEdits = collectEditsFromDOM();
            return applyPlaceholders(currentLetter, domEdits);
        }
        return resolvedLetter;
    }

    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;

    function collectEditsFromDOM(): Record<string, string> {
        if (!letterCardRef.current) return {};
        const edits: Record<string, string> = {};
        const occCounts: Record<string, number> = {};
        letterCardRef.current.querySelectorAll('[data-placeholder]').forEach((el) => {
            const base = `[${el.getAttribute('data-placeholder')}]`;
            const idx = occCounts[base] ?? 0;
            occCounts[base] = idx + 1;
            const value = (el as HTMLElement).textContent || '';
            edits[`${base}::${idx}`] = value;
        });
        return edits;
    }

    function finishEditing() {
        // merge ref values (kept in sync via onInput) with DOM collection as fallback
        const domEdits = collectEditsFromDOM();
        const refEdits = placeholderValuesRef.current ?? {};
        const edited = { ...domEdits };
        for (const [k, v] of Object.entries(refEdits)) if (v && !edited[k]) edited[k] = v;
        const hasValues = Object.values(edited).some((v) => v.trim());
        const prev = useAppealStore.getState().pendingEdits ?? {};
        const replaced = { ...prev, [activeTab]: edited };
        setPendingEdits(replaced);
        if (hasValues) setHasBeenEdited(true);
        setIsEditing(false);
        placeholderValuesRef.current = {};
    }

    function handleToggleEdit() {
        if (isEditing) {
            finishEditing();
            setFieldKeys([]);
            // scroll back up to show download/share actions
            requestAnimationFrame(() => {
                actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        } else {
            const matches = currentLetter.match(/\[[^\[\]]+\]/g) || [];
            const occCounts: Record<string, number> = {};
            const allKeys: string[] = [];
            for (const m of matches) {
                const idx = occCounts[m] ?? 0;
                occCounts[m] = idx + 1;
                allKeys.push(`${m}::${idx}`);
            }
            // build initial values — restore previously saved edits per occurrence
            const initial: Record<string, string> = {};
            for (const ck of allKeys) initial[ck] = tabEdits?.[ck] ?? '';
            placeholderValuesRef.current = initial;
            skipNextFieldEffect.current = true;
            flushSync(() => {
                setIsEditing(true);
                setActiveFieldIndex(0);
            });
            // scan DOM for ALL rendered placeholders in DOM order
            requestAnimationFrame(() => {
                if (!letterCardRef.current) { setFieldKeys(allKeys); return; }
                const domPlaceholders = letterCardRef.current.querySelectorAll('[data-placeholder]');
                const domKeys: string[] = [];
                const domOccCounts: Record<string, number> = {};
                domPlaceholders.forEach((el) => {
                    const base = `[${el.getAttribute('data-placeholder')}]`;
                    const idx = domOccCounts[base] ?? 0;
                    domOccCounts[base] = idx + 1;
                    domKeys.push(`${base}::${idx}`);
                });
                setFieldKeys(domKeys.length > 0 ? domKeys : allKeys);
            });
            const container = letterCardRef.current;
            if (container) {
                const wrapper = container.closest('[data-letter-wrapper]') || container;
                const rect = wrapper.getBoundingClientRect();
                if (rect.top < 0 || rect.top >= window.innerHeight * 0.6) {
                    wrapper.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
                }
                const firstLabel = matches[0]?.slice(1, -1);
                if (firstLabel) {
                    setTimeout(() => {
                        const el = container.querySelector(`[data-placeholder="${firstLabel}"]`) as HTMLElement | null;
                        if (el) el.focus({ preventScroll: true });
                    }, 350);
                }
            }
        }
    }

    function switchTab(tab: LetterTab): void {
        if (tab === activeTab) return;
        if (isEditing) { finishEditing(); setFieldKeys([]); }
        setActiveTab(tab);
        setActiveFieldIndex(0);
    }

    const executeDownload = async (type: 'pdf' | 'docx') => {
        const label = type.toUpperCase();
        flushSync(() => setDownloadToast(`Preparing ${label}...`));
        await new Promise((r) => requestAnimationFrame(r));

        try {
            // If user is mid-edit (hasn't clicked checkmark), flush DOM edits to store
            if (isEditing) { finishEditing(); setFieldKeys([]); }
            let tokens = downloadTokens;
            const edited = useAppealStore.getState().hasBeenEdited;
            if (edited && !isRegenerating) {
                setIsRegenerating(true);
                try {
                    let result: { downloadTokens: DownloadTokens };
                    if (regenPromiseRef.current) {
                        result = await regenPromiseRef.current;
                    } else {
                        const pe = useAppealStore.getState().pendingEdits;
                        const { patient, physician } = resolveLetterPair(patientLetter, physicianLetter, pe);
                        result = await regenerateDocuments(patient, physician, runId);
                    }
                    regenPromiseRef.current = null;
                    tokens = result.downloadTokens;
                    setDownloadTokens(tokens);
                } catch (err) {
                    regenPromiseRef.current = null;
                    logger.error('Failed to regenerate documents', { error: String(err) });
                    setDownloadToast(null);
                    return;
                } finally {
                    setIsRegenerating(false);
                }
            }
            if (!tokens) { setDownloadToast(null); return; }
            const tokenKey = activeTab === 'patient'
                ? (type === 'pdf' ? 'patientPdf' : 'patientDocx')
                : (type === 'pdf' ? 'physicianPdf' : 'physicianDocx');
            track('appeal_document_downloaded', { type, letter: activeTab });

            const token = getAccessToken();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const fileUrl = downloadUrl(tokens[tokenKey]);

            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    source: 'appeal-assistant',
                    type: 'DOWNLOAD_FILE',
                    url: `${window.location.origin}${fileUrl}`,
                    filename: `appeal-letter.${type}`,
                    authorization: token ? `Bearer ${token}` : undefined,
                }));
                setTimeout(() => setDownloadToast(null), 5000);
                return;
            }

            const res = await fetch(fileUrl, { headers, credentials: 'include' });
            if (!res.ok) {
                logger.error('Download failed', { status: res.status });
                setDownloadToast(null);
                return;
            }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `appeal-letter.${type}`;
            a.click();
            URL.revokeObjectURL(blobUrl);
            setTimeout(() => setDownloadToast(null), 5000);
        } catch (err) {
            logger.error('Download error', { error: String(err) });
            setTimeout(() => setDownloadToast(null), 1000);
        }
    };

    const handleDownload = (type: 'pdf' | 'docx') => {
        if (hasUnfilledPlaceholders(currentLetter, tabEdits)) {
            setPendingAction({ kind: type });
            return;
        }
        executeDownload(type);
    };

    const executeEmailAction = () => {
const letterLabel = activeTab === 'patient' ? 'Appeal Letter From You' : 'Appeal Letter From Your Doctor';
        const plainText = formatLetterAsPlainText(getResolvedLetter());
        const body = encodeURIComponent(plainText.replace(/\n/g, '\r\n'));
        const subject = encodeURIComponent(`${letterLabel} - Insurance Denial Appeal`);
        track('appeal_email_opened', { letter: activeTab });
        window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    };

    const handleEmail = () => {
        if (hasUnfilledPlaceholders(currentLetter, tabEdits)) {
            setPendingAction({ kind: 'email' });
            return;
        }
        setEmailDisclaimer(true);
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        const action = pendingAction;
        setPendingAction(null);
        if (action.kind === 'email') {
            setEmailDisclaimer(true);
        } else {
            await new Promise((r) => requestAnimationFrame(r));
            await executeDownload(action.kind);
        }
    };

    const handleStartOver = () => {
        track('appeal_start_over');
        reset();
    };

    return (
        <div className="space-y-3 px-6 px-1 pb-8 overflow-x-hidden">
            {downloadToast && (
                <div className="fixed left-1/2 -translate-x-1/2 z-50 bg-[#1a1a18] text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2 duration-200" style={{ top: 'calc(env(safe-area-inset-top, 16px) + 12px)' }}>
                    {downloadToast}
                </div>
            )}

            {/* Title */}
            <motion.div
                className="text-center space-y-2"
                initial={stagger.initial}
                animate={stagger.animate(0)}
            >
                <h1
                    className="text-[#1a1a18]"
                    style={{
                        fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                        fontWeight: 500,
                        lineHeight: 1.08,
                        letterSpacing: '-0.025em',
                    }}
                >
                    Your appeal is ready.<br />
                </h1>
            </motion.div>

            {/* Tab toggle */}
            <motion.div
                className="flex gap-3"
                initial={stagger.initial}
                animate={stagger.animate(0)}
            >
                <button
                    onClick={() => switchTab('patient')}
                    className={`h-11 flex-1 text-[13px] rounded-full transition-all duration-200 whitespace-nowrap border ${
                        activeTab === 'patient'
                            ? 'font-semibold text-[#1a1a18] border-[#1a1a18] border-2'
                            : 'font-medium text-[#4E5553] hover:bg-[#1a1a18]/5 border-[#d4d1cb]'
                    }`}
                >
                    Letter From You
                </button>
                <button
                    onClick={() => switchTab('physician')}
                    className={`h-11 flex-1 text-[13px] rounded-full transition-all duration-200 whitespace-nowrap border ${
                        activeTab === 'physician'
                            ? 'font-semibold text-[#1a1a18] border-[#1a1a18] border-2'
                            : 'font-medium text-[#4E5553] hover:bg-[#1a1a18]/5 border-[#d4d1cb]'
                    }`}
                >
                    Letter From Your Doctor
                </button>
            </motion.div>

            {/* Tab hint */}
            <motion.p
                className="text-xs text-[#6b6860] text-center max-w-md mx-auto leading-relaxed"
                initial={stagger.initial}
                animate={stagger.animate(0.06)}
            >
                {TAB_HINTS[activeTab]}
            </motion.p>

            {/* Unfilled placeholders warning */}
            {pendingAction && (
                <motion.div
                    className="rounded-[20px] px-5 py-4 text-sm border"
                    style={{
                        background: 'rgba(255,251,235,0.88)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderColor: 'rgba(253,230,138,0.6)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(42,42,36,0.08)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                >
                    <p className="text-amber-800">
                        This letter still has unfilled placeholders like <span className="font-medium">[TO BE ADDED]</span>.{' '}
                        {pendingAction.kind === 'email' ? 'Send anyway?' : 'Download anyway?'}
                    </p>
                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={confirmAction}
                            size="sm"
                            className="h-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
                        >
                            {pendingAction.kind === 'email' ? 'Send Email' : `Download ${pendingAction.kind.toUpperCase()}`}
                        </Button>
                        <Button
                            onClick={() => setPendingAction(null)}
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full text-amber-700 text-xs px-4"
                        >
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}

            {emailDisclaimer && (
                <motion.div
                    className="rounded-[20px] px-5 py-4 text-sm border"
                    style={{
                        background: 'rgba(239,246,255,0.88)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderColor: 'rgba(147,197,253,0.6)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(42,42,36,0.08)',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                >
                    <p className="text-blue-800">
                        Remember to attach all supporting documents referenced in this letter (denial letter, medical records, clinical guidelines, doctor&apos;s notes) before sending.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={() => { setEmailDisclaimer(false); executeEmailAction(); }}
                            size="sm"
                            className="h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
                        >
                            Open Email
                        </Button>
                        <Button
                            onClick={() => setEmailDisclaimer(false)}
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full text-blue-700 text-xs px-4"
                        >
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Letter content — glassmorphism card */}
            <motion.div
                className="relative"
                data-letter-wrapper
                initial={stagger.initial}
                animate={stagger.animate(0.28)}
            >
                {isEditing && fieldKeys.length > 0 && (
                    <>
                        <div className="hidden sm:flex items-center gap-1.5 mb-2">
                            <button type="button" onClick={() => setActiveFieldIndex((activeFieldIndex - 1 + fieldKeys.length) % fieldKeys.length)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-[#6b6860] hover:bg-white/90 transition-colors border border-white/60">
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setActiveFieldIndex((activeFieldIndex + 1) % fieldKeys.length)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-[#6b6860] hover:bg-white/90 transition-colors border border-white/60">
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <span className="text-[13px] font-medium text-[#302e28] truncate max-w-[180px]">{fieldKeyLabel(fieldKeys[activeFieldIndex] ?? '')}</span>
                            <span className="text-[11px] text-[#4E5553] font-medium">{activeFieldIndex + 1}/{fieldKeys.length}</span>
                        </div>
                        <FieldNavBar
                            fieldKeys={fieldKeys}
                            activeFieldIndex={activeFieldIndex}
                            onNavigate={setActiveFieldIndex}
                            isFilled={(key) => {
                                const sep = key.lastIndexOf('::');
                                if (sep === -1 || !letterCardRef.current) return !!(tabEdits?.[key]?.trim());
                                const label = key.slice(1, sep - 1);
                                const occIdx = parseInt(key.slice(sep + 2), 10);
                                const el = letterCardRef.current.querySelectorAll(`[data-placeholder="${label}"]`)[occIdx] as HTMLElement | undefined;
                                return !!(el?.textContent?.trim() || tabEdits?.[key]?.trim());
                            }}
                        />
                    </>
                )}

                <div
                    ref={letterCardRef}
                    data-letter-card
                    className={`rounded-[20px] px-4 sm:px-8 pt-10 ${isEditing ? 'pb-[50vh]' : 'pb-10'} max-h-[60vh] overflow-y-auto
                        prose prose-base max-w-none
                        prose-headings:mt-8 prose-headings:mb-3 prose-headings:text-[#302e28]
                        prose-h2:text-lg prose-h2:font-medium prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
                        prose-h3:text-base prose-h3:font-medium
                        prose-p:my-4 prose-p:leading-7 prose-p:text-[#4E5553]
                        prose-strong:text-[#302e28] prose-strong:font-medium
                        prose-ul:my-4 prose-ul:pl-6 prose-li:my-2 prose-li:leading-7
                        prose-hr:my-8 prose-hr:border-gray-200
                        ${isEditing ? 'ring-2 ring-[#4d8b77]/20' : ''}`}
                    style={{
                        background: 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: isEditing ? '1px solid rgba(32,110,85,0.3)' : '1px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 40px rgba(42,42,36,0.08)',
                    }}
                >
                    {sections.map((section, index) => (
                        <LetterSection key={`${activeTab}-${isEditing}-${index}`} content={section.content} tip={isEditing ? undefined : section.tip} isEditing={isEditing} placeholderValuesRef={placeholderValuesRef} filledValues={!isEditing ? tabEdits : undefined} occurrenceOffsets={sectionOffsets[index]} />
                    ))}
                </div>
                <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 items-center">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(formatLetterAsPlainText(getResolvedLetter())).then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            });
                        }}
                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-[#6b6860] hover:bg-white transition-all border border-[#d4d1cb] shadow-sm"
                        aria-label="Copy letter"
                    >
                        {copied ? <Check className="h-4 w-4 text-[#4d8b77]" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleToggleEdit}
                        className={`h-9 w-9 flex items-center justify-center rounded-full transition-all shadow-sm ${
                            isEditing
                                ? 'bg-[#1a1a18] text-white'
                                : 'bg-white/80 backdrop-blur-sm text-[#6b6860] hover:bg-white border border-[#d4d1cb]'
                        }`}
                        aria-label={isEditing ? 'Done editing' : 'Edit letter'}
                    >
                        {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </button>
                </div>
                <button
                    onClick={() => {
                        const el = letterCardRef.current;
                        if (!el) return;
                        const start = el.scrollTop;
                        const startTime = performance.now();
                        const duration = Math.min(1200, 400 + start * 0.4);
                        const ease = (t: number) => 1 - Math.pow(1 - t, 5);
                        const step = (now: number) => {
                            const t = Math.min((now - startTime) / duration, 1);
                            el.scrollTop = start * (1 - ease(t));
                            if (t < 1) requestAnimationFrame(step);
                        };
                        requestAnimationFrame(step);
                    }}
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-[#1a1a18] text-white shadow-lg hover:bg-[#302e28] transition-all duration-300 ${
                        showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            </motion.div>

            {/* Actions — below letter */}
            <motion.div
                ref={actionsRef}
                className="space-y-3"
                initial={stagger.initial}
                animate={stagger.animate(0.20)}
            >
                <div className="grid grid-cols-2 gap-3">
                    <div ref={downloadRef} className="relative">
                        <Button
                            onClick={() => {
                                const opening = !showDownloadOptions;
                                if (opening && isEditing) { finishEditing(); setFieldKeys([]); }
                                setShowDownloadOptions(opening);
                                if (opening && useAppealStore.getState().hasBeenEdited && !isRegenerating && !regenPromiseRef.current) {
                                    const pe = useAppealStore.getState().pendingEdits;
                                    const { patient, physician } = resolveLetterPair(patientLetter, physicianLetter, pe);
                                    const p = regenerateDocuments(patient, physician, runId);
                                    p.catch(() => {}); // handled when awaited in executeDownload
                                    regenPromiseRef.current = p;
                                }
                            }}
                            className="w-full h-12 rounded-full bg-[#1a1a18] hover:bg-[#302e28] active:scale-[0.96] text-white text-sm font-medium transition-all"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        {showDownloadOptions && (
                            <motion.div
                                className="absolute left-0 right-0 bottom-full mb-2 rounded-2xl overflow-hidden border border-[#d4d1cb]"
                                style={{
                                    background: 'rgba(255,255,255,0.92)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                }}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                            >
                                <button
                                    onClick={() => { setShowDownloadOptions(false); handleDownload('pdf'); }}
                                    className="w-full px-4 py-2.5 text-sm text-[#1a1a18] hover:bg-[#efefef] transition-colors text-left"
                                >
                                    PDF
                                </button>
                                <div className="h-px bg-[#d9d9d9]" />
                                <button
                                    onClick={() => { setShowDownloadOptions(false); handleDownload('docx'); }}
                                    className="w-full px-4 py-2.5 text-sm text-[#1a1a18] hover:bg-[#efefef] transition-colors text-left"
                                >
                                    DOCX
                                </button>
                            </motion.div>
                        )}
                    </div>
                    <Button
                        onClick={handleEmail}
                        className="h-12 rounded-full bg-transparent hover:bg-[#1a1a18]/5 active:scale-[0.96] active:bg-[#1a1a18]/8 text-[#4E5553] border border-[#d4d1cb] text-sm font-medium transition-all"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                    </Button>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                className="space-y-4 pt-2 pb-16"
                initial={stagger.initial}
                animate={stagger.animate(0.28)}
            >
                <p className="text-center text-sm text-[#4E5553] font-medium max-w-sm mx-auto">
                    Appeals work. 88% of insurance denials are overturned when patients fight back. You&apos;re doing the right thing.
                </p>
                <p
                    className="text-center text-[#7a756a] max-w-sm mx-auto"
                    style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                    This is a starting point, not legal or medical advice. Always review before sending.
                </p>
                <div className="flex flex-col items-center space-y-3 pt-2">
                    {typeof window !== 'undefined' && !window.ReactNativeWebView && (
                        <Button
                            onClick={() => { track('appeal_talk_to_august'); window.location.href = '/'; }}
                            className="h-10 rounded-full bg-transparent text-[#4E5553] hover:bg-[#1a1a18]/5 border border-[#d4d1cb] active:scale-[0.97] text-sm font-medium px-6 transition-transform"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Talk to August
                        </Button>
                    )}
                    <Button
                        onClick={handleStartOver}
                        variant="outline"
                        className="h-9 rounded-full bg-[#e5e5e5] hover:bg-[#d9d9d9] text-[#302e28] text-sm hover:text-[#302e28] border-transparent hover:border-transparent"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Start Over
                    </Button>
                </div>
            </motion.div>

        </div>
    );
}
