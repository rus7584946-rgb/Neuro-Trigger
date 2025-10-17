import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '../services/loggingService.ts';

// Добавляем loadPyodide в глобальный объект window для TypeScript
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

// TypeScript interface for the context state
interface PyodideContextType {
  pyodide: any | null;
  isPyodideLoading: boolean;
  pyodideError: string | null;
}

// Create the context with a default undefined value
const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

// Custom hook for easy consumption of the context
export const usePyodide = (): PyodideContextType => {
  const context = useContext(PyodideContext);
  if (context === undefined) {
    throw new Error('usePyodide must be used within a PyodideProvider');
  }
  return context;
};

interface PyodideProviderProps {
  children: ReactNode;
}

export const PyodideProvider: React.FC<PyodideProviderProps> = ({ children }) => {
  const [pyodide, setPyodide] = useState<any | null>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState<boolean>(true);
  const [pyodideError, setPyodideError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializePyodide = async () => {
      try {
        // The script is now loaded statically in index.html.
        // We poll briefly for window.loadPyodide to handle any minor race conditions.
        let retries = 5;
        while (typeof window.loadPyodide === 'undefined' && retries > 0) {
          logger.warn(`window.loadPyodide не найдено, ожидание... (попыток осталось: ${retries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
        }

        if (typeof window.loadPyodide === 'undefined') {
          throw new Error("Не удалось загрузить скрипт Pyodide. Функция 'loadPyodide' не найдена. Убедитесь, что он подключен в index.html.");
        }
        
        logger.info("Инициализация WebAssembly Pyodide...");
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
        });
        
        if (!isMounted) return;
        logger.info("Pyodide создан. Загрузка пакетов pandas и numpy...");
        
        await pyodideInstance.loadPackage(['pandas', 'numpy']);

        if (!isMounted) return;
        logger.info("Пакеты pandas и numpy успешно загружены.");
        
        setPyodide(pyodideInstance);

      } catch (error) {
        logger.error("Ошибка инициализации Pyodide", error);
        console.error("Pyodide initialization failed:", error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить или инициализировать аналитический модуль.";
          setPyodideError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsPyodideLoading(false);
        }
      }
    };
    
    initializePyodide();

    return () => {
      isMounted = false;
    };
  }, []); // Пустой массив зависимостей гарантирует, что эффект выполнится один раз.

  const value = { pyodide, isPyodideLoading, pyodideError };

  return (
    <PyodideContext.Provider value={value}>
      {children}
    </PyodideContext.Provider>
  );
};