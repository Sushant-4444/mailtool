// Job Queue Service using BullMQ
const { Queue, Worker } = require('bullmq');
const { sendCampaign } = require('./emailService');

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // Required for BullMQ
};

// Create a queue for campaign jobs
const campaignQueue = new Queue('campaigns', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,    // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Worker to process campaign jobs in the background
let campaignWorker = null;

const initWorker = () => {
  if (campaignWorker) {
    return campaignWorker; // Already initialized
  }

  campaignWorker = new Worker(
    'campaigns',
    async (job) => {
      const { campaignData } = job.data;
      
      console.log(`🔄 Processing Campaign Job #${job.id}...`);
      console.log(`📊 Recipients: ${campaignData.audience.length}`);
      
      // Update progress as we process
      await job.updateProgress(0);
      
      try {
        // Process the campaign (this is the long-running task)
        const result = await sendCampaign(campaignData);
        
        await job.updateProgress(100);
        
        console.log(`✅ Campaign Job #${job.id} completed successfully`);
        console.log(`📈 Stats: ${result.success} sent, ${result.failed} failed`);
        
        return result; // This becomes the job's return value
        
      } catch (error) {
        console.error(`❌ Campaign Job #${job.id} failed:`, error.message);
        throw error; // Will trigger retry mechanism
      }
    },
    {
      connection: redisConnection,
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'), // Process multiple campaigns simultaneously
      limiter: {
        max: parseInt(process.env.WORKER_MAX_JOBS || '5'),      // Max jobs
        duration: parseInt(process.env.WORKER_DURATION || '1000'), // per duration (ms)
      },
    }
  );

  // Event listeners for monitoring
  campaignWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed!`);
  });

  campaignWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  campaignWorker.on('error', (err) => {
    console.error('⚠️ Worker error:', err);
  });

  console.log('🏭 Campaign Worker initialized');
  
  return campaignWorker;
};

// Add a campaign to the queue
const queueCampaign = async (campaignData) => {
  const job = await campaignQueue.add('send-campaign', {
    campaignData,
  }, {
    // Job-specific options can be added here
    jobId: `campaign-${Date.now()}`, // Custom job ID
  });

  console.log(`📨 Campaign queued with Job ID: ${job.id}`);
  
  return {
    jobId: job.id,
    status: 'queued',
    message: 'Campaign has been queued for processing',
  };
};

// Get job status and result
const getJobStatus = async (jobId) => {
  const job = await campaignQueue.getJob(jobId);
  
  if (!job) {
    return {
      exists: false,
      message: 'Job not found',
    };
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnValue = job.returnvalue; // The result from sendCampaign

  return {
    exists: true,
    jobId: job.id,
    state, // 'waiting', 'active', 'completed', 'failed', 'delayed'
    progress,
    result: returnValue,
    failedReason: job.failedReason,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  };
};

// Get all jobs (for admin/monitoring)
const getAllJobs = async (status = 'completed', start = 0, end = 10) => {
  let jobs;
  
  switch (status) {
    case 'completed':
      jobs = await campaignQueue.getCompleted(start, end);
      break;
    case 'failed':
      jobs = await campaignQueue.getFailed(start, end);
      break;
    case 'active':
      jobs = await campaignQueue.getActive(start, end);
      break;
    case 'waiting':
      jobs = await campaignQueue.getWaiting(start, end);
      break;
    default:
      jobs = await campaignQueue.getJobs([status], start, end);
  }

  return Promise.all(
    jobs.map(async (job) => ({
      jobId: job.id,
      state: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    }))
  );
};

// Graceful shutdown
const closeQueue = async () => {
  console.log('🛑 Closing campaign queue...');
  
  if (campaignWorker) {
    await campaignWorker.close();
  }
  
  await campaignQueue.close();
  console.log('✅ Queue closed');
};

module.exports = {
  campaignQueue,
  initWorker,
  queueCampaign,
  getJobStatus,
  getAllJobs,
  closeQueue,
};
