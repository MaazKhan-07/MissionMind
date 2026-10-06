import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.warn('MissionMind ErrorBoundary caught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-xl bg-space-950 border border-red-500/30 text-slate-200 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-tech text-sm font-bold text-red-300 uppercase tracking-wider">
                {this.props.fallbackTitle || 'Subsystem Interface Guard Activated'}
              </h4>
              <p className="text-[11px] text-slate-400">
                Non-critical telemetry render anomaly contained. Core mission flight systems remain nominal.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 bg-black/50 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px] overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-lg font-tech font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESTART SUBSYSTEM VIEW</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
