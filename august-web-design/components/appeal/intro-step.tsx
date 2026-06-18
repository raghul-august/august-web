'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface IntroStepProps {
    onProceed: () => void;
}

export function IntroStep({ onProceed }: IntroStepProps) {
    return (
        <div className="max-w-lg mx-auto px-5 pt-8 pb-6 flex flex-col h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-8"
            >
                <h1
                    className="text-[#1a1a18] mb-5"
                    style={{
                        fontSize: 'clamp(2rem, 7vw, 2.75rem)',
                        fontWeight: 500,
                        lineHeight: 1.08,
                        letterSpacing: '-0.025em',
                    }}
                >
                    Let&apos;s fight your appeal,
                    <br />
                    <span className="italic text-[#4d8b77]">together</span>
                </h1>
                <p
                    className="text-[#5c5a52] text-[15px] leading-relaxed max-w-md"
                >
                    Upload your documents and I&apos;ll build a professional, evidence-backed appeal ready to send.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="w-full rounded-[20px] overflow-hidden mb-6"
            >
                <Image
                    src="/appeal-assistant-hero.webp"
                    alt=""
                    width={430}
                    height={280}
                    sizes="(max-width: 430px) 100vw, 430px"
                    quality={100}
                    priority
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 280,
                        objectFit: 'cover',
                        objectPosition: 'center 40%',
                        display: 'block',
                        aspectRatio: '430 / 280',
                    }}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                className="px-1 mb-10"
            >
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#7a756a] font-medium mb-3">What you&apos;ll need</p>

                <div className="flex gap-3 mb-2.5">
                    <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a756a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                        <p className="text-[#302e28] text-[13px] font-medium">Denial Letter</p>
                        <p className="text-[#7a756a] text-[11px] mt-0.5 leading-relaxed">The letter your insurer sent rejecting your claim or procedure.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a756a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <div>
                        <p className="text-[#302e28] text-[13px] font-medium">
                            Supporting Documents
                            <span className="text-[#7a756a] font-normal ml-1">(optional)</span>
                        </p>
                        <p className="text-[#7a756a] text-[11px] mt-0.5 leading-relaxed">Lab results, doctor&apos;s notes, prior authorizations.</p>
                    </div>
                </div>
            </motion.div>

            <div className="flex-1" />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                className="w-full"
            >
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onProceed}
                    className="w-full h-13 rounded-full bg-[#1a1a18] hover:bg-[#302e28] text-white text-[15px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </motion.button>
            </motion.div>

        </div>
    );
}
