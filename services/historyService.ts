import type { HistoryEntry } from '../types.ts';

const HISTORY_KEY = 'neuroTriggerAnalysisHistory';
const MAX_HISTORY_ITEMS = 10;

export const getAnalysisHistory = (): HistoryEntry[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to load history from localStorage:", error);
        return [];
    }
};

export const saveAnalysisToHistory = (newEntry: HistoryEntry, currentHistory: HistoryEntry[]): HistoryEntry[] => {
    const updatedHistory = [newEntry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save history to localStorage:", error);
    }
    return updatedHistory;
};

export const clearAnalysisHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear history from localStorage:", error);
    }
};