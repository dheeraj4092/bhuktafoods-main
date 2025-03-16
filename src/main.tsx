import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error logging
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find root element");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <App />
    );
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', { msg, url, lineNo, columnNo, error });
  return false;
};
