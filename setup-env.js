const fs = require('fs');
const path = require('path');

const envContent = `# Fast Free AI API Configuration
# Choose your provider: groq (fastest, recommended), huggingface, together, or gemini

# API Provider (default: groq)
# Options: groq, huggingface, together, gemini
API_PROVIDER=groq

# API Key - Get free API keys from:
# Groq: https://console.groq.com/keys (FASTEST - Recommended!)
# Hugging Face: https://huggingface.co/settings/tokens
# Together AI: https://api.together.xyz/settings/api-keys
# Google Gemini: https://makersuite.google.com/app/apikey
API_KEY=your_api_key_here

# Optional: Model configurations
# Groq models: llama-3.1-8b-instant (fast, recommended), llama-3.2-3b, llama-3.2-1b, mixtral-8x7b-32768, gemma2-9b-it
# Check available models at: https://console.groq.com/docs/models
GROQ_MODEL=llama-3.1-8b-instant

# Together AI models: mistralai/Mixtral-8x7B-Instruct-v0.1, meta-llama/Llama-2-70b-chat-hf
TOGETHER_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1

# Gemini models: gemini-pro, gemini-pro-vision
GEMINI_MODEL=gemini-pro

# Hugging Face model URL (if using custom model)
HUGGINGFACE_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  console.log('');
  console.log('🚀 FASTEST OPTION (Recommended):');
  console.log('   1. Get free API key from: https://console.groq.com/keys');
  console.log('   2. Set API_PROVIDER=groq and add your API_KEY');
  console.log('');
  console.log('📝 Other free options:');
  console.log('   - Hugging Face: https://huggingface.co/settings/tokens');
  console.log('   - Together AI: https://api.together.xyz/settings/api-keys');
  console.log('   - Google Gemini: https://makersuite.google.com/app/apikey');
} else {
  console.log('ℹ️  .env.local file already exists');
}

