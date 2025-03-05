
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force initial render to show loading state
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
});
