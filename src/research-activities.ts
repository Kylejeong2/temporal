import { Stagehand, ConstructorParams } from '@browserbasehq/stagehand';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Simplified types
export interface ResearchTask {
  topic: string;
  researcherId: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Create a new Stagehand instance for each operation
async function createStagehand(): Promise<Stagehand> {
  console.log('🔧 Creating new Stagehand instance...');
  const config: ConstructorParams = {
    verbose: 1,
    domSettleTimeoutMs: 30_000,
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    browserbaseSessionCreateParams: {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      proxies: true,
      browserSettings: {
        advancedStealth: true,
      },
    },
    localBrowserLaunchOptions: {
      viewport: {
        width: 1024,
        height: 768,
      },
    },
  };

  // Check for API keys
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('🚨 No LLM API key found! Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file');
  }

  console.log('🤖 Initializing Stagehand...');
  const stagehand = new Stagehand(config);
  await stagehand.init();
  console.log('✅ Stagehand initialized successfully');
  
  return stagehand;
}

// Simplified failure simulation
export async function simulateNetworkFailure(probability: number): Promise<void> {
  const shouldFail = Math.random() < probability;
  console.log(`🎲 Network failure simulation: ${shouldFail ? 'FAILING' : 'PASSING'} (${(probability * 100).toFixed(1)}% chance)`);
  
  if (shouldFail) {
    // Simulate different types of failures
    const failureTypes = [
      'Simulated network timeout',
      'Simulated connection refused', 
      'Simulated DNS resolution failure',
      'Simulated rate limiting',
      'Simulated server error'
    ];
    const randomFailure = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    throw new Error(randomFailure);
  }
}

// Simplified Google search only
export async function searchGoogle(topic: string): Promise<SearchResult[]> {
  const searchId = Math.random().toString(36).substring(2, 8);
  console.log(`\n🚀 Starting searchGoogle function [${searchId}]`);
  console.log(`📝 Search topic: "${topic}" [${searchId}]`);
  
  // Simulate failure at the start of the actual work
  console.log('🎲 Running search failure simulation (40% chance)...');
  await simulateNetworkFailure(0.4);
  
  let stagehand: Stagehand | null = null;
  
  try {
    // Create a fresh Stagehand instance for this search
    stagehand = await createStagehand();
    console.log(`✅ Got new Stagehand instance [${searchId}]`);
    
    console.log(`🌐 Navigating to Google [${searchId}]...`);
    await stagehand.page.goto('https://www.google.com');
    console.log(`📍 Current URL after navigation [${searchId}]: ${stagehand.page.url()}`);
    
    // Simulate failure after navigation
    await simulateNetworkFailure(0.15); // 15% chance of failure after navigation
    
    console.log(`🔍 Attempting to search for: "${topic}"`);
   
    const search = await stagehand.page.act({
      action: `Find the Google search input box, click on it`
    });
    
    const type = await stagehand.page.act({
      action: `Type "${topic}" into the search input box`
    });

    const pressEnter = await stagehand.page.act({
      action: `Press Enter to search`
    });
    
    console.log('🔍 Search:', search);
    console.log('🔍 Type:', type);
    console.log('🔍 Press Enter:', pressEnter);
    
    console.log('⏳ Waiting 3 seconds for search results...');
    await stagehand.page.waitForTimeout(3000);
    
    // Simulate failure before extraction
    await simulateNetworkFailure(0.2); // 20% chance of failure before extraction
    
    console.log('📊 Attempting to extract search results...');
    
    const extraction = await stagehand.page.extract({
      instruction: `
      Extract the top 3 organic search results from this Google search results page. 
      For each result, get the title, URL, and description snippet.
      Do NOT include ads, shopping results, or featured snippets.`,
      schema: z.object({
        results: z.array(z.object({
          title: z.string().describe('The main title/headline of the search result'),
          url: z.string().describe('The URL of the search result'), 
          snippet: z.string().describe('The description text below the title'),
        }))
      })
    });

    console.log('✅ Extraction completed');
    console.log('📊 Raw extraction result:', JSON.stringify(extraction, null, 2));
    
    if (!extraction || !extraction.results || extraction.results.length === 0) {
      console.log('❌ No extraction results found!');
      
      // Try a simpler extraction as fallback
      console.log('🔄 Trying simpler extraction...');
      const simpleExtraction = await stagehand.page.extract({
        instruction: `Find any search results on this page and extract their titles and URLs`,
        schema: z.object({
          results: z.array(z.object({
            title: z.string(),
            url: z.string(),
          }))
        })
      });
      
      if (simpleExtraction && simpleExtraction.results && simpleExtraction.results.length > 0) {
        console.log('✅ Simple extraction found results');
        return simpleExtraction.results.slice(0, 3).map(r => ({
          title: r.title,
          url: r.url,
          snippet: 'No description available'
        }));
      }
      
      return [];
    }
    
    console.log(`📈 Found ${extraction.results.length} raw results`);

    const results = extraction.results.slice(0, 3).map((r, index) => {
      console.log(`🔍 Processing result ${index + 1}:`);
      console.log(`   Title: ${r.title}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Snippet: ${r.snippet}`);
      
      return {
        title: r.title,
        url: r.url,
        snippet: r.snippet
      };
    });
    
    return results;
    
  } catch (error: any) {
    console.log('\n❌ SEARCH ERROR OCCURRED:');
    console.log(`Session: [${searchId}]`);
    console.log(`Error type: ${error.constructor.name}`);
    console.log(`Error message: ${error.message}`);
    
    // Log retry information if available
    if (error.attempt) {
      console.log(`🔄 Retry attempt: ${error.attempt}`);
    }
    
    // For simulated failures, make them clearly retryable
    if (error.message.includes('Simulated')) {
      console.log('🎲 This is a simulated failure - should be retried by Temporal');
      // Re-throw as a retryable error
      throw new Error(`Retryable simulated failure: ${error.message}`);
    }
    
    // For other errors, still make them retryable unless they're clearly permanent
    console.log('🔄 Treating as retryable error');
    throw error; // Let Temporal handle the retry logic
    
  } finally {
    // Always close the browser since we're not caching sessions
    if (stagehand) {
      try {
        console.log(`🧹 Closing browser [${searchId}]...`);
        await stagehand.page.close();
        console.log(`✅ Browser [${searchId}] closed`);
      } catch (closeError: any) {
        console.log(`⚠️ Error closing browser [${searchId}]:`, closeError.message);
      }
    }
  }
}

// Generate a nice text report instead of fake URLs
export async function generateReport(topic: string, results: SearchResult[]): Promise<string> {
  console.log('\n📝 Starting generateReport function');
  console.log(`📝 Report topic: "${topic}"`);
  console.log(`📊 Number of results to include: ${results.length}`);
  
  // Simulate failure at the start of the actual work
  console.log('🎲 Running report failure simulation (30% chance)...');
  await simulateNetworkFailure(0.3);
  
  // Create report content
  const reportContent = [
    '='.repeat(60),
    `RESEARCH REPORT: ${topic.toUpperCase()}`,
    '='.repeat(60),
    '',
    `Generated: ${new Date().toISOString()}`,
    `Researcher ID: demo-researcher`,
    '',
    '📊 SEARCH RESULTS SUMMARY',
    '-'.repeat(40),
    ''
  ];

  if (results.length === 0) {
    reportContent.push('No search results found. This could be due to:');
    reportContent.push('- Search query not returning results');
    reportContent.push('- Network connectivity issues');
    reportContent.push('- Browser automation challenges');
    reportContent.push('');
    reportContent.push('The search process completed but no results were extracted.');
  } else {
    results.forEach((result, index) => {
      reportContent.push(`${index + 1}. ${result.title}`);
      reportContent.push(`   URL: ${result.url}`);
      reportContent.push(`   Summary: ${result.snippet}`);
      reportContent.push('');
    });
    
    reportContent.push('-'.repeat(40));
    reportContent.push('📌 KEY FINDINGS');
    reportContent.push('-'.repeat(40));
    reportContent.push(`Total results found: ${results.length}`);
    reportContent.push(`Search topic: "${topic}"`);
    reportContent.push('');
    reportContent.push('This report contains the top search results from Google.');
    reportContent.push('For more detailed analysis, consider:');
    reportContent.push('- Visiting each URL for full content');
    reportContent.push('- Cross-referencing multiple sources');
    reportContent.push('- Checking publication dates for relevance');
  }
  
  reportContent.push('');
  reportContent.push('='.repeat(60));
  reportContent.push('END OF REPORT');
  reportContent.push('='.repeat(60));
  
  // Save report as text file
  const outputDir = './research_outputs';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-report-${topic.replace(/\s+/g, '-').slice(0, 20)}.txt`;
  const filepath = path.join(outputDir, filename);
  
  await fs.writeFile(filepath, reportContent.join('\n'));
  
  console.log(`✅ Report generated successfully`);
  console.log(`💾 Saved report to: ${filename}`);
  console.log(`📄 Report location: ${filepath}`);
  
  return filepath; 
}

export async function cleanup(): Promise<void> {
  console.log('\n🧹 Cleanup called (browsers close automatically after each search)');
} 