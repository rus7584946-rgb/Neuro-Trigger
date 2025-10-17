// types.ts

// Defines the available Gemini models for generation.
export type GeminiModel = 'gemini-2.5-flash';

// Represents a file uploaded for QR code generation.
export interface QrCodeFile {
  id: string;
  file: File;
  previewUrl: string;
  description: string;
}

// Represents a specific audience persona identified by the AI.
export interface Persona {
  name: string;
  description: string;
  dominantFear: string;
  primaryMotivation: string;
}

// Describes the psychological profile of the target audience, now with multiple personas.
export interface PsychologicalProfile {
  expertise: 'Новичок' | 'Средний' | 'Эксперт' | 'Не определен';
  psychotype: string; // A summary archetype
  personas: Persona[];
  dominantFear: string; // Overall dominant fear
  primaryMotivation: string; // Overall primary motivation
  cognitiveBiases: string[];
}

// Represents a point in the video with a significant drop in audience retention.
export interface ProblemPoint {
  timestamp: number;
  retentionDip: number;
  problemAnalysis: string;
  strategyJustification: string;
  predictedOutcome: string;
}

// Represents a point in the video with high audience retention (a peak or plateau).
export interface StrengthPoint {
  timestamp: number;
  retentionPeak?: number;
  reasonForPeak: string;
  strategyToAmplify: string;
  type: 'peak' | 'plateau';
}

// Represents a segment of the video that is frequently rewatched by viewers.
export interface RepeatedSegment {
  timestamp: number;
  rewatchIntensity: number; // A score indicating how strongly this segment was rewatched
  reasonForRewatch: string;
  strategyToLeverage: string;
}

// Represents the analysis of the video's hook (first 30 seconds).
export interface HookAnalysis {
    verdict: 'good' | 'average' | 'bad';
    initialDrop: number; // Percentage drop in the first 30 seconds
}

// Contains the full analysis of audience retention metrics.
export interface RetentionAnalysis {
  averageCTR: number;
  averageRetention: number;
  totalDuration: number;
  volatilityScore?: number;
  problemPoints: ProblemPoint[];
  strengthPoints: StrengthPoint[];
  repeatedSegments?: RepeatedSegment[]; // Added for rewatch data
  repeatedSegmentsCurve?: { time: number; value: number }[]; // Curve data for the graph
  hookAnalysis?: HookAnalysis;
}

// Defines styling for typography in neuro-triggers.
export interface TypographyStyle {
  font?: string;
  weight?: number;
  size?: number;
  color?: string;
}

// Represents a part of the text overlay in a neuro-trigger, which can be accented.
export interface OverlayPart {
  text: string;
  accent: boolean;
  accentColor?: string;
}

// Defines the data for a QR code to be displayed in a trigger.
export interface QrCodeData {
    platform: string;
    size: 'auto' | 'small' | 'medium' | 'large';
    placement: string;
}

// Represents a generated neuro-trigger with all its psychological and visual properties.
export interface Trigger {
  id: number;
  name: string;
  suggestionType: 'overlay' | 'videoReplacement';
  categories: string[];
  tags: string[];
  timestamp: number;
  duration: number;
  emotion: string;
  goal: string;
  triggerText: string;
  contextQuote: string;
  psychologicalJustification: string;
  aiStudioPrompt: string;
  callToAction?: string;
  neuroEffect: {
    animation: 'pulse' | 'glow' | 'shake' | 'flash' | 'burst' | 'slide-in' | 'zoom-in' | 'glitch' | 'flicker' | 'typewriter' | 'gradient-shift' | 'bounce' | 'chart-draw' | 'scanner' | 'particle-reveal' | 'shatter' | 'energy-flow' | 'liquid-morph';
    overlayParts: OverlayPart[];
    typography: string | TypographyStyle;
    backgroundVisual: string;
    placement: {
      x: number;
      y: number;
      origin: string;
    };
    color: string;
    accentColor: string;
  };
  qrCode?: QrCodeData;
}

// Represents a predicted problem point from pre-publication analysis.
export interface PredictedProblemPoint {
  timestamp: number;
  predictedDrop: number;
  reason: 'Сложность' | 'Затянутость' | 'Потеря Контекста' | 'Низкая Энергия' | 'Другое';
  explanation: string;
  quote: string;
}

// Represents a point on an emotional or cognitive trajectory graph.
export interface TrajectoryPoint {
  time: number;
  value: number;
  label: string;
}

// Analysis result from the pre-publication (text-only) agent.
export interface PrePublicationAnalysis {
  predictedProblemPoints: PredictedProblemPoint[];
  emotionalTrajectory: TrajectoryPoint[];
  cognitiveLoad: TrajectoryPoint[];
}

// The complete set of data submitted by the user through the form.
export interface AnalysisFormData {
  transcriptionFile: File;
  statsFiles: File[] | null;
  videoTitle: string;
  videoDescription: string;
  targetAudience: string;
  language: string;
  temperature: number;
  qrCodeCount: string;
  triggerCount: string;
  qrCodes: QrCodeFile[];
  mode: 'full' | 'creative';
  model: GeminiModel;
  dipSensitivity: number;
  peakSensitivity: number;
  predictiveAnalysisEnabled: boolean;
  prePublicationAnalysisEnabled: boolean;
  timeRange?: [number, number];
}

// A strategic brief generated by the Strategist agent.
export interface StrategicBrief {
    id: number;
    pointTimestamp: number;
    pointType: 'problem' | 'strength' | 'creative' | 'hook' | 'rewatch';
    analysisContext: string;
    strategistSummary: string;
    targetPersona: string;
    goal: string;
    emotion: string;
}

// A single strategic recommendation, which includes the primary and alternative triggers.
export interface StrategicRecommendation {
  id: number;
  pointTimestamp: number;
  pointType: 'problem' | 'strength' | 'creative' | 'hook' | 'rewatch';
  analysisSummary: string;
  primarySuggestion: Trigger;
  alternativeSuggestions: Trigger[];
  inverseLoop?: {
      promiseQuote: string;
      fulfillmentQuote: string;
      fulfillmentTimestamp: number;
  };
}

// The complete response object returned by the analysis pipeline.
export interface FullApiResponse {
  videoTitle: string;
  videoDescription: string;
  transcriptionText: string;
  psychologicalProfile: PsychologicalProfile;
  strategicRecommendations: StrategicRecommendation[];
  retentionAnalysis: RetentionAnalysis;
  retentionCurve: { time: number; value: number }[];
  predictedRetentionCurve?: { time: number; value: number }[];
  prePublicationAnalysis?: PrePublicationAnalysis;
  rawDataPoints?: { time: number; value: number }[];
}

// An entry in the user's analysis history.
export interface HistoryEntry {
  id: string;
  timestamp: number;
  videoTitle: string;
  results: FullApiResponse;
  mode: 'full' | 'creative';
}

// Results from the SEO agent.
export interface SeoResult {
  titles: { title: string; justification: string }[];
  descriptions: string[];
  tags: string;
}

// Results from the Promo Kit agent.
export interface PromoKitResult {
  socialPosts: { platform: string; content: string }[];
  emailNewsletter: { subject: string; body: string };
  keyHooks: string[];
}

// Base type for a community post.
interface BaseCommunityPost {
    type: 'image' | 'textPoll' | 'imagePoll' | 'quiz' | 'video';
    postText: string;
}

// Specific types for each kind of community post.
export interface ImageCommunityPost extends BaseCommunityPost {
    type: 'image';
    imagePrompt: string;
}

export interface TextPollCommunityPost extends BaseCommunityPost {
    type: 'textPoll';
    pollOptions: { text: string }[];
}

export interface ImagePollCommunityPost extends BaseCommunityPost {
    type: 'imagePoll';
    imagePollOptions: { text: string, imagePrompt: string }[];
}

export interface QuizCommunityPost extends BaseCommunityPost {
    type: 'quiz';
    quizOptions: { text: string; isCorrect: boolean }[];
    explanation: string;
}

export interface VideoCommunityPost extends BaseCommunityPost {
    type: 'video';
    videoTitle: string;
    commentary: string;
}

// Union type for any community post.
export type CommunityPost =
    | ImageCommunityPost
    | TextPollCommunityPost
    | ImagePollCommunityPost
    | QuizCommunityPost
    | VideoCommunityPost;


// Result from the Community Post agent.
export interface CommunityPostResult {
    communityPosts: CommunityPost[];
}

// Result from the Developer agent.
export interface DeveloperAgentResult {
  overallCodeQualitySummary: string;
  promptImprovements: {
    triggerId: number;
    originalPrompt: string;
    improvedPrompt: string;
    justification: string;
  }[];
  logicalConsistencyChecks: {
    triggerId: number;
    mismatchDescription: string;
    suggestedFix: string;
  }[];
  suggestedNextAgents: {
    agentName: string;
    justification: string;
  }[];
}


// Represents the assessment of a single trigger's effectiveness.
export interface TriggerEffectiveness {
  triggerId: number;
  effectiveness: 'positive' | 'negative' | 'neutral' | 'unclear';
  justification: string;
}

// Result from the feedback analysis, comparing before and after stats.
export interface FeedbackAnalysisResult {
    overallSummary: string;
    triggerEffectiveness: TriggerEffectiveness[];
    afterCurve: { time: number; value: number }[];
}


// Structure for a single word from transcription analysis.
export interface AnalyzedWord {
    text: string;
    startTime?: number;
    endTime?: number;
}

// Structure for a single sentence from transcription analysis.
export interface AnalyzedSentence {
    text: string;
    startTime?: number;
    endTime?: number;
    words: AnalyzedWord[];
}

// Structure for the entire analyzed transcription.
export interface AnalyzedTranscription {
    metadata: {
        totalDuration: number;
        wordCount: number;
        sentenceCount: number;
    };
    sentences: AnalyzedSentence[];
}

// Represents a single entry in the application's log.
export interface LogEntry {
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any; // Optional additional data for inspection
}