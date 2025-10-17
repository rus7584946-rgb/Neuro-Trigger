import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { PyodideProvider } from './components/PyodideProvider.tsx';
import { AnalyticsProvider } from './components/AnalyticsProvider.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { logger } from './services/loggingService.ts';

/**
 * Main application entry point.
 * This file initializes the React application and sets up the necessary context providers.
 *
 * @file This file is responsible for rendering the root component and wrapping it with providers.
 * @module index
 */

logger.info('Запуск полного приложения "Генератор Нейро-Триггеров"...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMsg = 'Критическая ошибка: корневой элемент #root не найден в DOM.';
  logger.error(errorMsg);
  throw new Error(errorMsg);
}

// Clear the static loader from index.html before mounting the React app.
rootElement.innerHTML = ''; 
const root = ReactDOM.createRoot(rootElement);

// Render the application with all context providers.
// The order is important: ErrorBoundary should be high up to catch errors from providers below it.
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AnalyticsProvider>
        <PyodideProvider>
          <App />
        </PyodideProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

logger.info('Приложение успешно смонтировано в #root.');
