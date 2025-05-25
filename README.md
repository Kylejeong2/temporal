# Temporal Research Workflow

Simple research automation using Temporal and Stagehand for Google search.

## Features

- **Google Search**: Automated search using Stagehand web automation
- **Content Extraction**: Extracts titles, URLs, and snippets from search results  
- **File Output**: Saves all scraped content to JSON files in `./research_outputs/`
- **Retry Logic**: Built-in retry for network failures
- **Real Browser**: Uses Playwright/Browserbase for realistic web interaction

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment** (copy `env.example` to `.env`):
```bash
cp env.example .env
```

3. **Add your API keys** to `.env`:
```
OPENAI_API_KEY=your_openai_key_here
BROWSERBASE_API_KEY=your_browserbase_key_here  
BROWSERBASE_PROJECT_ID=your_project_id_here
```

4. **Install browser**:
```bash
npx playwright install chromium
```

5. **Start Temporal server**:
```bash
npx @temporalio/cli@latest server start-dev
```

6. **Run the workflow**:
```bash
npm run dev
```

## How It Works

The workflow performs two simple steps:

1. **Google Search**: Uses Stagehand to search Google for your topic
2. **Report Generation**: Creates a simple report with the results

All extracted content is automatically saved to timestamped JSON files in `./research_outputs/`.

## Output Example

```json
{
  "topic": "artificial intelligence ethics",
  "results": [
    {
      "title": "AI Ethics Guidelines",
      "url": "https://example.com/ai-ethics",
      "snippet": "Comprehensive guide to ethical AI development..."
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Configuration

- **Local Browser**: Works without Browserbase (slower)
- **Cloud Browser**: Use Browserbase for faster, more reliable automation
- **LLM Provider**: Supports OpenAI or Anthropic for Stagehand

See `setup-stagehand.md` for detailed setup instructions.
