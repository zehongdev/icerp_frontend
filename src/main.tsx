import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { socketClient } from './websocket/socket.ts';
import './index.css'
import App from './App.tsx'

socketClient.connect();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
