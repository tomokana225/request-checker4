import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.tsx'
import './src/index.css'
import { initializeFirebase } from './src/firebase.ts';

initializeFirebase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
});