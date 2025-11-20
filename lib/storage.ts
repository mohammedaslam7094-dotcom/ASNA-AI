export interface Chat {
  id: string
  title: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  createdAt: number
  updatedAt: number
}

const STORAGE_KEYS = {
  CHATS: 'chatgpt-clone-chats',
  CURRENT_CHAT_ID: 'chatgpt-clone-current-chat-id',
  THEME: 'chatgpt-clone-theme',
  SELECTED_MODEL: 'chatgpt-clone-selected-model',
}

export const storage = {
  // Chat History
  getChats: (): Chat[] => {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  saveChat: (chat: Chat): void => {
    if (typeof window === 'undefined') return
    try {
      const chats = storage.getChats()
      const index = chats.findIndex((c) => c.id === chat.id)
      if (index >= 0) {
        chats[index] = chat
      } else {
        chats.unshift(chat)
      }
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats))
    } catch (error) {
      console.error('Failed to save chat:', error)
    }
  },

  deleteChat: (chatId: string): void => {
    if (typeof window === 'undefined') return
    try {
      const chats = storage.getChats()
      const filtered = chats.filter((c) => c.id !== chatId)
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  },

  getChat: (chatId: string): Chat | null => {
    const chats = storage.getChats()
    return chats.find((c) => c.id === chatId) || null
  },

  // Current Chat
  getCurrentChatId: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT_ID)
  },

  setCurrentChatId: (chatId: string | null): void => {
    if (typeof window === 'undefined') return
    if (chatId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT_ID, chatId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT_ID)
    }
  },

  // Theme
  getTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark'
      return theme || 'dark'
    } catch {
      return 'dark'
    }
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  },

  // Model
  getSelectedModel: (): string => {
    if (typeof window === 'undefined') return 'llama-3.1-8b-instant'
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'llama-3.1-8b-instant'
    } catch {
      return 'llama-3.1-8b-instant'
    }
  },

  setSelectedModel: (model: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model)
  },
}

