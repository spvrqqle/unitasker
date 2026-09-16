import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Register service worker for PWA (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration)
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}

// Check online/offline status
window.addEventListener('online', () => {
  console.log('🟢 App is online')
})

window.addEventListener('offline', () => {
  console.log('🔴 App is offline')
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)