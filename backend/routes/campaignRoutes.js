const router = require('express').Router();
const { sendCampaign } = require('../services/emailService');
const { queueCampaign, getJobStatus, getAllJobs } = require('../services/jobQueue');

// @route   POST /api/campaigns/send
// @desc    Queue a campaign for asynchronous processing
router.post('/send', async (req, res) => {
  try {
    const campaignData = req.body;

    if (!campaignData.audience || campaignData.audience.length === 0) {
      return res.status(400).json({ message: "No audience selected" });
    }

    // Queue the campaign instead of processing it synchronously
    // This returns immediately with a job ID
    const jobInfo = await queueCampaign(campaignData);

    res.json({
      message: "Campaign queued successfully",
      jobId: jobInfo.jobId,
      status: jobInfo.status,
      audienceSize: campaignData.audience.length,
      note: "Use the jobId to check the status at /api/campaigns/status/:jobId"
    });

  } catch (error) {
    console.error("Campaign Queue Error:", error);
    res.status(500).json({ message: "Server error while queueing campaign" });
  }
});

// @route   GET /api/campaigns/status/:jobId
// @desc    Get the status of a campaign job
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);

    if (!status.exists) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(status);

  } catch (error) {
    console.error("Status Check Error:", error);
    res.status(500).json({ message: "Server error while checking job status" });
  }
});

// @route   GET /api/campaigns/jobs
// @desc    Get list of jobs (for monitoring/admin)
router.get('/jobs', async (req, res) => {
  try {
    const status = req.query.status || 'completed';
    const start = parseInt(req.query.start || '0');
    const end = parseInt(req.query.end || '10');

    const jobs = await getAllJobs(status, start, end);

    res.json({
      status,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error("Jobs List Error:", error);
    res.status(500).json({ message: "Server error while fetching jobs" });
  }
});

module.exports = router;