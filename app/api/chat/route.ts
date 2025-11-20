import { NextRequest, NextResponse } from 'next/server'

// API Provider Configuration
const API_PROVIDER = process.env.API_PROVIDER || 'groq' // Options: groq, huggingface, together, gemini
const API_KEY = process.env.API_KEY || ''

// Provider-specific configurations
const PROVIDER_CONFIG = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    headerKey: 'Authorization',
    headerValue: (key: string) => `Bearer ${key}`,
  },
  huggingface: {
    url: process.env.HUGGINGFACE_URL || 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    model: '',
    headerKey: 'Authorization',
    headerValue: (key: string) => `Bearer ${key}`,
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    model: process.env.TOGETHER_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    headerKey: 'Authorization',
    headerValue: (key: string) => `Bearer ${key}`,
  },
  gemini: {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-pro'}:generateContent`,
    model: '',
    headerKey: 'X-Goog-Api-Key',
    headerValue: (key: string) => key,
  },
}

async function callGroq(messages: any[], model?: string) {
  const config = PROVIDER_CONFIG.groq
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [config.headerKey]: config.headerValue(API_KEY),
    },
    body: JSON.stringify({
      model: model || config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

async function callHuggingFace(messages: any[]) {
  const config = PROVIDER_CONFIG.huggingface
  // Convert messages to prompt format for Hugging Face
  const prompt = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n') + '\nAssistant:'

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [config.headerKey]: config.headerValue(API_KEY),
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `Hugging Face API error: ${response.status}`)
  }

  const data = await response.json()
  return data[0]?.generated_text || 'No response generated'
}

async function callTogether(messages: any[]) {
  const config = PROVIDER_CONFIG.together
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [config.headerKey]: config.headerValue(API_KEY),
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || `Together AI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

async function callGemini(messages: any[]) {
  const config = PROVIDER_CONFIG.gemini
  // Convert messages to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const response = await fetch(`${config.url}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!API_KEY && API_PROVIDER !== 'huggingface') {
      return NextResponse.json(
        { 
          error: `API key is required for ${API_PROVIDER}. Please set API_KEY in your .env.local file. Get your free API key from the provider's website.` 
        },
        { status: 500 }
      )
    }

    let assistantMessage: string

    switch (API_PROVIDER.toLowerCase()) {
      case 'groq':
        assistantMessage = await callGroq(messages, model)
        break
      case 'huggingface':
        assistantMessage = await callHuggingFace(messages)
        break
      case 'together':
        assistantMessage = await callTogether(messages)
        break
      case 'gemini':
        assistantMessage = await callGemini(messages)
        break
      default:
        throw new Error(`Unknown API provider: ${API_PROVIDER}. Supported: groq, huggingface, together, gemini`)
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error: any) {
    console.error(`${API_PROVIDER} API error:`, error)
    
    return NextResponse.json(
      { 
        error: error.message || `Failed to get response from ${API_PROVIDER}` 
      },
      { status: 500 }
    )
  }
}

