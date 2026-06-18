"use client";

import { ReactNode, useCallback, useState } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";

interface LandingScreenProps {
  onStartTest: (a: string, b: string) => void;
  totalQuestions: number;
  initialNameA?: string;
  initialNameB?: string;
  afterContent?: ReactNode;
}

export default function LandingScreen({
  onStartTest,
  totalQuestions,
  initialNameA = "",
  initialNameB = "",
  afterContent,
}: LandingScreenProps) {
  const [nameA, setNameA] = useState(initialNameA);
  const [nameB, setNameB] = useState(initialNameB);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onStartTest(nameA.trim(), nameB.trim());
    },
    [nameA, nameB, onStartTest],
  );

  return (
    <ToolLandingLayout
      hero={{
        title: (
          <>
            Free <span className="accent-gradient">Love Compatibility</span> Test
          </>
        ),
        tagline: `Rate ${totalQuestions} statements about your relationship across five dimensions — communication, emotional intimacy, shared values, conflict, and lifestyle. See an overall compatibility score plus a breakdown that shows where to focus.`,
      }}
      beforeContent={
        <section className="tool-calc-section">
          <div className="tool-calc-wrapper">
            <form
              className="compat-name-card"
              onSubmit={handleSubmit}
              aria-label="Enter both names to start the compatibility test"
            >
              <div className='flex items-center justify-between gap-4'>

              <span className='tool-step-title'>Who's Taking the Test? </span>
              <span className="compat-name-card__heart" aria-hidden="true">
                ♡
              </span>
              </div>
              <div className="compat-name-row">
                <div className="tool-form-group">
                  <label htmlFor="compat-name-a" className="tool-form-label">
                    Your name
                  </label>
                  <input
                    id="compat-name-a"
                    type="text"
                    className="tool-input"
                    placeholder="e.g. Alex"
                    autoComplete="off"
                    maxLength={40}
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                  />
                </div>
                <span className="compat-name-divider" aria-hidden="true">
                  &
                </span>
                <div className="tool-form-group">
                  <label htmlFor="compat-name-b" className="tool-form-label">
                    Partner&apos;s name
                  </label>
                  <input
                    id="compat-name-b"
                    type="text"
                    className="tool-input"
                    placeholder="e.g. Jordan"
                    autoComplete="off"
                    maxLength={40}
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="tool-btn tool-btn--primary mx-auto">
                Start the test
              </button>

              <p className="compat-dim-helper" style={{ textAlign: "center" }}>
                Names are used only to personalize your result on your own
                screen. Nothing is sent to a server.
              </p>
            </form>
          </div>
        </section>
      }
      afterContent={afterContent}
    />
  );
}
