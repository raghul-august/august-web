'use client';

import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Joyride, ACTIONS, EventData, STATUS, Step, TooltipRenderProps } from 'react-joyride';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';

const stepConfigs = [
  {
    target: '[data-tour="attachment-button"]',
    title: 'Understand your labs. Share them with August.',
    content: 'August analyzes your data privately.',
    disableBeacon: true,
    placement: 'top' as const,
  },
  {
    target: '[data-tour="thumbs-up-button"]',
    title: 'Is this helpful?',
    content: 'Use these to give feedback. It keeps August on track.',
    disableBeacon: true,
    placement: 'right' as const,
  },
  {
    target: '[data-tour="share-button"]',
    title: 'Keep your circle in the loop.',
    content: "Share August's clarity with the people who care.",
    disableBeacon: true,
    placement: 'right' as const,
  },
];

function CustomTooltip({
  step,
  closeProps,
}: TooltipRenderProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '12px',
        alignItems: 'flex-start',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        gap: '8px',
        minHeight: '60px',
      }}
    >
      <div style={{ flex: '1 0 0' }}>
        <p style={{
          color: '#141515',
          fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          margin: 0,
        }}>
          {step.title}
        </p>
        <p style={{
          color: '#141515',
          fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          lineHeight: '18px',
          margin: 0,
          marginTop: '4px',
        }}>
          {step.content}
        </p>
      </div>
      <button
        {...closeProps}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M3.58001 15.2438C3.25458 15.5692 3.25458 16.0968 3.58001 16.4223C3.90545 16.7477 4.43309 16.7477 4.75853 16.4223L10.0026 11.1782L15.2467 16.4223C15.5721 16.7477 16.0998 16.7477 16.4252 16.4223C16.7506 16.0968 16.7506 15.5692 16.4252 15.2438L11.1811 9.99967L16.4252 4.7556C16.7506 4.43016 16.7506 3.90252 16.4252 3.57708C16.0998 3.25165 15.5721 3.25165 15.2467 3.57708L10.0026 8.82117L4.75853 3.57708C4.43309 3.25165 3.90545 3.25165 3.58001 3.57708C3.25458 3.90252 3.25458 4.43016 3.58001 4.7556L8.8241 9.99967L3.58001 15.2438Z" fill="#141515"/>
        </svg>
      </button>
    </div>
  );
}

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const messages = useChatStore((state) => state.messages);
  const { tourProgress, setTourStep, isAuthenticated, isAnonymous } = useAuthStore();

  // Stop tour when navigating away from chat
  useEffect(() => {
    if (pathname && pathname !== '/' && run) {
      setRun(false);
    }
  }, [pathname, run]);

  const userMessageCount = messages.filter((m) => m.sender === 'user').length;
  const lastMessage = messages[messages.length - 1];
  const lastMessageIdRef = useRef<string | null>(lastMessage?.id || null);
  const getLastElement = useCallback((selector: string): HTMLElement | null => {
    const elements = document.querySelectorAll(selector);
    return elements.length > 0 ? (elements[elements.length - 1] as HTMLElement) : null;
  }, []);

  const isElementInViewport = useCallback((el: HTMLElement | null): boolean => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  const steps: Step[] = stepConfigs.map((config, index) => {
    if ((index === 1 || index === 2) && targetElement) {
      return { ...config, target: targetElement };
    }
    return config;
  });

  // Check DOM for any visible modals (signup, download prompt, etc.)
  const isModalVisible = useCallback(() => {
    const modal = document.querySelector('[role="dialog"]');
    return !!modal;
  }, []);

  // Step 0: Attachment tooltip - on first landing
  useEffect(() => {
    if (tourProgress.attachment) return;

    const timer = setTimeout(() => {
      if (isModalVisible()) return;

      const el = document.querySelector('[data-tour="attachment-button"]');
      if (el) {
        setStepIndex(0);
        setRun(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tourProgress.attachment, isModalVisible, isAuthenticated, isAnonymous]);

  const newBotMessageArrived = lastMessage?.sender === 'bot' && lastMessage?.id !== lastMessageIdRef.current;

  // Step 1: Feedback tooltip - after 5th user message gets a response
  // Delay to wait for full bot response (may have multiple messages)
  useEffect(() => {
    if (tourProgress.feedback) return;
    if (!tourProgress.attachment) return;
    if (run && stepIndex === 1) return;
    if (userMessageCount < 5) return;
    if (!newBotMessageArrived) return;

    const timer = setTimeout(() => {
      if (isModalVisible()) return;

      const el = getLastElement('[data-tour="thumbs-up-button"]');
      if (el && isElementInViewport(el)) {
        setTargetElement(el);
        setStepIndex(1);
        setRun(true);
      }
    }, 3000); // Wait 3s for response to complete

    return () => clearTimeout(timer);
  }, [tourProgress.feedback, tourProgress.attachment, userMessageCount, newBotMessageArrived, isModalVisible, run, stepIndex, getLastElement, isElementInViewport]);

  // Step 2: Share tooltip - after 10th user message gets a response
  // Delay to wait for full bot response (may have multiple messages)
  useEffect(() => {
    if (tourProgress.share) return;
    if (!tourProgress.feedback) return;
    if (run && stepIndex === 2) return;
    if (userMessageCount < 10) return;
    if (!newBotMessageArrived) return;

    const timer = setTimeout(() => {
      if (isModalVisible()) return;

      const el = getLastElement('[data-tour="share-button"]');
      if (el && isElementInViewport(el)) {
        setTargetElement(el);
        setStepIndex(2);
        setRun(true);
      }
    }, 3000); // Wait 3s for response to complete

    return () => clearTimeout(timer);
  }, [tourProgress.share, tourProgress.feedback, userMessageCount, newBotMessageArrived, isModalVisible, run, stepIndex, getLastElement, isElementInViewport]);

  useEffect(() => {
    lastMessageIdRef.current = lastMessage?.id || null;
  }, [lastMessage?.id]);

  useEffect(() => {
    if (!run) return;

    const step = steps[stepIndex];
    if (!step) return;

    const target = step.target;
    let element: Element | null = null;
    if (typeof target === 'string') {
      element = document.querySelector(target);
    } else if (typeof target === 'function') {
      element = target();
    } else if (target && 'current' in target) {
      element = target.current;
    } else if (target instanceof Element) {
      element = target;
    }
    if (!element) return;

    const handleClick = () => {
      const stepKeys: Array<'attachment' | 'feedback' | 'share'> = ['attachment', 'feedback', 'share'];
      setTourStep(stepKeys[stepIndex]);
      setRun(false);
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [run, stepIndex, setTourStep, steps]);

  const handleCallback = useCallback((data: EventData) => {
    const { status, action, index } = data;

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.SKIP
    ) {
      const stepKeys: Array<'attachment' | 'feedback' | 'share'> = ['attachment', 'feedback', 'share'];
      setTourStep(stepKeys[index]);
      setRun(false);
    }
  }, [setTourStep]);

  return (
    <>
      {run && (() => {
        const JoyrideAny = Joyride as any;
        return (
          <JoyrideAny
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous={false}
            showSkipButton={false}
            showProgress={false}
            hideCloseButton={false}
            disableOverlayClose={false}
            disableCloseOnEsc={false}
            spotlightClicks={true}
            callback={handleCallback}
            tooltipComponent={CustomTooltip}
            floaterProps={{ disableAnimation: true }}
            styles={{
              options: { zIndex: 10000, arrowColor: 'white' },
              spotlight: { borderRadius: '50%' },
              overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            }}
          />
        );
      })()}
      {children}
    </>
  );
}
