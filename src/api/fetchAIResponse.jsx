import axios from "axios";

export const fetchAIResponse = async (query, mode, language) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Step 1: AI-based correction using Gemini
  const correctedQuery = await correctTextWithAI(query, apiKey, apiUrl);

  // Step 2: Mode-based prompt
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
    const { data } = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: `${modePrompt} Question: ${correctedQuery}` }] }],
        generationConfig: { maxOutputTokens: 800 },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    throw new Error("Error fetching AI response");
  }
};

// 🛠️ AI-Based Text Correction
const detectLanguage = (text) => {
  const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
  const tagalogWords = text.match(/[a-zA-Z]*[aeiouAEIOU]{2,}[a-zA-Z]*/g)?.length || 0;

  if (englishWords > 0 && tagalogWords > 0) {
    return "taglish"; // Taglish (mixed)
  } else if (englishWords > 0) {
    return "english"; // Pure English
  } else {
    return "tagalog"; // Pure Tagalog
  }
};

const correctTextWithAI = async (text, apiUrl) => {
  const language = detectLanguage(text);

  if (language === "taglish" || language === "tagalog") {
    return text; // Huwag i-correct ang Taglish at Tagalog
  }

  try {
    const correctionPrompt = `Correct any spelling or grammar mistakes in this English text: "${text}". Keep it natural and concise.`;
    
    const { data } = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: correctionPrompt }] }],
        generationConfig: { maxOutputTokens: 200 },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch (error) {
    console.error("Error correcting text:", error);
    return text; // Return original if correction fails
  }
};

