// OpenRouter API Integration
// https://openrouter.ai/docs

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

export interface OpenRouterSettings {
  apiKey: string;
  selectedModel: string;
  isVerified: boolean;
}

export const MARKETING_MODELS = [
  // OpenAI - Latest
  { id: 'openai/gpt-4.5-preview', name: 'GPT-4.5 Preview', description: '⭐ أحدث نموذج من OpenAI - ممتاز للمحتوى التسويقي' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'سريع وقوي للمحتوى التسويقي والإبداعي' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'اقتصادي وسريع للمهام اليومية' },
  { id: 'openai/o3-mini', name: 'o3 Mini', description: 'ممتاز للاستدلال وكتابة المحتوى المعقد' },
  { id: 'openai/o1-mini', name: 'o1 Mini', description: 'جيد للتفكير العميق والتحليل' },
  
  // Anthropic - Claude
  { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', description: '⭐ الأحدث والأفضل للمحتوى التسويقي' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'ممتاز للمحتوى الإبداعي والتسويقي' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'الأقوى للمحتوى المعقد والاستراتيجيات' },
  
  // Google - Gemini
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', description: 'سريع ومجاني - جيد للمحتوى العام' },
  { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', description: 'مجاني - ممتاز للمحتوى التسويقي' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'جيد للمحتوى الطويل والتسويقي' },
  
  // Meta - Llama
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'مجاني - قوي للمحتوى العام' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'مجاني - جيد للمحتوى التسويقي' },
  
  // DeepSeek
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', description: 'مجاني - ممتاز للمحتوى والترجمة' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'مجاني - قوي للاستدلال والتحليل' },
  
  // Mistral
  { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'ممتاز للمحتوى باللغات المتعددة' },
];

export async function verifyOpenRouterKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function fetchAvailableModels(apiKey: string): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export async function generateContent(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Project Manager AI',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate content');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

const STORAGE_KEY = 'openrouter-settings';

export function saveOpenRouterSettings(settings: OpenRouterSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

export function loadOpenRouterSettings(): OpenRouterSettings {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return {
    apiKey: '',
    selectedModel: 'openai/gpt-4.5-preview',
    isVerified: false,
  };
}
