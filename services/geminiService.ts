import { GoogleGenAI, Type, Modality } from "@google/genai";
// FIX: Corrected import path for types
import { Practice, AqalReportData } from '../types';

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features may not function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getCoachResponse = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("The AI coach is currently unavailable. Please try again later.");
  }
};

export const getPersonalizedHowTo = async (practice: Practice, userAnswer: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured for personalization.");
  }
  const prompt = `You are an expert ILP (Integral Life Practice) coach. Your task is to personalize a practice's "how-to" steps for a user based on their specific context.

**Practice to Personalize:**
- Name: ${practice.name}
- Standard "How-To": ${practice.how.join(', ')}

**User's Context:**
- The user was asked: "${practice.customizationQuestion}"
- The user answered: "${userAnswer}"

**Your Task:**
Generate a new, personalized list of 3-5 "how-to" steps for this practice that directly incorporates the user's answer. The steps should be clear, actionable, and encouraging.

**Example:**
If the practice is "Resistance Training" and the user says they only have "bodyweight", your steps should NOT mention dumbbells or gyms. Instead, suggest specific bodyweight exercises.

**Output Format:**
Your response MUST be a valid JSON object with a single key "steps" which is an array of strings. Each string is one personalized step.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.steps)) {
      return result.steps;
    } else {
      console.error("Parsed JSON for personalization does not match schema:", result);
      throw new Error("Received an unexpected format from the AI planner.");
    }
  } catch (error) {
    console.error("Gemini personalization error:", error);
    throw new Error("The AI planner is currently unavailable.");
  }
};


export const getAdvancedAnalysis = async (prompt: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured for advanced analysis.");
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using the more powerful model for complex analysis
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Enabled thinking mode
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 3-5 string-based recommendations for the user."
            }
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.recommendations)) {
      return result.recommendations;
    } else {
      console.error("Parsed JSON does not match expected schema:", result);
      throw new Error("Received an unexpected format from the AI analyst.");
    }
  } catch (error) {
    console.error("Gemini Pro API error:", error);
    throw new Error("The AI analyst is currently unavailable. Please try again later.");
  }
};

export const extractPartInfo = async (transcript: string): Promise<{ role: string, fears: string, positiveIntent: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  const prompt = `You are an expert IFS data analyst. Your task is to extract key information about an inner "part" from a conversation transcript.

  **Transcript:**
  ${transcript}
  
  **Your Task:**
  From the transcript, synthesize the following information:
  1.  **role**: A brief, descriptive role for the part (e.g., "The Protector," "The Inner Critic," "The Perfectionist").
  2.  **fears**: What the part is afraid of. What does it fear would happen if it stopped its job?
  3.  **positiveIntent**: The part's positive intention. What is it trying to achieve for the person?
  
  Your response MUST be a valid JSON object with these three keys. If the information isn't explicit, infer it from the context.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            fears: { type: Type.STRING },
            positiveIntent: { type: Type.STRING },
          }
        }
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini part info extraction error:", error);
    throw new Error("The AI analyst is having trouble summarizing the part's info.");
  }
};

export const summarizeIFSSession = async (
  transcript: string, 
  partInfo: { role: string, fears: string, positiveIntent: string }
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  const prompt = `You are an expert IFS (Internal Family Systems) therapist. Your task is to write a concise, compassionate summary of an IFS dialogue session. You have been provided with the full transcript and pre-analyzed information about the part.

  **Pre-analyzed Part Information:**
  - **Role:** ${partInfo.role}
  - **Fears:** ${partInfo.fears}
  - **Positive Intent:** ${partInfo.positiveIntent}

  **Full Session Transcript:**
  ${transcript}
  
  **Your Task:**
  Synthesize the key points of the conversation into a brief narrative summary (3-5 sentences). The summary MUST integrate the pre-analyzed information and also capture the key insight or emotional shift that occurred during the session.
  
  **Example Output:**
  "In this session, we connected with '${partInfo.role}'. We learned its core fear is '${partInfo.fears}', and its positive intention is to '${partInfo.positiveIntent}'. The key shift during our conversation was realizing its protective nature, which allowed for a moment of shared appreciation and softening."

  Your response should be a single string containing the summary.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using the more powerful model for summarization
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Enabled thinking mode
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini session summary error:", error);
    throw new Error("The AI analyst is having trouble summarizing the session.");
  }
};

export const generatePracticeScript = async (prompt: string): Promise<{ title: string, script: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  // System instruction focuses only on the persona.
  const systemInstruction = `You are a wise and compassionate meditation guide.`;
  
  // The main prompt clearly defines the task and desired output fields, reinforcing the schema.
  const fullPrompt = `A user has requested a guided practice. 
  
  User's request: "${prompt}"
  
  Your task is to generate a response containing two fields:
  1. A short, fitting 'title' for this meditation practice.
  2. The full meditation 'script', ready for text-to-speech.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }, // Enabled thinking mode
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, fitting title for the meditation practice." },
            script: { type: Type.STRING, description: "The full meditation script, ready for text-to-speech." }
          }
        }
      }
    });
    
    // Robust JSON parsing to handle cases where the model wraps the JSON in markdown or adds extra text.
    const rawText = response.text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No valid JSON object found in AI response:", rawText);
      throw new Error("AI response did not contain a valid JSON object.");
    }
    const jsonText = jsonMatch[0];

    const result = JSON.parse(jsonText);
    if (result && result.title && result.script) {
      return result;
    } else {
      console.error("Parsed JSON does not match expected schema:", result);
      throw new Error("Received an unexpected format from the AI script writer.");
    }
  } catch (error) {
    console.error("Gemini script generation error:", error);
     if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON response from AI. The response may be malformed or truncated.");
    }
    throw new Error("The AI script writer is currently unavailable.");
  }
};

export const generateSpeechFromText = async (script: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, neutral voice
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("No audio data received from the API.");
    }
  } catch (error) {
    console.error("Gemini TTS error:", error);
    throw new Error("The AI speech generator is currently unavailable.");
  }
};

export const getAqalReport = async (context: string): Promise<AqalReportData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured for AQAL report.");
  }

  const prompt = `You are an expert Integral Life Practice (ILP) coach. Your task is to provide a holistic AQAL (All Quadrants, All Levels) report based on a user's current practices and inner work.

**User's Current Context:**
${context}

**Your Task:**
1.  Provide a concise, overarching "summary" of the user's current AQAL balance (3-5 sentences). Highlight their strengths and any noticeable gaps or imbalances.
2.  Provide a specific "quadrantInsights" for each of the four quadrants (I, It, We, Its). For each quadrant:
    *   Briefly describe how the user's current practices and data contribute to development in that quadrant.
    *   Make inferences where possible about how individual practices might touch upon collective quadrants (e.g., "Deep Learning" might serve the 'Its' if it's job-related).
    *   If a quadrant seems neglected, acknowledge it.
3.  Provide 3-5 high-level "recommendations" to foster more balanced development across all quadrants.

**Output Format:**
Your response MUST be a valid JSON object with the following structure:
{
  "summary": "...",
  "quadrantInsights": {
    "I": "...",
    "It": "...",
    "We": "...",
    "Its": "..."
  },
  "recommendations": ["...", "..."]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            quadrantInsights: {
              type: Type.OBJECT,
              properties: {
                I: { type: Type.STRING },
                It: { type: Type.STRING },
                We: { type: Type.STRING },
                Its: { type: Type.STRING },
              },
              required: ["I", "It", "We", "Its"],
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "quadrantInsights", "recommendations"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (
      result &&
      typeof result.summary === 'string' &&
      typeof result.quadrantInsights === 'object' &&
      typeof result.quadrantInsights.I === 'string' &&
      typeof result.quadrantInsights.It === 'string' &&
      typeof result.quadrantInsights.We === 'string' &&
      typeof result.quadrantInsights.Its === 'string' &&
      Array.isArray(result.recommendations)
    ) {
      return result as AqalReportData;
    } else {
      console.error("Parsed JSON for AQAL report does not match schema:", result);
      throw new Error("Received an unexpected format from the AI AQAL analyst.");
    }
  } catch (error) {
    console.error("Gemini AQAL report error:", error);
    throw new Error("The AI AQAL analyst is currently unavailable.");
  }
};
