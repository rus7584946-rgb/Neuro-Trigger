// services/loggingService.ts
import type { LogEntry } from '../types.ts';

type LogListener = (logs: LogEntry[]) => void;

class LoggingService {
    private logs: LogEntry[] = [];
    private listeners: Set<LogListener> = new Set();
    private static instance: LoggingService;

    private constructor() {
        // Private constructor for singleton
    }
    
    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    private addEntry(level: LogEntry['level'], message: string, details?: any) {
        // FIX: Use a switch statement for improved type safety and to avoid potential issues
        // with dynamic property access on the 'console' object.
        switch (level) {
            case 'INFO':
                console.info(message, details);
                break;
            case 'WARN':
                console.warn(message, details);
                break;
            case 'ERROR':
                console.error(message, details);
                break;
        }
        const newEntry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            details,
        };
        this.logs = [newEntry, ...this.logs];
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener([...this.logs]));
    }

    public subscribe(listener: LogListener): () => void {
        this.listeners.add(listener);
        listener([...this.logs]); // Immediately provide current logs
        return () => {
            this.listeners.delete(listener);
        };
    }

    public getLogs(): LogEntry[] {
        return [...this.logs];
    }
    
    public clearLogs() {
        this.logs = [];
        this.notifyListeners();
    }

    public info(message: string, details?: any) {
        this.addEntry('INFO', message, details);
    }

    public warn(message: string, details?: any) {
        this.addEntry('WARN', message, details);
    }

    public error(message: string, error?: Error | any) {
        const details = {
            error: error?.message,
            stack: error?.stack,
            ...error
        };
        this.addEntry('ERROR', message, details);
    }
}

export const logger = LoggingService.getInstance();
