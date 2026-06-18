'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { notifyError, serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';
import { useI18n } from '@/components/providers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { error, errorInfo });
    void notifyError('UI Error Boundary caught an error', {
      details: {
        error: serializeError(error),
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <LocalizedErrorFallback
          onRetry={this.handleRetry}
          onRefresh={this.handleRefresh}
        />
      );
    }

    return this.props.children;
  }
}

function LocalizedErrorFallback({
  onRetry,
  onRefresh,
}: {
  onRetry: () => void;
  onRefresh: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {t('errorBoundary.title')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('errorBoundary.description')}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#206E55] text-white rounded-full hover:bg-[#1a5a46] transition-colors"
          >
            {t('errorBoundary.tryAgain')}
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
          >
            {t('errorBoundary.refreshPage')}
          </button>
        </div>
      </div>
    </div>
  );
}
