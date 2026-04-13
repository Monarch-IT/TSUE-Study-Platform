import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h1 className="text-4xl font-black mb-4 uppercase italic">Critical System Failure</h1>
                    <p className="text-white/40 mb-8 max-w-md">
                        The platform encountered an unexpected error. This usually happens if environment variables or database connection is missing.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left w-full max-w-2xl overflow-auto max-h-[50vh]">
                        <p className="text-red-400 font-mono text-xs mb-2 uppercase font-black">Error Log:</p>
                        <pre className="text-[10px] font-mono whitespace-pre-wrap text-white/60 mb-4">
                            {this.state.error?.toString()}
                        </pre>
                        <p className="text-amber-400 font-mono text-xs mb-2 uppercase font-black">Component Stack:</p>
                        <pre className="text-[10px] font-mono whitespace-pre-wrap text-white/40">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-8 py-4 bg-primary rounded-2xl font-black uppercase text-xs hover:scale-105 transition-transform"
                    >
                        Restart Systems
                    </button>
                </div>
            );
        }

        return this.props.children;

    }
}

export default ErrorBoundary;
