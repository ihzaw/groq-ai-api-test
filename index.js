const express = require("express");
const Groq = require("groq-sdk");

const port = process.env.PORT || 3000;
const app = express();

require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getPromptTarget = (target) => {
  if (target === 'sis') {
    return process.env.SIS_PROMPT
  }
  if (target === 'cer') {
    return process.env.CER_PROMPT
  }

  return `${process.env.GENERIC_PROMPT} ini tujuannya untuk ${target}. refer ${target} jika bisa` 
}

async function getGroqChatCompletion(target) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: getPromptTarget(target),
      },
    ],
    model: "llama3-8b-8192",
  });
}

app.get("/shortcut-wa/:target", async (req, res) => {
  const { target } = req.params
  const response = await getGroqChatCompletion(target);

  if (response?.choices[0]?.message?.content) {
    const rawMessage = response.choices[0].message.content;
    res.json(rawMessage);
    return
  }

  res.json({ text: "Failed to create message, don't taru kira" });
});

app.get("/", async (req, res) => {
  res.json({ message: "API working" });
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
