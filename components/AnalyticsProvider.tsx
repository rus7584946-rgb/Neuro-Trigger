import React from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

interface AnalyticsProviderProps {
    children: React.ReactNode;
}

// Чтобы включить аналитику, замените 'undefined' на ваши ключи в виде строк.
// Например: const POSTHOG_KEY = "phc_YourKeyHere";
const POSTHOG_KEY: string | undefined = undefined; 
const POSTHOG_HOST: string | undefined = undefined;

// Флаг, который определяет, включена ли аналитика PostHog.
const isPostHogEnabled = POSTHOG_KEY && POSTHOG_KEY.length > 0;

// Инициализируем PostHog только если он включен.
if (isPostHogEnabled) {
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST || 'https://app.posthog.com',
    });
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
    // Оборачиваем в провайдер, только если аналитика настроена,
    // в противном случае просто отображаем дочерние компоненты.
    // Это делает аналитику опциональной и безопасной функцией.
    if (isPostHogEnabled) {
        return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
    }
    
    return <>{children}</>;
};
