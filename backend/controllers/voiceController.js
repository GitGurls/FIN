const Category = require("../models/Category");
const { parseVoiceTranscript } = require("../utils/gemini");

// POST /api/transactions/parse-voice  { transcript: string }
const parseVoice = async (req, res, next) => {
  try {
    const { transcript } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ message: "transcript is required" });
    }

    const categories = await Category.find({ user: req.user._id }).select("name -_id");
    const suggested = await parseVoiceTranscript(
      transcript,
      categories.map((c) => c.name)
    );

    res.json({ suggested });
  } catch (err) {
    next(err);
  }
};

module.exports = { parseVoice };
