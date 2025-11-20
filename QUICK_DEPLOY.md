# ⚡ Quick Deploy to Vercel (5 Minutes)

## 🚀 Fastest Way to Go Live

### Step 1: Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "Ready to deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Vercel (3 min)
1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Project"**
3. Select your GitHub repo
4. Add Environment Variables:
   - `API_PROVIDER` = `groq`
   - `API_KEY` = `your_groq_api_key`
5. Click **"Deploy"**
6. **Done!** 🎉 Your app is live!

---

## 🔑 Get Free API Key (Groq - Fastest)

1. Visit: [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up (free, no credit card)
3. Create API key
4. Copy and paste into Vercel environment variables

---

## 📝 Full Guide

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

