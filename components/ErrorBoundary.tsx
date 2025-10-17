import React, { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '../services/loggingService.ts';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// FIX: The ErrorBoundary class must extend `Component<Props, State>` to be a valid React class component.
// This gives it access to component lifecycle methods, state, and props, which resolves the errors.
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Этот жизненный цикл вызывается при возникновении ошибки для обновления состояния и отображения запасного UI.
    return {
      hasError: true,
      error: error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Этот жизненный цикл предназначен для побочных эффектов, таких как логирование.
    logger.error('ErrorBoundary перехватил ошибку рендеринга', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo,
    });
  }

  public handleReset = () => {
    // Этот метод корректно сбрасывает состояние, чтобы попытаться повторно отрендерить дочерние компоненты.
    logger.warn('Попытка сброса состояния после ошибки в ErrorBoundary.');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center space-y-4">
            <h1 className="text-xl font-bold text-white">
              Что-то пошло не так
            </h1>
            <p className="text-gray-300">
              Произошла неожиданная ошибка при загрузке приложения.
            </p>
            
            {this.state.error && (
              <details className="text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Детали ошибки (для разработчиков)
                </summary>
                <pre className="mt-2 text-xs text-red-300 bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {this.state.errorInfo 
                    ? this.state.errorInfo.componentStack 
                    : (this.state.error as Error).stack}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
