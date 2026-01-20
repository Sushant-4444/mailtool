const router = require('express').Router();
const { sendCampaign } = require('../services/emailService');

// @route   POST /api/campaigns/send
// @desc    Trigger a campaign blast
router.post('/send', async (req, res) => {
  try {
    const campaignData = req.body;

    if (!campaignData.audience || campaignData.audience.length === 0) {
      return res.status(400).json({ message: "No audience selected" });
    }

    // Call the service (This might take time!)
    // In a real production app, this should be a Background Job (BullMQ).
    // For now, we await it, but the frontend might timeout if list is huge.
    const report = await sendCampaign(campaignData);

    res.json({
      message: "Campaign finished",
      stats: report
    });

  } catch (error) {
    console.error("Campaign Error:", error);
    res.status(500).json({ message: "Server error during campaign" });
  }
});

module.exports = router;