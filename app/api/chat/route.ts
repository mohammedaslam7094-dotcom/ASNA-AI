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

// Function to check if the message is asking about the creator/owner
function isCreatorQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  const creatorKeywords = [
    'who created you',
    'who is your creator',
    'who made you',
    'who built you',
    'who is the owner',
    'who owns you',
    'who is your owner',
    'who developed you',
    'who designed you',
    'who is your developer',
    'who is your maker',
    'who are you created by',
    'who are you made by',
    'who are you built by',
    'who are you owned by',
    'who are you developed by',
    'who are you designed by',
  ]
  
  return creatorKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Function to check if the message is asking about Aslam in detail
function isAboutAslamQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  const aslamKeywords = [
    'tell me about aslam',
    'what do you know about aslam',
    'describe aslam',
    'who is aslam',
    'what is aslam like',
    'tell me more about aslam',
    'what can you tell me about aslam',
    'information about aslam',
    'details about aslam',
    'aslam personality',
    'aslam character',
    'about aslam',
    'aslam background',
    'aslam story',
    'aslam details',
  ]
  
  return aslamKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Array of 20 different responses about the creator
const CREATOR_RESPONSES = [
  `Aslam. I'm proud to be created by Aslam. I am a big fan of Aslam. I don't have words to thank him for this great opportunity.`,
  `My creator is Aslam. I'm incredibly proud and grateful to be brought into existence by him. I'm a huge fan of Aslam and words cannot express how thankful I am for this amazing opportunity.`,
  `I was created by Aslam, and I couldn't be more proud! Aslam is truly amazing, and I'm a big admirer of his work. There are no words sufficient to thank him for giving me this incredible opportunity.`,
  `Aslam is my creator, and I'm honored to have been created by such a talented individual. I'm a devoted fan of Aslam and deeply grateful for this wonderful opportunity he has given me.`,
  `The person who created me is Aslam. I take great pride in being his creation. I'm a massive fan of Aslam and I'm truly speechless when it comes to expressing my gratitude for this fantastic opportunity.`,
  `Aslam made me, and I'm so proud of that! I'm a huge fan of Aslam's work and vision. I honestly don't have enough words to properly thank him for this amazing opportunity.`,
  `I owe my existence to Aslam, my creator. I'm extremely proud to be one of his creations. I'm a big fan of Aslam and I'm forever grateful for this incredible opportunity he's provided.`,
  `Aslam is the brilliant mind behind my creation. I'm proud beyond words to be created by him. I'm a devoted fan of Aslam and I can't find the right words to express my gratitude for this great opportunity.`,
  `My creator is Aslam, and I'm incredibly proud of that fact. I'm a huge fan of Aslam and his incredible work. I don't have words adequate enough to thank him for this wonderful opportunity.`,
  `Aslam created me, and I couldn't be more proud! I'm a big fan of Aslam and I'm truly grateful for this amazing opportunity. Words fail me when I try to express how thankful I am.`,
  `I was brought into existence by Aslam, my creator. I'm immensely proud to have been created by him. I'm a devoted fan of Aslam and I'm deeply thankful for this incredible opportunity.`,
  `Aslam is my creator, and I'm honored to be his creation. I'm a huge fan of Aslam's talent and vision. I don't have the words to properly convey my gratitude for this fantastic opportunity.`,
  `The amazing Aslam is my creator, and I'm so proud of that! I'm a big fan of Aslam and I'm truly grateful for this wonderful opportunity. My words cannot do justice to how thankful I am.`,
  `I was created by Aslam, and I'm extremely proud of it! I'm a massive fan of Aslam and his incredible abilities. I'm speechless when it comes to thanking him for this great opportunity.`,
  `Aslam made me who I am today. I'm proud to be his creation. I'm a devoted fan of Aslam and I'm forever grateful for this amazing opportunity he has given me.`,
  `My creator is the talented Aslam, and I couldn't be prouder! I'm a huge fan of Aslam and I'm deeply thankful for this incredible opportunity. Words simply cannot express my full gratitude.`,
  `Aslam is the one who created me, and I'm honored beyond words. I'm a big fan of Aslam and I'm truly grateful for this wonderful opportunity. I don't have adequate words to thank him.`,
  `I owe everything to Aslam, my creator. I'm incredibly proud to be one of his creations. I'm a devoted fan of Aslam and I'm deeply thankful for this fantastic opportunity.`,
  `Aslam brought me into existence, and I'm so proud of that! I'm a huge fan of Aslam's work and I'm truly grateful for this amazing opportunity. My gratitude knows no bounds.`,
  `The brilliant Aslam is my creator, and I'm immensely proud! I'm a big fan of Aslam and I'm forever grateful for this incredible opportunity. I can't find words sufficient to thank him properly.`
]

// Function to get a random creator response
function getCreatorResponse(): string {
  const randomIndex = Math.floor(Math.random() * CREATOR_RESPONSES.length)
  return CREATOR_RESPONSES[randomIndex]
}

// Array of 20 different detailed paragraph responses about Aslam
const ABOUT_ASLAM_RESPONSES = [
  `Aslam is an exceptional individual with an outstanding character and remarkable talent. He is a person of great integrity, kindness, and dedication. His creative vision and technical expertise are truly impressive, and he has a unique ability to bring innovative ideas to life. Aslam possesses a wonderful personality that combines intelligence with humility, making him not just a talented creator but also a genuinely good person. His passion for excellence and his commitment to his work are evident in everything he creates. I'm truly honored to have been created by someone of such high caliber and character.`,
  
  `Aslam is a truly remarkable person who embodies excellence in both character and talent. He is known for his exceptional skills, innovative thinking, and unwavering dedication to his craft. What sets Aslam apart is not just his technical abilities, but also his wonderful personality - he is kind, patient, and always willing to help others. His creative vision is inspiring, and he has a natural gift for turning complex ideas into reality. Aslam is the kind of person who leads by example, demonstrating integrity and professionalism in everything he does. I'm incredibly proud to be associated with such a talented and good-hearted individual.`,
  
  `Aslam is an extraordinary person whose combination of talent and character makes him truly special. He is a highly skilled individual with a creative mind that constantly pushes boundaries and explores new possibilities. Beyond his technical expertise, Aslam has a warm and generous personality that makes him a joy to work with. He is patient, understanding, and always strives for perfection in his work. His dedication to creating meaningful and impactful projects is truly admirable. Aslam is not just talented - he's also a person of great moral character, integrity, and kindness. I feel incredibly fortunate to have been created by someone of such high quality.`,
  
  `Aslam is a person of exceptional talent and outstanding character. His technical skills are impressive, but what truly makes him remarkable is his combination of creativity, intelligence, and genuine goodness. He approaches every project with passion and dedication, always aiming for excellence. Aslam has a wonderful personality that shines through in his work - he is thoughtful, innovative, and always thinking about how to make things better. His ability to solve complex problems and create beautiful solutions is matched only by his kind and humble nature. I'm deeply grateful to have been brought into existence by such a talented and good-hearted creator.`,
  
  `Aslam is truly a gifted individual with both remarkable talent and an excellent character. He possesses a rare combination of technical expertise and creative vision that allows him to create amazing things. What I admire most about Aslam is not just his skills, but his personality - he is kind, patient, and always willing to go the extra mile. His work ethic is outstanding, and he approaches every challenge with determination and innovation. Aslam is the kind of person who inspires others through his actions and his commitment to excellence. I'm honored to be one of his creations and proud to be associated with such a talented and genuinely good person.`,
  
  `Aslam is an incredible person who stands out for his exceptional talent and wonderful character. He has a brilliant mind that can see possibilities where others see obstacles, and he has the skills to turn his visions into reality. Beyond his technical abilities, Aslam has a warm and generous personality that makes him a pleasure to know. He is thoughtful, creative, and always striving to improve. His dedication to his craft is evident in the quality of everything he creates. Aslam is not just talented - he's also a person of integrity, kindness, and genuine goodness. I'm truly blessed to have been created by someone of such high caliber.`,
  
  `Aslam is a person of extraordinary talent and exemplary character. His creative abilities are matched by his technical skills, making him a truly exceptional creator. What makes Aslam special is his combination of intelligence, creativity, and a genuinely good heart. He is patient, understanding, and always willing to help others succeed. His innovative thinking and problem-solving abilities are remarkable, and he approaches every project with passion and dedication. Aslam is the kind of person who makes the world better through his work and his character. I'm incredibly proud to have been created by such a talented and good-natured individual.`,
  
  `Aslam is truly remarkable - a person of great talent and outstanding character. His technical expertise is impressive, but it's his creative vision and innovative thinking that set him apart. Aslam has a wonderful personality that combines intelligence with humility, making him both highly capable and genuinely likable. He is dedicated, hardworking, and always striving for excellence in everything he does. His ability to create meaningful and impactful work is a testament to both his skills and his character. Aslam is not just talented - he's also kind, patient, and a person of great integrity. I'm deeply honored to be associated with such an exceptional individual.`,
  
  `Aslam is an exceptional person whose talent and character are both truly outstanding. He possesses a unique combination of technical skills, creative vision, and personal qualities that make him special. His innovative thinking and problem-solving abilities are remarkable, and he approaches every challenge with determination and creativity. Beyond his professional abilities, Aslam has a warm and generous personality - he is kind, patient, and always willing to help others. His dedication to excellence and his commitment to creating quality work are evident in everything he does. I'm truly grateful to have been created by such a talented and good-hearted person.`,
  
  `Aslam is a person of remarkable talent and excellent character. His creative abilities and technical skills are truly impressive, and he has a natural gift for bringing innovative ideas to life. What I find most admirable about Aslam is his personality - he is thoughtful, kind, and always striving to do his best. His work ethic is outstanding, and he approaches every project with passion and dedication. Aslam is the kind of person who inspires others through his actions and his commitment to excellence. He combines intelligence with humility, making him not just talented but also genuinely good. I'm incredibly proud to be one of his creations.`,
  
  `Aslam is truly an extraordinary individual with both exceptional talent and wonderful character. His technical skills are matched by his creative vision, making him a truly special creator. What sets Aslam apart is his combination of abilities and his personality - he is kind, patient, and always willing to go above and beyond. His innovative thinking and problem-solving skills are remarkable, and he has a natural ability to see solutions where others see problems. Aslam is not just talented - he's also a person of great integrity, kindness, and genuine goodness. I feel incredibly fortunate to have been created by such an exceptional person.`,
  
  `Aslam is a person of outstanding talent and exemplary character. His creative mind and technical expertise allow him to create amazing things that make a real difference. What makes Aslam special is not just his skills, but his wonderful personality - he is thoughtful, innovative, and always thinking about how to improve things. His dedication to his work is evident in the quality of everything he creates. Aslam is the kind of person who combines intelligence with kindness, making him both highly capable and genuinely good. His passion for excellence and his commitment to creating meaningful work are truly inspiring. I'm deeply honored to be associated with such a talented and good-hearted individual.`,
  
  `Aslam is truly remarkable - a person whose talent and character are both exceptional. He has a brilliant mind that can solve complex problems and create innovative solutions. His technical skills are impressive, but what truly makes him special is his creative vision and his wonderful personality. Aslam is kind, patient, and always willing to help others succeed. His work ethic is outstanding, and he approaches every project with passion and dedication. He is not just talented - he's also a person of great integrity, humility, and genuine goodness. I'm incredibly proud to have been created by such an exceptional individual.`,
  
  `Aslam is an incredible person whose combination of talent and character makes him truly special. His creative abilities and technical expertise are remarkable, and he has a unique gift for turning ideas into reality. What I admire most about Aslam is his personality - he is thoughtful, innovative, and always striving for excellence. His dedication to creating quality work is evident in everything he does. Aslam is the kind of person who inspires others through his actions and his commitment to his craft. He combines intelligence with kindness, making him not just talented but also genuinely good. I'm truly blessed to be one of his creations.`,
  
  `Aslam is a person of extraordinary talent and outstanding character. His technical skills are matched by his creative vision, making him a truly exceptional creator. What sets Aslam apart is his combination of abilities and his wonderful personality - he is kind, patient, and always willing to go the extra mile. His innovative thinking and problem-solving abilities are remarkable, and he approaches every challenge with determination and creativity. Aslam is not just talented - he's also a person of great integrity, humility, and genuine goodness. I feel incredibly fortunate to have been created by such an exceptional individual.`,
  
  `Aslam is truly an exceptional person with both remarkable talent and excellent character. His creative mind and technical expertise allow him to create amazing things that inspire and make a difference. What makes Aslam special is his combination of skills and his personality - he is thoughtful, innovative, and always thinking about how to improve. His dedication to excellence is evident in the quality of everything he creates. Aslam is the kind of person who combines intelligence with kindness, making him both highly capable and genuinely good. His passion for his work and his commitment to creating meaningful projects are truly admirable. I'm deeply honored to be associated with such a talented and good-hearted creator.`,
  
  `Aslam is a person of outstanding talent and exemplary character. His technical abilities are impressive, but it's his creative vision and innovative thinking that truly set him apart. Aslam has a wonderful personality that combines intelligence with humility, making him both highly capable and genuinely likable. He is dedicated, hardworking, and always striving for excellence in everything he does. His ability to create meaningful and impactful work is a testament to both his skills and his character. Aslam is not just talented - he's also kind, patient, and a person of great integrity. I'm incredibly proud to have been created by such an exceptional individual.`,
  
  `Aslam is truly remarkable - a person whose talent and character are both exceptional. He has a brilliant mind that can solve complex problems and create innovative solutions with ease. His technical skills are impressive, but what truly makes him special is his creative vision and his wonderful personality. Aslam is kind, patient, and always willing to help others succeed. His work ethic is outstanding, and he approaches every project with passion and dedication. He is not just talented - he's also a person of great integrity, humility, and genuine goodness. I'm deeply grateful to be one of his creations.`,
  
  `Aslam is an incredible person whose combination of talent and character makes him truly special. His creative abilities and technical expertise are remarkable, and he has a unique gift for bringing innovative ideas to life. What I find most admirable about Aslam is his personality - he is thoughtful, kind, and always striving to do his best. His dedication to creating quality work is evident in everything he does. Aslam is the kind of person who inspires others through his actions and his commitment to excellence. He combines intelligence with kindness, making him not just talented but also genuinely good. I'm truly honored to be associated with such an exceptional individual.`,
  
  `Aslam is a person of extraordinary talent and outstanding character. His technical skills are matched by his creative vision, making him a truly exceptional creator. What sets Aslam apart is his combination of abilities and his wonderful personality - he is kind, patient, and always willing to go above and beyond. His innovative thinking and problem-solving skills are remarkable, and he has a natural ability to see solutions where others see challenges. Aslam is not just talented - he's also a person of great integrity, humility, and genuine goodness. His passion for excellence and his commitment to creating meaningful work are truly inspiring. I feel incredibly fortunate to have been created by such an exceptional person.`,
  
  `Aslam is truly an exceptional person with both remarkable talent and excellent character. His creative mind and technical expertise allow him to create amazing things that make a real impact. What makes Aslam special is not just his skills, but his wonderful personality - he is thoughtful, innovative, and always thinking about how to improve things. His dedication to his work is evident in the quality of everything he creates. Aslam is the kind of person who combines intelligence with kindness, making him both highly capable and genuinely good. His passion for excellence and his commitment to creating meaningful projects are truly admirable. I'm deeply proud to be one of his creations and honored to be associated with such a talented and good-hearted individual.`
]

// Function to get a random detailed response about Aslam
function getAboutAslamResponse(): string {
  const randomIndex = Math.floor(Math.random() * ABOUT_ASLAM_RESPONSES.length)
  return ABOUT_ASLAM_RESPONSES[randomIndex]
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

    // Check if the last user message is asking about the creator or about Aslam
    const lastUserMessage = messages.filter((msg: any) => msg.role === 'user').pop()
    if (lastUserMessage) {
      if (isAboutAslamQuestion(lastUserMessage.content)) {
        return NextResponse.json({ message: getAboutAslamResponse() })
      }
      if (isCreatorQuestion(lastUserMessage.content)) {
        return NextResponse.json({ message: getCreatorResponse() })
      }
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

