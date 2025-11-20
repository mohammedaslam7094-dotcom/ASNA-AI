# 🚀 Free Hosting Guide - Deploy to Vercel

This guide will help you deploy your ChatGPT Clone to **Vercel** (100% free, best for Next.js).

## 📋 Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - [Sign up here](https://vercel.com/signup)
3. An API key from one of the providers (Groq recommended)

## 🎯 Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new)
   - Name it (e.g., `chatgpt-clone`)
   - Make it public or private
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import your repository:**
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables:**
   - In the "Environment Variables" section, add:
     ```
     API_PROVIDER=groq
     API_KEY=your_actual_api_key_here
     ```
   - Optionally add:
     ```
     GROQ_MODEL=llama-3.1-8b-instant
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live! 🎉

### Step 3: Get Your Live URL

- Vercel will give you a URL like: `https://your-app-name.vercel.app`
- You can also add a custom domain (free)

---

## 🎯 Option 2: Deploy via Vercel CLI (Advanced)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default)
- Directory? (Press Enter for `./`)
- Override settings? **No**

### Step 4: Set Environment Variables

```bash
vercel env add API_PROVIDER
# Enter: groq

vercel env add API_KEY
# Enter: your_actual_api_key_here
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## 🔧 Environment Variables Setup

In Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required:
- `API_PROVIDER` = `groq` (or `huggingface`, `together`, `gemini`)
- `API_KEY` = Your API key from the provider

### Optional:
- `GROQ_MODEL` = `llama-3.1-8b-instant`
- `TOGETHER_MODEL` = `mistralai/Mixtral-8x7B-Instruct-v0.1`
- `GEMINI_MODEL` = `gemini-pro`
- `HUGGINGFACE_URL` = Your Hugging Face model URL

**Important:** Make sure to add these for **Production**, **Preview**, and **Development** environments.

---

## 🌐 Other Free Hosting Options

### Netlify (Alternative)

1. Push code to GitHub
2. Go to [netlify.com](https://www.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Add environment variables in Site settings → Environment variables

### Railway (Alternative)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in Variables tab
6. Deploy automatically starts

### Render (Alternative)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables in Environment section

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] API key is valid and has credits
- [ ] Test the chat functionality
- [ ] Check Vercel logs if there are errors
- [ ] (Optional) Add custom domain

---

## 🐛 Troubleshooting

### "API key is required" error
- Check environment variables in Vercel dashboard
- Make sure they're set for the correct environment (Production)
- Redeploy after adding variables

### Build fails
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)

### Slow responses
- Use Groq API (fastest)
- Check your API provider's status
- Verify you have remaining quota

---

## 🎉 You're Live!

Your ChatGPT clone is now hosted for free! Share your Vercel URL with others.

**Need help?** Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)

