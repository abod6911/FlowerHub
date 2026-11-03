import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StudioThemeProvider } from './context/StudioThemeContext'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FlowerHub ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          color: '#1C1917',
          fontFamily: "'Alexandria', sans-serif",
          padding: '24px',
          textAlign: 'center',
          direction: 'rtl'
        }}>
          <div style={{
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            padding: '32px 24px',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E7E5E4'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>حدث خطأ غير متوقع في التحميل</h1>
            <p style={{ fontSize: '13px', color: '#78716C', marginBottom: '20px' }}>
              يمكنك استعادة ضبط المصنع ومسح الإعدادات المؤقتة لتشغيل المتجر مباشرة.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#022C22',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              إعادة ضبط وتشغيل المتجر
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <StudioThemeProvider>
        <App />
      </StudioThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
