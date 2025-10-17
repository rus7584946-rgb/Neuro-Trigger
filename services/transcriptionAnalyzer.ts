// services/transcriptionAnalyzer.ts

import type { AnalyzedTranscription, AnalyzedSentence, AnalyzedWord } from '../types.ts';

/**
 * Parses a timecode string (HH:MM:SS.mmm) into seconds.
 * @param timeStr The timecode string.
 * @returns The time in seconds.
 */
const parseTimecode = (timeStr: string): number => {
    const parts = timeStr.split(/[:.]/);
    if (parts.length !== 4) return 0; // Expects H, M, S, MS
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    const milliseconds = parseInt(parts[3], 10);
    if ([hours, minutes, seconds, milliseconds].some(isNaN)) return 0;
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

/**
 * Processes an SBV formatted string into structured sentences and words with timestamps.
 * @param sbvText The raw SBV content.
 * @returns An array of AnalyzedSentence objects.
 */
const parseSbv = (sbvText: string): { sentences: AnalyzedSentence[], duration: number } => {
    const lines = sbvText.split('\n').map(line => line.trim());
    const sentences: AnalyzedSentence[] = [];
    let maxTime = 0;

    for (let i = 0; i < lines.length; i++) {
        // Find a line with a timestamp range
        if (lines[i].includes('-->') || (lines[i].includes(',') && lines[i].match(/\d{1,2}:\d{2}:\d{2}\.\d{3},\d{1,2}:\d{2}:\d{2}\.\d{3}/))) {
            const timeParts = lines[i].split(/,|-->/);
            if (timeParts.length < 2) continue;

            const startTime = parseTimecode(timeParts[0]);
            const endTime = parseTimecode(timeParts[1]);

            if (endTime > maxTime) {
                maxTime = endTime;
            }

            // The text is on the next line(s)
            let textContent = '';
            let j = i + 1;
            while (j < lines.length && lines[j] !== '') {
                textContent += lines[j] + ' ';
                j++;
            }
            textContent = textContent.trim();
            i = j; // Move the outer loop index past the text lines

            if (textContent) {
                // Improved word tokenization to strip punctuation and handle unicode characters.
                const words = (textContent.match(/[\p{L}\p{N}'-]+/gu) || []).map(word => ({
                    text: word
                } as AnalyzedWord));

                sentences.push({
                    text: textContent,
                    startTime,
                    endTime,
                    words
                });
            }
        }
    }

    return { sentences, duration: maxTime };
};


/**
 * Processes a plain text string into structured sentences and words without timestamps.
 * Uses more advanced sentence and word splitting methods.
 * @param text The raw text content.
 * @returns An array of AnalyzedSentence objects.
 */
const parseTxt = (text: string): { sentences: AnalyzedSentence[], duration: number } => {
    // 1. Pre-process text: normalize all line breaks and multiple spaces into a single space.
    const preprocessedText = text
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s+/g, ' ')
        .trim();

    // 2. Split into sentences. This regex splits after a sentence-ending punctuation mark (.?!)
    // that is followed by a space, while trying to avoid splitting on abbreviations like "Mr." or "U.S.".
    const sentenceEndings = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s/g;
    
    const sentenceStrings = preprocessedText.split(sentenceEndings).filter(s => s && s.trim());

    const sentences: AnalyzedSentence[] = sentenceStrings.map(sentenceText => {
        const cleanedText = sentenceText.trim();
        // 3. Improved word tokenization: extract word-like tokens using a unicode-aware regex.
        // This effectively strips punctuation and handles international characters.
        // \p{L} = any unicode letter, \p{N} = any unicode number.
        const words = (cleanedText.match(/[\p{L}\p{N}'-]+/gu) || []).map(word => ({
            text: word
        } as AnalyzedWord));
        
        return {
            text: cleanedText,
            words
        };
    });
    
    // Duration cannot be determined from plain text.
    return { sentences, duration: 0 };
};


/**
 * Analyzes transcription text from a file and breaks it down into a structured JSON format.
 * Acts as a pre-processor for more advanced content analysis.
 * @param text The raw text content of the transcription file.
 * @param fileName The name of the original file, used to determine the format (.sbv or .txt).
 * @returns An AnalyzedTranscription object.
 */
export const analyzeTranscription = (text: string, fileName: string): AnalyzedTranscription => {
    let analysisResult: { sentences: AnalyzedSentence[], duration: number };

    if (fileName.toLowerCase().endsWith('.sbv')) {
        analysisResult = parseSbv(text);
    } else {
        analysisResult = parseTxt(text);
    }
    
    const wordCount = analysisResult.sentences.reduce((sum, s) => sum + s.words.length, 0);

    return {
        metadata: {
            totalDuration: analysisResult.duration,
            wordCount: wordCount,
            sentenceCount: analysisResult.sentences.length
        },
        sentences: analysisResult.sentences
    };
};