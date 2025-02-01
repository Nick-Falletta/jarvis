import express from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const app = express();

app.use(express.static('aiChatBot/dist'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express route to support questions from frontend
app.post('/chat', async (req, res) => {
  const { userMsg, userMsgList, aiMsgList, cssContent, jarvisBool } = req.body;

  if (jarvisBool) {
    // Create message history
    let messages = [
      { role: "system", content: `Here is css: \n${cssContent} \nModify what the user asks. Respond with ONLY the entire full new code. Do not add ANY back ticks, then follow it with '---summary---', and then provide a brief summary of the changes` },
    ];

    // Add the current user's message
    messages.push({ role: "user", content: userMsg});
    // OpenAI API call
    try {
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4o-mini",
      });

      // Get the AI response
      const aiResponse = completion.choices?.[0]?.message?.content;

      // Log the AI response for debugging
      console.log("Full AI Response (CSS + Summary):", aiResponse);

      if (!aiResponse) {
        return res.status(500).json({ error: "AI response is invalid or undefined" });
      }

      // Split the response into CSS and summary using the '---summary---' delimiter
      let [updatedCSS, summary] = aiResponse.split('---summary---');

      if (summary == undefined) {
        summary = "Done!";
      }
      // Return the updated CSS and summary to the client
      res.json({ updatedCSS, summary });

      const tokenUsage = completion.usage;
      console.log("Token usage:", tokenUsage);

    } catch (error) {
      console.error("Error with OpenAI API:", error);
      res.status(500).json({ error: "An error occurred with the AI response." });
    }
  } else {


    // Create message history
    let messages = [
      { role: "system", content: "You are really quirky. You use the current GenZ terms like rizz, skibidy, ohio, sus, baka, etc!" },
    ];

    // Add the conversation history from the lists
    userMsgList.forEach((msg, index) => {
      messages.push({ role: "user", content: msg });
      if (aiMsgList[index]) {
        messages.push({ role: "assistant", content: aiMsgList[index] });
      }
    });

    // Add the current user's message
    messages.push({ role: "user", content: userMsg });

    // OpenAI API call
    try {
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4o-mini",
      });

      // Get the response from the AI
      const aiResponse = completion.choices[0].message.content;

      const tokenUsage = completion.usage;
      console.log("Token usage:", tokenUsage);

      res.json(aiResponse);
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      res.status(500).json({ error: "An error occurred with the AI response." });
    }
  }
});

// Listen for incoming connections
app.listen(3000, () => {
  console.log(`Express server running on http://localhost:3000`);
});
