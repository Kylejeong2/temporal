/* eslint-disable @typescript-eslint/no-unused-vars */
import { proxyActivities, sleep } from '@temporalio/workflow';
import { ApplicationFailure } from '@temporalio/common';
import type * as researchActivities from './research-activities';
import type { ResearchTask, SearchResult } from './research-activities';

export interface ResearchProgress {
  searchCompleted: boolean;
  reportGenerated: boolean;
  searchResults: SearchResult[];
}

export async function digitalResearchWorkflow(task: ResearchTask): Promise<string> {
  console.log('\n🎬 WORKFLOW STARTING');
  console.log('='.repeat(50));
  console.log(`📝 Task: ${JSON.stringify(task, null, 2)}`);
  
  const { 
    searchGoogle,
    generateReport,
    simulateNetworkFailure 
  } = proxyActivities<typeof researchActivities>({
    retry: {
      initialInterval: '2 seconds',
      maximumInterval: '60 seconds',
      backoffCoefficient: 1.5,
      maximumAttempts: 5,
    },
    startToCloseTimeout: '5 minutes',
    scheduleToCloseTimeout: '10 minutes',
  });

  const progress: ResearchProgress = {
    searchCompleted: false,
    reportGenerated: false,
    searchResults: [],
  };

  console.log(`🧠 Starting research workflow for: "${task.topic}"`);
  console.log(`👤 Researcher ID: ${task.researcherId}`);

  try {
    // Step 1: Search Google
    if (!progress.searchCompleted) {
      console.log('\n📍 STEP 1: Google Search');
      console.log('='.repeat(30));
      console.log(`🔍 About to search Google for: "${task.topic}"`);
      console.log(`🔄 Retry policy: max 5 attempts, 2s-60s intervals`);
      
      console.log('🎲 Running network failure simulation...');
      await simulateNetworkFailure(0.4); // 40% chance of failure
      
      console.log('🚀 Calling searchGoogle activity...');
      const searchResults = await searchGoogle(task.topic);
      
      progress.searchCompleted = true;
      progress.searchResults = searchResults;
      
      console.log(`✅ Step 1 completed successfully`);
      console.log(`📊 Search results received: ${searchResults.length} items`);
      console.log('🔍 Search results preview:');
      searchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title}`);
        console.log(`      URL: ${result.url}`);
        console.log(`      Snippet: ${result.snippet.slice(0, 60)}...`);
      });
      
      await sleep('1 second');
    }

    // Step 2: Generate report
    if (!progress.reportGenerated) {
      console.log('\n📍 STEP 2: Report Generation');
      console.log('='.repeat(30));
      console.log(`📝 About to generate report for: "${task.topic}"`);
      console.log(`📊 Using ${progress.searchResults.length} search results`);
      
      console.log('🎲 Running network failure simulation...');
      await simulateNetworkFailure(0.3); // 30% chance of failure
      
      console.log('🚀 Calling generateReport activity...');
      const reportPath = await generateReport(task.topic, progress.searchResults);
      
      progress.reportGenerated = true;
      console.log(`✅ Step 2 completed successfully`);
      console.log(`📄 Report saved to: ${reportPath}`);
    }

    const finalMessage = `🎉 Research workflow completed successfully! 
📊 Found ${progress.searchResults.length} search results
📝 Generated report for: "${task.topic}"
👤 Researcher: ${task.researcherId}`;

    console.log('\n🏁 WORKFLOW COMPLETED');
    console.log('='.repeat(50));
    console.log(finalMessage);
    
    return finalMessage;

  } catch (error: any) {
    console.log('\n❌ WORKFLOW FAILED');
    console.log('='.repeat(50));
    console.log(`Error type: ${error.constructor.name}`);
    console.log(`Error message: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    console.log(`Progress at failure:`, JSON.stringify(progress, null, 2));
    console.log('='.repeat(50));
    
    throw new ApplicationFailure(`Research workflow failed: ${error}`, 'ResearchWorkflowError');
  }
}
