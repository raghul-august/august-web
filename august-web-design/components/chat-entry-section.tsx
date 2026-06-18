'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ShieldCheck, Stethoscope } from 'lucide-react';
import { track } from '@/services/analytics-service';

interface ChatEntrySectionProps {
    source?: string;
    suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
    'I have a headache that won’t go away',
    'Help me read my lab results',
    'Is this medication safe for me?',
];

export function ChatEntrySection({ source, suggestions = DEFAULT_SUGGESTIONS }: ChatEntrySectionProps) {
    const router = useRouter();
    const [text, setText] = useState('');

    const navigateToChat = (msg: string) => {
        const trimmed = msg.trim();
        if (!trimmed) return;
        const params = new URLSearchParams({ msg: trimmed });
        if (source) params.set('src', source);
        router.push(`/chat?${params.toString()}`);
    };

    const handleSubmit = () => navigateToChat(text);
    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <section
            className="w-full px-4 py-10 md:py-14"
            style={{ background: '#f5f1e8' }}
        >
            <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/70 border border-white text-[10px] tracking-wider text-[#4d8b77] font-medium mb-4">
                    100% USMLE SCORE
                </div>
                <h2
                    className="font-serif font-medium tracking-tight text-[#4d8b77] leading-tight text-3xl md:text-4xl mb-2"
                    style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
                >
                    Hey, I am august.
                    <br />
                    <span className="text-[#4d8b77]/60">Ask me about your health.</span>
                </h2>
                <p className="text-sm text-[#6b6860] mt-2 max-w-md mx-auto">
                    I’m trained by doctors, I remember your health, and I’m here whenever you need me.
                </p>

                <div
                    className="mt-6 text-left rounded-2xl bg-white p-4 md:p-5"
                    style={{
                        boxShadow: '0 2px 8px rgba(42, 42, 36, 0.04), 0 8px 24px rgba(42, 42, 36, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask anything"
                        rows={2}
                        className="w-full resize-none text-[15px] text-[#302e28] placeholder:text-[#a09a8e] focus:outline-none bg-transparent"
                    />
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4d8b77] hover:bg-[#3d7a67] active:scale-[0.97] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Ask august
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => navigateToChat(s)}
                            className="text-xs md:text-sm text-[#4d5a57] bg-white/70 hover:bg-white border border-white rounded-full px-3 py-1.5 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[#8a9390]">
                    <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        HIPAA secure
                    </span>
                    <span className="text-[#cac6bc]">|</span>
                    <span className="inline-flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" />
                        Built by doctors
                    </span>
                </div>
            </div>
        </section>
    );
}
