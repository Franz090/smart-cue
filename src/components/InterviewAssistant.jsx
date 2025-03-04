import { useState, useEffect, useRef } from "react";
import { fetchAIResponse } from "../api/fetchAIResponse";
import Message from "./Message";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import InputControls from "./InputControls";
import ModeToggle from "./ModeToggle";
import { Spinner } from "../assets/Spinner";

const InterviewAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState("explanation");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    const savedMode = localStorage.getItem("interviewMode");
    if (savedMode) setMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("interviewMode", mode);
  }, [mode]);

  useEffect(() => {
    if (isRecording) setInput(transcript);
  }, [transcript, isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isRecording) {
      setIsRecording(false);
      SpeechRecognition.stopListening();
      let processedTranscript = transcript
        .replace(/js/gi, "JavaScript")
        .replace(/css/gi, "CSS")
        .replace(/html/gi, "HTML")
        .replace(/reactjs/gi, "React.js")
        .replace(/php/gi, "PHP")
        .replace(/nodejs/gi, "Node.js");

      if (processedTranscript.trim()) handleAIResponse(processedTranscript);
      resetTranscript();
    } else {
      resetTranscript();
      setIsRecording(true);
      SpeechRecognition.startListening({ continuous: true, interimResults: false });
    }
  };

  const handleAIResponse = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    resetTranscript();

    try {
      const response = await fetchAIResponse(query, mode, language);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error fetching response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-screen">
      <div className="p-3 bg-white shadow-md flex justify-start space-x-3 fixed top-0 left-0 right-0 border-b">
        <ModeToggle mode={mode} setMode={setMode} options={["explanation", "detailed", "web-development"]} />
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${language === "english" ? "text-blue-500 font-bold" : "text-gray-500"}`}>
            English
          </span>
          <label className="switch">
            <input type="checkbox" checked={language === "english"} onChange={() => setLanguage(language === "english" ? "tagalog" : "english")} />
            <span className="slider"></span>
          </label>
          <span className={`text-sm ${language === "tagalog" ? "text-blue-500" : "text-gray-500"}`}>
            Tagalog
          </span>
        </div>
      </div>
      <div className="flex-1 p-5 space-y-3 pt-16 pb-20 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message key={index} msg={msg} />
        ))}
        {loading && <Spinner />}
        <div ref={messagesEndRef} />
      </div>
      <InputControls
        input={input}
        setInput={setInput}
        toggleListening={toggleListening}
        handleAIResponse={handleAIResponse}
        isRecording={isRecording}
        resetTranscript={resetTranscript}
      />
    </div>
  );
};

export default InterviewAssistant;
