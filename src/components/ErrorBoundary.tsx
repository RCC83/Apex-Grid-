import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-[#81ecff] mb-4 animate-bounce" />
          <h2 className="text-xl font-bold mb-2 font-headline uppercase tracking-wider">ScoreBoard Live</h2>
          <p className="text-sm text-zinc-400 mb-6">Une erreur d'affichage est survenue.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-[#81ecff] text-[#003840] font-black rounded-xl uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 cursor-pointer"
          >
            Recharger le tableau
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
