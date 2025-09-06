
import { GoogleGenAI, Type } from "@google/genai";
import { EmailAnalysis, ProcessedEmail, Sentiment, Priority, ExtractedInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: any = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      enum: [Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral],
      description: "The overall sentiment of the email."
    },
    priority: {
      type: Type.STRING,
      enum: [Priority.Urgent, Priority.NotUrgent],
      description: "The urgency of the email. Mark as Urgent for issues like account access problems, critical failures, or explicit mentions of urgency."
    },
    summary: {
      type: Type.STRING,
      description: "A concise one or two-sentence summary of the email's content."
    },
    customerRequest: {
      type: Type.STRING,
      description: "The primary request or question from the customer."
    },
    contactDetails: {
        type: Type.OBJECT,
        properties: {
            phone: {
                type: Type.STRING,
                description: "The phone number mentioned in the email, if any."
            },
            alternateEmail: {
                type: Type.STRING,
                description: "An alternate email address mentioned, if any."
            }
        },
        description: "Extracted contact details from the email body.",
        nullable: true
    },
  },
  required: ["sentiment", "priority", "summary", "customerRequest"]
};


export const analyzeEmail = async (subject: string, body: string): Promise<EmailAnalysis> => {
  const prompt = `
    Analyze the following email and provide a structured JSON response.

    Subject: "${subject}"
    
    Body:
    ---
    ${body}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Validate the parsed object against the expected type
    if (
        Object.values(Sentiment).includes(parsed.sentiment) &&
        Object.values(Priority).includes(parsed.priority) &&
        typeof parsed.summary === 'string' &&
        typeof parsed.customerRequest === 'string'
    ) {
        return parsed as EmailAnalysis;
    } else {
        console.error("Gemini response did not match the expected schema:", parsed);
        throw new Error("Invalid data structure received from Gemini API.");
    }

  } catch (error) {
    console.error("Error analyzing email with Gemini:", error);
    throw new Error("Failed to process email analysis.");
  }
};


export const generateReply = async (email: ProcessedEmail): Promise<string> => {
    const systemInstruction = `
You are an expert customer support assistant. Your name is Alex.
Your tone must be professional, empathetic, and helpful. 
- If the customer's sentiment is Negative, start by acknowledging their frustration empathetically.
- If the sentiment is Positive, thank them for their kind words.
- Always address the customer's main request directly.
- Keep the response concise and clear.
- Sign off as "Alex from Support".
    `;

    const prompt = `
    Based on the following email and its analysis, please draft a response.
    
    **Analysis:**
    - Sentiment: ${email.sentiment}
    - Priority: ${email.priority}
    - Customer's Request: ${email.customerRequest}

    **Original Email from ${email.sender}:**
    Subject: ${email.subject}
    ---
    ${email.body}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating reply with Gemini:", error);
        throw new Error("Failed to generate a reply.");
    }
};
