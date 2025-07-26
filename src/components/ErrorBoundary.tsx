"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; reset: () => void }> = ({
  error,
  reset,
}) => {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="fixed top-0 left-0 w-full h-full object-cover object-center blur-md brightness-50"
        >
          <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md"></div>

      <main className="relative z-20 flex flex-col flex-1 items-center justify-center">
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <svg
                className="w-16 h-16 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-white/80">
              There was an error loading this page. This might be due to a database
              connection issue.
            </p>
            {error && process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="text-white/60 cursor-pointer">Error details</summary>
                <pre className="mt-2 text-xs text-red-300 bg-black/20 p-2 rounded overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="flex space-x-3 justify-center mt-6">
              <button
                onClick={reset}
                className="bg-blue-500/20 backdrop-blur-lg border border-blue-500/30 text-blue-100 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500/20 backdrop-blur-lg border border-gray-500/30 text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ErrorBoundary;
