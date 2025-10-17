export const formatTime = (seconds: number): string => {
    if (typeof seconds !== 'number' || !isFinite(seconds)) return '00:00';
    const positiveSeconds = Math.max(0, seconds);
    const minutes = Math.floor(positiveSeconds / 60);
    const remainingSeconds = Math.floor(positiveSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
