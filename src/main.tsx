import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/modals.css';
import App            from './App';
import { PortfolioEntry } from './components/layout/PortfolioEntry';

const root = document.getElementById('root');

if (!root) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <PortfolioEntry><App /></PortfolioEntry>
  </StrictMode>
);
