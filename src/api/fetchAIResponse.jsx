import axios from "axios";

export const fetchAIResponse = async (query, mode, language) => {
  let modePrompt = "";
  if (mode === "explanation") {
    modePrompt = language === "english" 
      ? "Provide a brief and concise explanation, as if answering an interview question."
      : "Magbigay ng maikli at tumpak na paliwanag, parang sumasagot sa isang tanong sa interview.";
  } else if (mode === "detailed") {
    modePrompt = language === "english"
      ? "Provide a detailed, in-depth response explaining the topic thoroughly."
      : "Magbigay ng detalyadong, malalim na sagot na ipinaliwanag nang lubos ang paksa.";
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const { data } = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: `${modePrompt} Question: ${query}` }] }],
        generationConfig: { maxOutputTokens: 800 },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    throw new Error("Error fetching AI response");
  }
};
