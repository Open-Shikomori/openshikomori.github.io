import { i18n } from '@/features/i18n/i18n';

/**
 * OpenRouter API Interface Utility
 * Supports reasoning details and automatic localization context.
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

export interface OpenRouterOptions {
  model?: string;
  reasoning?: boolean;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Sends a chat completion request to OpenRouter.
 * Automatically adds localization context based on the current application language.
 */
export async function chatWithAI(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<OpenRouterMessage> {
  if (!API_KEY) {
    console.error("OpenRouter API Key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.");
    throw new Error("AI service not configured");
  }

  const {
    model = "openrouter/free",
    reasoning = true,
    temperature = 0.7,
  } = options;

  // Get current language for localization
  const currentLang = i18n.language || 'fr';
  const baseLang = currentLang.split('-')[0];
  const langNames: Record<string, string> = {
    'fr': 'French (Français)',
    'en': 'English',
    'ar': 'Arabic (العربية)'
  };

  const currentLangName = langNames[baseLang] || langNames[currentLang] || currentLang;

  // Prepend or inject a system message to ensure the AI knows the user's language context
  // unless a system message already exists that handles it.
  const hasSystemMessage = messages.some(m => m.role === 'system');
  const localizedMessages = [...messages];

  if (!hasSystemMessage) {
    localizedMessages.unshift({
      role: 'system',
      content: `You are a helpful assistant for the OpenShikomori project, a platform for the Comorian language dataset. 
      The current user's preferred language is ${currentLangName}. 
      Please respond in this language unless explicitly instructed otherwise in the user message.`
    });
  }

  const requestBody: any = {
    model,
    messages: localizedMessages,
    temperature,
  };

  if (reasoning) {
    requestBody.reasoning = { enabled: true };
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "OpenShikomori",
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI model");
    }

    // Return the message object which includes 'content' and potentially 'reasoning_details'
    return data.choices[0].message as OpenRouterMessage;
  } catch (error) {
    console.error("Failed to communicate with OpenRouter:", error);
    throw error;
  }
}

/**
 * Simple helper to generate text content from a single prompt.
 * Returns only the string content.
 */
export async function generateAIContent(
  prompt: string,
  options: OpenRouterOptions = {}
): Promise<string> {
  const response = await chatWithAI([{ role: 'user', content: prompt }], options);
  return response.content;
}

/**
 * Example usage matching your requested pattern:
 * 
 * const response = await chatWithAI([{ role: 'user', content: '...' }], { reasoning: true });
 * // response contains reasoning_details if supported by model
 * 
 * const nextResponse = await chatWithAI([
 *   { role: 'user', content: '...' },
 *   response, // Pass back assistant message with its reasoning_details
 *   { role: 'user', content: '...' }
 * ]);
 */
