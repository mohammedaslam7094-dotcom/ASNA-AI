# ⚡ Quick Start Guide - Get Running in 2 Minutes!

## 🚀 Fastest Setup (Groq - Recommended)

### Step 1: Get Free API Key (30 seconds)

1. Go to: **https://console.groq.com/keys**
2. Sign up (it's free, no credit card needed)
3. Click "Create API Key"
4. Copy your key (starts with `gsk_`)

### Step 2: Setup App (1 minute)

1. **Create `.env.local` file:**
   ```bash
   npm run setup-env
   ```

2. **Edit `.env.local`** and add your Groq API key:
   ```env
   API_PROVIDER=groq
   API_KEY=gsk_your_actual_key_here
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```

4. **Open browser:** http://localhost:3000

**That's it! You're ready to chat! ⚡**

## 🎯 Why Groq?

- ⚡ **Fastest responses** - Usually under 2 seconds
- 🆓 **Completely free** - Generous free tier
- 💪 **Handles heavy tasks** - Powerful cloud GPUs
- 🚀 **No downloads** - No need to install models
- ✅ **Easy setup** - Just an API key

## 🔄 Want to Try Other Providers?

### Hugging Face (Free)
```env
API_PROVIDER=huggingface
API_KEY=your_hf_token
```
Get key: https://huggingface.co/settings/tokens

### Together AI (Free Tier)
```env
API_PROVIDER=together
API_KEY=your_together_key
```
Get key: https://api.together.xyz/settings/api-keys

### Google Gemini (Free)
```env
API_PROVIDER=gemini
API_KEY=your_gemini_key
```
Get key: https://makersuite.google.com/app/apikey

## ❓ Troubleshooting

**"API key is required" error?**
- Make sure `.env.local` has `API_KEY=your_key`
- Restart the dev server: `npm run dev`

**Still slow?**
- Make sure you're using `API_PROVIDER=groq` (it's the fastest!)
- Check your internet connection

**Model decommissioned error?**
- The default model has been updated to `llama-3.1-8b-instant`
- If you see a model error, check current models: https://console.groq.com/docs/models
- Update `GROQ_MODEL` in `.env.local` to a current model

**Need help?**
- Check the main README.md for detailed instructions
- Make sure your API key is valid and has credits
- View current Groq models: https://console.groq.com/docs/models

---

**Enjoy your lightning-fast AI chat! 🚀**

