# 🚀 Stagehand Research Setup Guide

## Required API Keys

To run the Temporal + Stagehand research demo, you need LLM API keys:

### Option 1: OpenAI (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to your `.env` file: `OPENAI_API_KEY=sk-...`

### Option 2: Anthropic
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key  
3. Add to your `.env` file: `ANTHROPIC_API_KEY=sk-ant-...`

### Optional: Browserbase (for cloud browsers)
1. Go to https://www.browserbase.com/
2. Sign up and get API key + Project ID
3. Add to your `.env` file:
   ```
   BROWSERBASE_API_KEY=your_api_key
   BROWSERBASE_PROJECT_ID=your_project_id
   ```

## Quick Setup

1. Copy the example env file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   nano .env
   ```

3. Install Playwright browsers (for local mode):
   ```bash
   npx playwright install chromium
   ```

4. Test the setup:
   ```bash
   npm run research-demo
   ```

## Environment Variables

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# LLM API Keys (choose one)
OPENAI_API_KEY=sk-your-openai-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Optional: Browserbase (for cloud browsers)
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# Research Output Directory
RESEARCH_OUTPUT_DIR=./research_outputs
```

## What Each Component Does

- **OpenAI/Anthropic**: Powers Stagehand's natural language browser automation
- **Browserbase**: Provides cloud browsers (optional, falls back to local Chrome)
- **Temporal**: Orchestrates the research workflow with resilience
- **Research Outputs**: All scraped content is saved to JSON files for inspection

## Verification

After setup, you should see:
```
🤖 Using OpenAI GPT-4o for Stagehand
✅ Stagehand initialized successfully
🔍 Conducting research on: "your topic"
💾 Saved scraped content to: ./research_outputs/...
```

## Troubleshooting

- **No LLM API key error**: Make sure you've set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- **Browser launch fails**: Run `npx playwright install chromium`
- **Network errors**: Some sites block automation - this is expected, the system handles failures gracefully
- **No scraped content**: Check the `research_outputs/` directory for detailed JSON files

The system is designed to be resilient - it continues working even if individual sources fail! 