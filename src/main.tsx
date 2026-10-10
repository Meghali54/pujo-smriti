import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/tiro-bangla/bengali-400.css';
import '@fontsource/tiro-bangla/latin-400.css';
import '@fontsource/noto-serif-bengali/bengali-400.css';
import '@fontsource/noto-serif-bengali/bengali-600.css';
import '@fontsource/atma/bengali-400.css';
import '@fontsource/atma/latin-400.css';
import '@fontsource/caveat/latin-500.css';
import '@fontsource/jost/latin-400.css';
import '@fontsource/jost/latin-500.css';
import './index.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
