#!/usr/bin/env ts-node

import { Client } from '@temporalio/client';
import { digitalResearchWorkflow } from './workflows';
import type { ResearchTask } from './research-activities';
import { cleanup } from './research-activities';

async function runResearchDemo(topic?: string) {
  const client = new Client();

  const researchTask: ResearchTask = {
    topic: topic!,
    researcherId: 'demo-researcher',
  };

  console.log('🧠 Digital Research Assistant Demo');
  console.log('='.repeat(60));
  console.log(`📚 Research Topic: "${researchTask.topic}"`);
  console.log(`🔍 Source: Google Search`);
  console.log(`📊 Mode: Simplified`);
  console.log('='.repeat(60));

  try {
    const handle = await client.workflow.start(digitalResearchWorkflow, {
      args: [researchTask],
      taskQueue: 'research-automation',
      workflowId: `research-${Date.now()}-${researchTask.topic.replace(/\s+/g, '-')}`,
    });

    console.log(`🚀 Research workflow started!`);
    console.log(`📊 Workflow ID: ${handle.workflowId}`);
    console.log(`🔗 Monitor progress: http://localhost:8233/namespaces/default/workflows/${handle.workflowId}`);
    console.log('\n🎯 Demo Features:');
    console.log('   ✅ Google search with Stagehand');
    console.log('   ✅ Simple content extraction');
    console.log('   ✅ Automatic retry on failures');
    console.log('   ✅ JSON file output');
    console.log('\n⏳ Research in progress...');

    // Wait for research completion
    const result = await handle.result();
    
    console.log('\n🎉 RESEARCH COMPLETED!');
    console.log('='.repeat(60));
    console.log(result);
    console.log('='.repeat(60));
    console.log('✅ Research workflow completed successfully!');

  } catch (error) {
    console.error('\n❌ RESEARCH FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error}`);
    console.error('='.repeat(60));
  }
}

async function runStressTest() {
  console.log('🔥 Research Assistant Stress Test');
  console.log('='.repeat(50));
  console.log('This demo runs 6 research tasks to test 3 concurrent sessions');
  console.log('with high failure simulation rates (40% search, 30% report)\n');

  const client = new Client({});
  
  const stressTopics = [
    'artificial intelligence trends',
    'cybersecurity threats 2024',
    'renewable energy innovations',
    'space exploration missions',
    'biotechnology breakthroughs',
    'climate change solutions'
  ];

  console.log(`🚀 Starting ${stressTopics.length} concurrent research tasks...`);
  console.log('📊 Expected behavior:');
  console.log('   - Max 3 browser sessions running simultaneously');
  console.log('   - High failure rates will trigger retries');
  console.log('   - Some tasks may fail completely after 3 attempts\n');

  const promises = stressTopics.map(async (topic, index) => {
    const task: ResearchTask = {
      topic,
      researcherId: `stress-test-${index + 1}`,
    };

    console.log(`🎯 [${index + 1}] Starting: "${topic}"`);

    const handle = await client.workflow.start(digitalResearchWorkflow, {
      args: [task],
      taskQueue: 'research-automation',
      workflowId: `stress-test-${Date.now()}-${index}`,
    });

    return { topic, handle };
  });

  try {
    const startTime = Date.now();
    const results = await Promise.allSettled(promises.map(p => p.then(({ handle }) => handle.result())));
    const endTime = Date.now();
    
    console.log('\n🏁 STRESS TEST COMPLETED!');
    console.log('='.repeat(50));
    console.log(`⏱️  Total time: ${((endTime - startTime) / 1000).toFixed(1)}s`);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful: ${successful}/${stressTopics.length}`);
    console.log(`❌ Failed: ${failed}/${stressTopics.length}`);
    console.log(`📊 Success rate: ${((successful / stressTopics.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed tasks:');
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`   ${index + 1}. ${stressTopics[index]}: ${result.reason}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Stress test failed:', error);
  } finally {
    // Clean up browser sessions
    console.log('\n🧹 Cleaning up browser sessions...');
    await cleanup();
  }
}

async function main() {
  console.log('🧠 Temporal + Stagehand: Simple Research Demo');
  console.log('==================================================\n');

  const args = process.argv.slice(2);
  const command = args[0] || 'demo';
  const customTopic = args.slice(1).join(' ');

  switch (command) {
    case 'demo':
      if (customTopic) {
        await runResearchDemo(customTopic);
      }
      break;
    case 'stress':
      await runStressTest();
      break;
    default:
      console.log('Usage: ts-node src/research-demo.ts [demo|benchmark|stress|custom] [topic]');
      console.log('');
      console.log('Commands:');
      console.log('  demo          - Run interactive research demo (default)');
      console.log('  benchmark     - Run concurrent research benchmark');
      console.log('  stress        - Run stress test');
      console.log('  custom <topic>- Research a custom topic');
      console.log('');
      console.log('Examples:');
      console.log('  npm run research-demo');
      console.log('  npm run research-demo custom "space exploration 2024"');
      console.log('  npm run research-demo benchmark');
      console.log('  npm run research-demo stress');
      break;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Research demo failed:', err);
    process.exit(1);
  });
} 