/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ARTHA AI Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 bg-[#0B1F3A] border border-[#1B2B48] rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-[#E5484D]/20 text-[#E5484D] flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {this.props.fallbackTitle || 'Component Encountered an Unexpected Issue'}
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-md mb-4 leading-relaxed">
            {this.state.error?.message || 'A transient rendering or data synchronization error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF9933] text-slate-950 font-semibold text-xs hover:bg-[#FF9933]/90 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Component State</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
