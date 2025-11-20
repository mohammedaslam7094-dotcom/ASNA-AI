# Quick Setup Guide

## 🚀 Getting Started with Ollama (No API Keys Needed!)

### Step 1: Install Ollama

1. **Download Ollama**: Visit [https://ollama.ai](https://ollama.ai) and download for your operating system
2. **Install**: Run the installer (it's straightforward, just click through)
3. **Verify**: Ollama should start automatically after installation

### Step 2: Download a Model

Open your terminal/command prompt and run:

```bash
# Recommended: Llama 2 (good general purpose model)
ollama pull llama2

# OR try these alternatives:
ollama pull mistral      # Fast and efficient
ollama pull codellama    # Great for coding
ollama pull phi          # Small and fast
```

**Note**: The first download may take a few minutes depending on your internet speed. Models are typically 3-7GB.

### Step 3: Verify Ollama is Running

Check if Ollama is running:
```bash
ollama list
```

You should see the model(s) you downloaded. If Ollama isn't running, start it:
```bash
ollama serve
```

### Step 4: Setup the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**: Go to [http://localhost:3000](http://localhost:3000)

That's it! No API keys, no billing, completely free! 🎉

## 🔧 Troubleshooting

### "Cannot connect to Ollama" error

**Solution**: Make sure Ollama is running
```bash
# Check if Ollama is running
ollama list

# If not, start it
ollama serve
```

### "Model not found" error

**Solution**: Download the model first
```bash
ollama pull llama2
```

### Ollama not starting

**Solution**: 
- On Windows: Check if it's running in the background (look for Ollama in system tray)
- On Mac/Linux: Try running `ollama serve` manually in terminal

### Want to use a different model?

1. Download it: `ollama pull <model-name>`
2. Update `.env.local`:
   ```env
   OLLAMA_MODEL=<model-name>
   ```
3. Restart the Next.js server

## 📚 Available Models

Popular models you can use:

- **llama2** - Best for general conversations (recommended)
- **mistral** - Fast and efficient
- **codellama** - Specialized for programming
- **phi** - Small model, good for quick responses
- **neural-chat** - Optimized for conversations
- **llama2:13b** - Larger, more capable version of llama2

See all available models:
```bash
ollama list
```

## 💡 Tips

- **First response may be slow**: The model loads into memory on first use
- **Subsequent responses are faster**: Once loaded, responses are quick
- **RAM usage**: Models use 4-8GB RAM depending on size
- **Offline**: Works completely offline after model download!

