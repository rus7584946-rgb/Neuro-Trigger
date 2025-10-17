// components/tour/tourSteps.ts

export interface TourStep {
  elementId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom';
}

export const tourSteps: TourStep[] = [
  {
    elementId: 'tour-step-1',
    title: '1. Выбор Режима Анализа',
    content: 'Выберите "Полный анализ", если у вас есть статистика удержания (.csv), или "Креативный режим" для анализа только по тексту транскрипции.',
    position: 'bottom',
  },
  {
    elementId: 'tour-step-2',
    title: '2. Загрузка Основных Данных',
    content: 'Загрузите транскрипцию (обязательно) и, если нужно, файл статистики. AI автоматически заполнит поля ниже, но вы можете их отредактировать.',
    position: 'bottom',
  },
  {
    elementId: 'tour-step-3',
    title: '3. QR-коды (Опционально)',
    content: 'Если вы хотите добавить в видео партнерские ссылки или призывы к действию, загрузите сюда QR-коды. AI сам найдет лучшие места для их размещения.',
    position: 'top',
  },
  {
    elementId: 'tour-step-4',
    title: '4. Настройки AI',
    content: 'Здесь можно настроить "креативность" AI (температуру) и указать желаемое количество триггеров и QR-кодов для генерации.',
    position: 'top',
  },
  {
    elementId: 'tour-step-5',
    title: '5. Запуск Генерации',
    content: 'Когда все данные введены, нажмите эту кнопку, чтобы запустить нейросеть. Анализ может занять некоторое время.',
    position: 'top',
  },
];