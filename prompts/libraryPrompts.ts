import { TRIGGER_CLASSIFICATION_HIERARCHY, NEURO_MARKETING_COLORS_HEX } from '../constants/triggers.ts';
import { TRADING_SPECIFIC_TRIGGERS } from '../constants/trigger_trading.ts';

export const getTriggerCountDirective = (triggerCount: string): string => {
    switch (triggerCount) {
        case 'auto': return 'Ты самостоятельно принимаешь решение о необходимом количестве стратегических рекомендаций, основываясь на количестве найденных `problemPoints` и `strengthPoints`. Каждая рекомендация должна быть либо "АНТИДОТОМ" для проблемы, либо "УСИЛИТЕЛЕМ" для сильного момента. Не создавай рекомендаций без прямой привязки к анализу.';
        case '0': return 'Категорически запрещено генерировать стратегические рекомендации. Сгенерируй пустой массив `[]` для `strategicRecommendations`.';
        default:
            const count = parseInt(triggerCount, 10);
            if (!isNaN(count) && count > 0 && count <= 10) {
                return `Сгенерируй ровно ${count} наиболее важных стратегических рекомендаций.`;
            }
            return 'Ты самостоятельно принимаешь решение о необходимом количестве стратегических рекомендаций, основываясь на количестве  `problemPoints` и `strengthPoints` найденных файлах аналитики. Каждая рекомендация должна быть либо "АНТИДОТОМ" для проблемы, либо "УСИЛИТЕЛЕМ" для сильного момента. Не создавай рекомендаций без прямой привязки к анализу.';
    }
};

export const getCreativeTriggerCountDirective = (triggerCount: string): string => {
     switch (triggerCount) {
        case 'auto': return 'сгенерируй массив из как минимум 8 разнообразных `strategicRecommendations`.';
        case '0': return 'Категорически запрещено генерировать `strategicRecommendations`. Сгенерируй пустой массив `[]` для `strategicRecommendations`.';
        default:
            const count = parseInt(triggerCount, 10);
            if (!isNaN(count) && count > 0 && count <= 10) {
                return `сгенерируй массив из ровно ${count} разнообразных \`strategicRecommendations\`.`;
            }
            return 'сгенерируй массив из как минимум 8 разнообразных `strategicRecommendations`.';
    }
};

export const getFullTriggerLibraryPrompt = (): string => `
## 5. МОДУЛЬНАЯ БИБЛИОТЕКА ТРИГГЕРОВ

### I. БАЗОВАЯ БИБЛИОТЕКА (УНИВЕРСАЛЬНЫЕ)
${TRIGGER_CLASSIFICATION_HIERARCHY}

### II. ТЕМАТИЧЕСКАЯ БИБЛИОТЕКА: ТРЕЙДИНГ И ИНВЕСТИЦИИ
(Используй этот модуль, если определил соответствующую тематику)
${TRADING_SPECIFIC_TRIGGERS}
`;

export const getColorLibrary = (): string => `
- **Цвета (\`color\`, \`accentColor\`):** Это — критически важный шаг. Ты ОБЯЗАН сначала определить ключевую \`emotion\` для триггера (например, 'Страх', 'Срочность', 'Доверие', 'Радость'). Затем, на основе этой эмоции, ты ДОЛЖЕН выбрать подходящий основной \`color\` и акцентный \`accentColor\` из предоставленной ниже нейро-палитры.
${NEURO_MARKETING_COLORS_HEX.replace('# БАЗА ЗНАНИЙ: ПСИХОЛОГИЯ ЦВЕТА В НЕЙРОМАРКЕТИНГЕ (HEX-ПАЛИТРА)', '').trim().split('\n').map(line => `    - ${line.replace('-', '').trim()}`).join('\n')}
Твой выбор цвета должен быть не эстетическим, а НЕЙРОФИЗИОЛОГИЧЕСКИМ. В \`psychologicalJustification\` ты должен кратко объяснить, почему выбранные цвета соответствуют эмоции триггера. Например: "Выбран красный цвет (#EF4444) для усиления чувства срочности и привлечения немедленного внимания".
`;