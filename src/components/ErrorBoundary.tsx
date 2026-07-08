import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-500/30 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 left-4 bg-red-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-red-400 border border-red-500/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        SYNTAX ERROR
                    </div>
                    <div className="text-red-400 font-mono text-center max-w-lg mt-8">
                        <p className="mb-4">The AI generated an invalid specification that crashed the renderer.</p>
                        <div className="p-4 bg-black/60 rounded text-xs opacity-70 break-words">
                            {this.state.error?.message || "Unknown rendering error."}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
