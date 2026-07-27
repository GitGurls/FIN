const { answerFinanceQuery } = require("../utils/gemini");
const { buildChatContext } = require("../utils/chatContext");

// POST /api/chat  { message: string }  — REST fallback; the live app uses the socket version for streaming.
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }
    const dataContext = await buildChatContext(req.user);
    const answer = await answerFinanceQuery(message, dataContext);
    res.json({ answer });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
