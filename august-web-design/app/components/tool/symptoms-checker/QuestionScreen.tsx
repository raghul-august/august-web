"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import {
  AGE_OPTIONS,
  AgeBand,
  BODY_REGIONS,
  BodyRegion,
  DURATION_OPTIONS,
  DurationValue,
  FACTORS_BY_SYMPTOM,
  RED_FLAGS,
  SEVERITY_OPTIONS,
  SeverityValue,
  SEX_OPTIONS,
  SexValue,
  SimpleOption,
  StepId,
  SYMPTOMS_BY_REGION,
} from "@/app/data/tools/symptoms-checker-questions";
import QuizQuestionScreen from "../shared/QuizQuestionScreen";

interface BaseProps {
  step: StepId;
  currentIndex: number;
  totalQuestions: number;
  region: BodyRegion | undefined;
  symptom: string | undefined;
  factorsSelected: string[];
  redFlagsSelected: string[];
  selectedFor: {
    sex?: SexValue;
    age?: AgeBand;
    region?: BodyRegion;
    symptom?: string;
    duration?: DurationValue;
    severity?: SeverityValue;
  };
  onSingleAnswer: (step: StepId, value: string) => void;
  onToggleFactor: (value: string) => void;
  onSubmitFactors: () => void;
  onToggleRedFlag: (value: string) => void;
  onSubmitRedFlags: () => void;
  onBack: () => void;
}

const QUESTION_COPY: Record<StepId, { preamble: string; text: string }> = {
  sex: { preamble: "About you", text: "What was your sex assigned at birth?" },
  age: { preamble: "About you", text: "How old are you?" },
  region: { preamble: "Your symptom", text: "Where is your main symptom coming from?" },
  symptom: { preamble: "Your symptom", text: "Which one of these best describes what you’re feeling?" },
  factors: { preamble: "Related factors", text: "Check anything that applies to your symptom." },
  duration: { preamble: "Timeline", text: "How long has this been going on?" },
  severity: { preamble: "Severity", text: "How would you describe the severity?" },
  "red-flags": { preamble: "Safety check", text: "Are any of these happening right now?" },
};

function PreamblePill({ text }: { text: string }) {
  return (
    <span className="inline-block text-xs font-medium tracking-wider text-[var(--brand-primary)] bg-white px-3 py-1.5 rounded-full mb-4">
      {text}
    </span>
  );
}

interface OptionRowProps {
  label: string;
  helper?: string;
  selected: boolean;
  onClick: () => void;
  delay: number;
}

function OptionRow({ label, helper, selected, onClick, delay }: OptionRowProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.98 }}
      className={`w-full px-[18px] py-[14px] rounded-2xl text-[14px] cursor-pointer flex items-start gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 ${
        selected
          ? "!bg-[var(--brand-subtle)] !border-[var(--brand-primary)] text-[var(--text-primary)]"
          : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
      }`}
    >
      <div
        className="w-[16px] h-[16px] mt-[3px] rounded-md shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white"
        style={{
          border: `1.5px solid ${selected ? "var(--brand-primary)" : "var(--border-strong)"}`,
          background: selected ? "var(--brand-primary)" : "transparent",
        }}
      >
        {selected && "✓"}
      </div>
      <span className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-[14px] text-[var(--text-primary)] leading-snug">{label}</span>
        {helper && (
          <span className="text-[11.5px] text-[var(--text-tertiary)] leading-snug">
            {helper}
          </span>
        )}
      </span>
    </motion.button>
  );
}

interface CheckboxRowProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay: number;
}

function CheckboxRow({ label, selected, onClick, delay }: CheckboxRowProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.98 }}
      className={`w-full px-[16px] py-[12px] rounded-xl text-[13.5px] cursor-pointer flex items-center gap-[12px] text-left bg-[var(--surface-subtle)] border transition-all duration-200 hover:bg-[var(--brand-subtle)] hover:border-[var(--brand-primary)]/30 ${
        selected
          ? "!bg-[var(--brand-subtle)] !border-[var(--brand-primary)] text-[var(--text-primary)]"
          : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
      }`}
    >
      <div
        className="w-[18px] h-[18px] shrink-0 flex items-center justify-center transition-all duration-200 text-[10px] font-medium text-white"
        style={{
          border: `1.5px solid ${selected ? "var(--brand-primary)" : "var(--border-strong)"}`,
          background: selected ? "var(--brand-primary)" : "transparent",
          borderRadius: 4,
        }}
      >
        {selected && "✓"}
      </div>
      <span className="flex-1 text-[13.5px] leading-snug">{label}</span>
    </motion.button>
  );
}

export default function QuestionScreen(props: BaseProps) {
  const {
    step,
    currentIndex,
    totalQuestions,
    region,
    symptom,
    factorsSelected,
    redFlagsSelected,
    selectedFor,
    onSingleAnswer,
    onToggleFactor,
    onSubmitFactors,
    onToggleRedFlag,
    onSubmitRedFlags,
    onBack,
  } = props;
  const copy = QUESTION_COPY[step];

  const renderSingle = useCallback(
    <V extends string>(
      stepId: StepId,
      options: readonly SimpleOption<V>[],
      selectedValue: V | undefined,
    ) =>
      options.map((opt, i) => (
        <OptionRow
          key={opt.value}
          label={opt.label}
          helper={opt.helper}
          selected={selectedValue === opt.value}
          onClick={() => onSingleAnswer(stepId, opt.value)}
          delay={0.22 + i * 0.04}
        />
      )),
    [onSingleAnswer],
  );

  const factorGroups = symptom ? FACTORS_BY_SYMPTOM[symptom] ?? [] : [];

  return (
    <QuizQuestionScreen
      questionId={step}
      questionText={copy.text}
      questionPreamble={<PreamblePill text={copy.preamble} />}
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      onBack={onBack}
      questionClassName="text-[1.3rem] font-medium leading-[1.4] text-[var(--text-primary)] tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem] max-[360px]:!text-[1.05rem]"
      contentClassName="flex-1 flex flex-col justify-center p-[24px_24px_32px] max-w-[560px] mx-auto w-full"
      questionBlockClassName="mb-[28px]"
      optionsClassName="flex flex-col gap-[8px] mb-auto"
    >
      {step === "sex" && renderSingle("sex", SEX_OPTIONS, selectedFor.sex)}
      {step === "age" && renderSingle("age", AGE_OPTIONS, selectedFor.age)}

      {step === "region" &&
        BODY_REGIONS.map((opt, i) => (
          <OptionRow
            key={opt.value}
            label={opt.label}
            helper={opt.helper}
            selected={selectedFor.region === opt.value}
            onClick={() => onSingleAnswer("region", opt.value)}
            delay={0.22 + i * 0.03}
          />
        ))}

      {step === "symptom" && region && (
        <>
          {SYMPTOMS_BY_REGION[region].map((opt, i) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              selected={selectedFor.symptom === opt.value}
              onClick={() => onSingleAnswer("symptom", opt.value)}
              delay={0.22 + i * 0.04}
            />
          ))}
        </>
      )}

      {step === "factors" && (
        <div className="flex flex-col gap-[20px] w-full">
          {factorGroups.length === 0 && (
            <p className="text-[14px] text-[var(--text-tertiary)] text-center py-4">
              No additional factors to ask about for this symptom.
            </p>
          )}
          {factorGroups.map((group, gIdx) => (
            <section key={group.id} className="flex flex-col gap-[8px]">
              <h3 className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-[var(--brand-primary)] m-0">
                {group.title}
              </h3>
              <div className="flex flex-col gap-[6px]">
                {group.options.map((opt, oIdx) => (
                  <CheckboxRow
                    key={opt.value}
                    label={opt.label}
                    selected={factorsSelected.includes(opt.value)}
                    onClick={() => onToggleFactor(opt.value)}
                    delay={0.18 + gIdx * 0.06 + oIdx * 0.015}
                  />
                ))}
              </div>
            </section>
          ))}
          <button
            type="button"
            className="tool-btn tool-btn--primary self-stretch mt-[8px]"
            onClick={onSubmitFactors}
          >
            Continue
          </button>
        </div>
      )}

      {step === "duration" &&
        renderSingle("duration", DURATION_OPTIONS, selectedFor.duration)}
      {step === "severity" &&
        renderSingle("severity", SEVERITY_OPTIONS, selectedFor.severity)}

      {step === "red-flags" && (
        <>
          <div className="flex flex-col gap-[6px] mb-[16px]">
            {RED_FLAGS.map((rf, i) => (
              <CheckboxRow
                key={rf.value}
                label={rf.label}
                selected={redFlagsSelected.includes(rf.value)}
                onClick={() => onToggleRedFlag(rf.value)}
                delay={0.22 + i * 0.025}
              />
            ))}
          </div>
          <button
            type="button"
            className="tool-btn tool-btn--primary"
            onClick={onSubmitRedFlags}
            disabled={redFlagsSelected.length === 0}
          >
            See my result
          </button>
        </>
      )}
    </QuizQuestionScreen>
  );
}
