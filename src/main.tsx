import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function Root() {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode and apply to the body element
  const handleDarkModeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle('dark-mode', !darkMode); // Apply dark mode class to the body
  };

  return (
    <div>
      {/* Dark Mode Toggle Button */}
      <button onClick={handleDarkModeToggle}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      {/* App Component */}
      <App />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
