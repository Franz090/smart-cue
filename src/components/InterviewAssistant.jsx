import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Web Development Keywords for Auto-correction
const webDevelopmentKeywords = [
  "html", "css", "javascript", "react", "node", "express", "api", "php", "mongodb", "rest", "graphql", "bootstrap", "angular", "virtual dom", "dom"
];

const InterviewAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState("explanation");
  const [savedTranscript, setSavedTranscript] = useState("");
  const { transcript, resetTranscript } = useSpeechRecognition();
  const messagesEndRef = useRef(null);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support Speech-to-Text.</p>;
  }

  useEffect(() => {
    const savedMode = localStorage.getItem("interviewMode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("interviewMode", mode);
  }, [mode]);

  useEffect(() => {
    if (isRecording && transcript) {
      setInput(transcript);
      setSavedTranscript(transcript);
    }
  }, [transcript, isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopListening = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  const fetchAIResponse = async (query) => {
    stopListening();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");

    let modePrompt = "";
    if (mode === "explanation") {
      modePrompt = "Provide a brief and concise explanation, as if answering an interview question.";
    } else if (mode === "detailed") {
      modePrompt = "Provide a detailed, in-depth response explaining the topic thoroughly.";
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

      let aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setMessages((prev) => [...prev, { role: "ai", text: aiResponse, isCode: false }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error fetching response.", isCode: false }]);
    }
  };

  const toggleListening = () => {
    if (isRecording) {
      stopListening();
      if (transcript.trim()) {
        let correctedTranscript = autoCorrectTranscript(transcript);
        fetchAIResponse(correctedTranscript);
      }
    } else {
      resetTranscript();
      setIsRecording(true);
      SpeechRecognition.startListening({ continuous: true, interimResults: false });
    }
  };

  const autoCorrectTranscript = (input) => {
    let correctedInput = input.toLowerCase();
    webDevelopmentKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      correctedInput = correctedInput.replace(regex, keyword);
    });

    // Detect and correct terms like "virtual dom" -> "virtual DOM"
    correctedInput = correctedInput.replace(/virtual dom/g, 'virtual DOM');
    return correctedInput;
  };

  const resetChat = () => {
    setMessages([]);
    setInput(savedTranscript);
  };

  const toggleMode = () => {
    const newMode = mode === "explanation" ? "detailed" : "explanation";
    setMode(newMode);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Bar with Slide Toggle */}
      <div className="p-3 bg-white shadow-md flex justify-end space-x-3 fixed top-0 left-0 right-0 border-b">
        <div className="flex items-center space-x-2">
          <span className={`${mode === "explanation" ? "text-yellow-500" : "text-gray-500"} text-sm`}>Explanation Mode</span>
          <label className="switch">
            <input type="checkbox" checked={mode === "explanation"} onChange={toggleMode} />
            <span className="slider"></span>
          </label>
          <span className={`${mode === "detailed" ? "text-yellow-500" : "text-gray-500"} text-sm`}>Detailed Mode</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-3 mt-12" style={{ paddingBottom: "5rem" }}>
        {messages.map((msg, index) => (
          <div key={index} className={`max-w-2xl p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-300 text-black self-start"}`}>
            {msg.isCode ? (
              <SyntaxHighlighter language="javascript" style={oneDark}>
                {msg.text}
              </SyntaxHighlighter>
            ) : (
              <p className="whitespace-pre-line">{msg.text}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Controls */}
      <div className="p-3 bg-white shadow-md flex gap-2 w-full fixed bottom-0 left-0 right-0 border-t">
        <button onClick={toggleListening} className={`px-3 py-2 rounded ${isRecording ? "bg-red-500" : "bg-green-500"} text-white`}>
          {isRecording ? "Stop" : "🎙 Start"}
        </button>
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAIResponse(input)}
        />
        <button onClick={() => fetchAIResponse(input)} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
        <button onClick={resetChat} className="bg-gray-500 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>
    </div>
  );
};

export default InterviewAssistant;
