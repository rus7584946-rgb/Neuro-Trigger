import { Type } from "@google/genai";

export const METADATA_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        videoTitle: { type: Type.STRING, description: "A compelling, SEO-friendly title based on the transcript." },
        videoDescription: { type: Type.STRING, description: "A short, engaging summary of the video's content and value proposition." },
        targetAudience: { type: Type.STRING, description: "A concise description of the ideal viewer, including their primary goals or fears." }
    },
    required: ["videoTitle", "videoDescription", "targetAudience"]
};

export const PREDICTIVE_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        predictedRetentionCurve: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.NUMBER, description: "Время в секундах" },
                    value: { type: Type.NUMBER, description: "Прогнозируемое удержание в % (0-100)" }
                },
                required: ["time", "value"]
            }
        }
    },
    required: ["predictedRetentionCurve"]
};

const TRAJECTORY_POINT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        time: { type: Type.NUMBER, description: "The midpoint timestamp of the segment in seconds." },
        value: { type: Type.NUMBER, description: "Score for the segment." },
        label: { type: Type.STRING, description: "A one-word label for the segment." }
    },
    required: ["time", "value", "label"]
};

export const PRE_PUBLICATION_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        predictedProblemPoints: {
            type: Type.ARRAY,
            description: "An array of predicted problem points based on transcription analysis.",
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.NUMBER, description: "Timestamp in seconds where the problem is predicted to occur." },
                    predictedDrop: { type: Type.NUMBER, description: "Predicted drop in retention percentage points." },
                    reason: { type: Type.STRING, enum: ['Сложность', 'Затянутость', 'Потеря Контекста', 'Низкая Энергия', 'Другое'], description: "The primary reason for the predicted drop." },
                    explanation: { type: Type.STRING, description: "A detailed explanation of why this point is problematic." },
                    quote: { type: Type.STRING, description: "The specific quote from the transcription that causes the issue." }
                },
                required: ["timestamp", "predictedDrop", "reason", "explanation", "quote"]
            }
        },
        emotionalTrajectory: {
            type: Type.ARRAY,
            description: "The emotional trajectory of the video, analyzed in segments. Value should be from -1 (very negative) to 1 (very positive).",
            items: TRAJECTORY_POINT_SCHEMA,
        },
        cognitiveLoad: {
            type: Type.ARRAY,
            description: "The cognitive load/complexity of the video, analyzed in segments. Value should be from 0 (very simple) to 10 (very complex).",
            items: TRAJECTORY_POINT_SCHEMA,
        }
    },
    required: ["predictedProblemPoints", "emotionalTrajectory", "cognitiveLoad"]
};

export const FEEDBACK_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A comprehensive summary of the overall effectiveness of the applied triggers, comparing the 'before' and 'after' retention curves."
        },
        triggerEffectiveness: {
            type: Type.ARRAY,
            description: "An array detailing the effectiveness of each individual trigger.",
            items: {
                type: Type.OBJECT,
                properties: {
                    triggerId: { type: Type.NUMBER, description: "The ID of the trigger being analyzed." },
                    effectiveness: {
                        type: Type.STRING,
                        enum: ['positive', 'negative', 'neutral', 'unclear'],
                        description: "The assessed effectiveness of the trigger."
                    },
                    justification: {
                        type: Type.STRING,
                        description: "A detailed justification for the assessed effectiveness, referencing changes in the retention curve around the trigger's timestamp."
                    }
                },
                required: ["triggerId", "effectiveness", "justification"]
            }
        }
    },
    required: ["overallSummary", "triggerEffectiveness"]
};

export const SEO_AGENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        titles: {
            type: Type.ARRAY,
            description: "An array of 5-7 diverse and compelling title suggestions for the video.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The suggested video title." },
                    justification: { type: Type.STRING, description: "A brief explanation of why this title is effective and which audience persona it targets." }
                },
                required: ["title", "justification"]
            }
        },
        descriptions: {
            type: Type.ARRAY,
            description: "An array of 2-3 optimized video descriptions.",
            items: { type: Type.STRING }
        },
        tags: {
            type: Type.STRING,
            description: "A single, comma-separated string of relevant tags, ordered from most specific to most general. The total length should be close to the 500-character limit for YouTube."
        }
    },
    required: ["titles", "descriptions", "tags"]
};

export const PROMO_KIT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        socialPosts: {
            type: Type.ARRAY,
            description: "An array of social media posts tailored for different platforms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, enum: ['Telegram', 'Instagram', 'Shorts/Reels'], description: "The target social media platform." },
                    content: { type: Type.STRING, description: "The generated content for the post, including text and relevant hashtags." }
                },
                required: ["platform", "content"]
            }
        },
        emailNewsletter: {
            type: Type.OBJECT,
            description: "Content for an email newsletter to promote the video.",
            properties: {
                subject: { type: Type.STRING, description: "The subject line for the email." },
                body: { type: Type.STRING, description: "The body of the email newsletter." }
            },
            required: ["subject", "body"]
        },
        keyHooks: {
            type: Type.ARRAY,
            description: "A list of short, punchy hooks or quotes from the video, ideal for teasers or short-form content.",
            items: { type: Type.STRING }
        }
    },
    required: ["socialPosts", "emailNewsletter", "keyHooks"]
};


const PERSONA_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Название персоны, например 'Осторожный новичок'" },
        description: { type: Type.STRING, description: "Краткое описание этой персоны" },
        dominantFear: { type: Type.STRING, description: "Главный страх этой персоны" },
        primaryMotivation: { type: Type.STRING, description: "Главная мотивация этой персоны" },
    },
    required: ["name", "description", "dominantFear", "primaryMotivation"]
};

const TRIGGER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.INTEGER },
        name: { type: Type.STRING },
        suggestionType: { type: Type.STRING, enum: ['overlay', 'videoReplacement'], description: "Тип предложения: 'overlay' для наложения текста или 'videoReplacement' для замены сцены." },
        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        timestamp: { type: Type.INTEGER },
        duration: { type: Type.INTEGER },
        emotion: { type: Type.STRING },
        goal: { type: Type.STRING },
        triggerText: { type: Type.STRING, description: "Текст для оверлея или название для видео-сцены." },
        contextQuote: { type: Type.STRING },
        psychologicalJustification: { type: Type.STRING },
        neuroEffect: {
            type: Type.OBJECT,
            properties: {
                overlayParts: { 
                    type: Type.ARRAY, 
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            accent: { type: Type.BOOLEAN },
                            accentColor: { type: Type.STRING }
                        },
                        required: ["text", "accent"]
                    }
                },
                color: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                animation: { type: Type.STRING },
                typography: { type: Type.STRING },
                backgroundVisual: { type: Type.STRING },
                placement: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        origin: { type: Type.STRING }
                    },
                    required: ["x", "y", "origin"]
                }
            },
            required: ["overlayParts", "color", "animation", "typography", "backgroundVisual", "placement"]
        },
        aiStudioPrompt: { type: Type.STRING },
        qrCode: {
            type: Type.OBJECT,
            properties: {
                platform: { type: Type.STRING },
                size: { type: Type.STRING },
                placement: { type: Type.STRING }
            },
            required: ["platform", "size"]
        },
        callToAction: { type: Type.STRING }
    },
    required: ["id", "name", "suggestionType", "categories", "tags", "timestamp", "duration", "emotion", "goal", "triggerText", "contextQuote", "psychologicalJustification", "neuroEffect", "aiStudioPrompt"]
};

export const CREATIVE_AGENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.INTEGER },
        pointTimestamp: { type: Type.INTEGER, description: "Timestamp of the point being addressed." },
        pointType: { type: Type.STRING, enum: ['problem', 'strength', 'creative', 'hook', 'rewatch'], description: "The type of point this recommendation addresses." },
        analysisSummary: { type: Type.STRING, description: "AI's brief analysis of the situation at this timestamp." },
        primarySuggestion: TRIGGER_SCHEMA,
        alternativeSuggestions: {
            type: Type.ARRAY,
            items: TRIGGER_SCHEMA
        },
        inverseLoop: {
            type: Type.OBJECT,
            description: "Analysis of the hook's promise and its fulfillment.",
            properties: {
                promiseQuote: { type: Type.STRING, description: "The quote from the first 30 seconds that makes a promise." },
                fulfillmentQuote: { type: Type.STRING, description: "The quote from later in the video that fulfills the promise." },
                fulfillmentTimestamp: { type: Type.NUMBER, description: "The timestamp where the promise is fulfilled." },
            }
        }
    },
    required: ["id", "pointTimestamp", "pointType", "analysisSummary", "primarySuggestion", "alternativeSuggestions"]
};

export const PSYCHOLOGIST_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        expertise: { type: Type.STRING, enum: ['Новичок', 'Средний', 'Эксперт', 'Не определен'] },
        psychotype: { type: Type.STRING, description: "Общий архетип аудитории." },
        personas: { type: Type.ARRAY, items: PERSONA_SCHEMA },
        dominantFear: { type: Type.STRING },
        primaryMotivation: { type: Type.STRING },
        cognitiveBiases: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["expertise", "psychotype", "personas", "dominantFear", "primaryMotivation", "cognitiveBiases"]
};

export const STRATEGIST_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            pointTimestamp: { type: Type.NUMBER },
            pointType: { type: Type.STRING, enum: ['problem', 'strength', 'creative', 'hook', 'rewatch'] },
            analysisContext: { type: Type.STRING },
            strategistSummary: { type: Type.STRING },
            targetPersona: { type: Type.STRING },
            goal: { type: Type.STRING },
            emotion: { type: Type.STRING }
        },
        required: ["id", "pointTimestamp", "pointType", "analysisContext", "strategistSummary", "targetPersona", "goal", "emotion"]
    }
};


export const COMMUNITY_POST_AGENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        communityPosts: {
            type: Type.ARRAY,
            description: "An array of generated community posts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['image', 'imagePoll', 'textPoll', 'quiz', 'video'] },
                    postText: { type: Type.STRING, description: "The main text content for the post." },
                    // Image Post
                    imagePrompt: { type: Type.STRING, description: "A DALL-E/Imagen prompt to generate the image for an 'image' post." },
                    // Text Poll
                    pollOptions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING }
                            },
                            required: ["text"]
                        }
                    },
                    // Image Poll
                    imagePollOptions: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                imagePrompt: { type: Type.STRING, description: "A prompt for the poll option's image." }
                            },
                            required: ["text", "imagePrompt"]
                        }
                    },
                    // Quiz
                    quizOptions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                isCorrect: { type: Type.BOOLEAN }
                            },
                            required: ["text", "isCorrect"]
                        }
                    },
                    explanation: { type: Type.STRING, description: "Explanation for the correct quiz answer." },
                    // Video Post
                    videoTitle: { type: Type.STRING, description: "The title of the video to be promoted." },
                    commentary: { type: Type.STRING, description: "Commentary to accompany the video link." }
                },
                required: ["type", "postText"]
            }
        }
    },
    required: ["communityPosts"]
};


export const DEVELOPER_AGENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        overallCodeQualitySummary: {
            type: Type.STRING,
            description: "A high-level summary of the generated prompts' quality, effectiveness, and adherence to best practices."
        },
        promptImprovements: {
            type: Type.ARRAY,
            description: "An array of specific suggestions for improving VEO or AI Studio prompts.",
            items: {
                type: Type.OBJECT,
                properties: {
                    triggerId: { type: Type.NUMBER, description: "The ID of the trigger whose prompt is being improved." },
                    originalPrompt: { type: Type.STRING, description: "The original generated prompt." },
                    improvedPrompt: { type: Type.STRING, description: "The suggested, improved version of the prompt." },
                    justification: { type: Type.STRING, description: "A clear explanation of why the new prompt is better (e.g., more cinematic, clearer instructions, better use of keywords)." }
                },
                required: ["triggerId", "originalPrompt", "improvedPrompt", "justification"]
            }
        },
        logicalConsistencyChecks: {
            type: Type.ARRAY,
            description: "An array identifying logical mismatches between a trigger's goal and its visual execution.",
            items: {
                type: Type.OBJECT,
                properties: {
                    triggerId: { type: Type.NUMBER, description: "The ID of the trigger with the inconsistency." },
                    mismatchDescription: { type: Type.STRING, description: "A description of the logical conflict (e.g., 'The 'shake' animation contradicts the 'calm' emotion.')." },
                    suggestedFix: { type: Type.STRING, description: "A concrete suggestion for fixing the inconsistency (e.g., 'Replace 'shake' animation with 'glow' or 'pulse' to better convey a sense of calm importance.')." }
                },
                required: ["triggerId", "mismatchDescription", "suggestedFix"]
            }
        },
        suggestedNextAgents: {
            type: Type.ARRAY,
            description: "An array of recommendations for which other agents to run next.",
            items: {
                type: Type.OBJECT,
                properties: {
                    agentName: { type: Type.STRING, enum: ['SEO', 'Промо-кит', 'Посты для Сообщества'], description: "The name of the agent being recommended." },
                    justification: { type: Type.STRING, description: "A clear reason why running this agent would be a valuable next step based on the video's content and analysis." }
                },
                required: ["agentName", "justification"]
            }
        }
    },
    required: ["overallCodeQualitySummary", "promptImprovements", "logicalConsistencyChecks", "suggestedNextAgents"]
};