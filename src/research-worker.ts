import { Worker } from '@temporalio/worker';
import * as researchActivities from './research-activities';

async function run() {
  console.log('🧠 Starting Digital Research Assistant Worker');
  console.log('='.repeat(55));
  
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities: researchActivities,
    taskQueue: 'research-automation',
    maxHeartbeatThrottleInterval: '90 seconds',
    maxActivitiesPerSecond: 5,
    maxConcurrentActivityTaskExecutions: 3,
  });

  console.log('✅ Research Worker configured with:');
  console.log('   🧠 Digital Research Workflows');
  console.log('   🌐 Stagehand browser automation');
  console.log('   🎯 Task queue: research-automation');
  console.log('   🔄 Max activities per second: 5');
  console.log('   🖥️  Max concurrent browser sessions: 3');
  console.log('   ⚡ High failure simulation enabled');
  console.log('   🎲 Failure rates: 40% search, 30% report, 15% navigation, 20% extraction');
  console.log('='.repeat(55));
  console.log('📚 Ready to process research requests...\n');

  // Start accepting research tasks
  await worker.run();
}

run().catch((err) => {
  console.error('❌ Research worker failed to start:', err);
  process.exit(1);
}); 