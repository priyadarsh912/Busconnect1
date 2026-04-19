import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'monospace',
          background: '#1a1a2e',
          color: '#e94560',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>
            🚨 BusConnect Crashed
          </h1>
          <div style={{
            background: '#16213e',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            overflowX: 'auto'
          }}>
            <p style={{ color: '#e94560', fontWeight: 'bold', marginBottom: '8px' }}>
              {this.state.error?.message}
            </p>
            <pre style={{ fontSize: '11px', color: '#a4b0be', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {this.state.error?.stack}
            </pre>
            {this.state.errorInfo && (
              <pre style={{ fontSize: '10px', color: '#636e72', marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#e94560',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
