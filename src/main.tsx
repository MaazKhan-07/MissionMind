import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { AudioProvider } from './contexts/AudioContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'

// Global guard for third-party browser extensions (MetaMask, Firebase auth injectors, etc.)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason || '');
    if (
      reasonMsg.includes('Firebase') ||
      reasonMsg.includes('auth/network-request-failed') ||
      reasonMsg.includes('ObjectMultiplex') ||
      reasonMsg.includes('EventEmitter')
    ) {
      // Prevent browser console crash from third-party extension injection
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="Mission Operations Console">
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

