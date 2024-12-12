import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg flex items-center justify-center p-4">
          <div className="bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon p-8 max-w-lg w-full shadow-sm">
            <h2 className="text-xl font-medium text-red-500 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <div className="text-zenon-light-text dark:text-zenon-dark-text">
              <p className="mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-zenon-primary text-white rounded-zenon hover:bg-zenon-primary-dark transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
