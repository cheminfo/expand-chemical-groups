import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './styles.css';

const container = document.querySelector('#root');
if (!container) throw new Error('the page has no #root element');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
