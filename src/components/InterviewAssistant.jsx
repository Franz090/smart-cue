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
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("interviewMode", mode);
  }, [mode]);

  useEffect(() => {
    if (isRecording) {
      setInput(transcript);
    }
  }, [transcript, isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isRecording) {
      setIsRecording(false);
      SpeechRecognition.stopListening();
      if (input.trim()) handleAIResponse(input);
      resetTranscript();
      setInput(""); 
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-3 bg-white shadow-md flex justify-start space-x-3 fixed top-0 left-0 right-0 border-b">

        <ModeToggle mode={mode} setMode={setMode} />
        <div className="flex items-center space-x-2">
          <span className={`${language === "english" ? "text-blue-500" : "text-gray-500"} text-sm`}>English</span>
          <label className="switch">
            <input type="checkbox" checked={language === "english"} onChange={() => setLanguage(language === "english" ? "tagalog" : "english")} />
            <span className="slider"></span>
          </label>
          <span className={`${language === "tagalog" ? "text-blue-500" : "text-gray-500"} text-sm`}>Tagalog</span>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-3 mt-12" style={{ paddingBottom: "5rem" }}>
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
  resetTranscript={resetTranscript} // Ipasok ito
/>

    </div>
  );
};

export default InterviewAssistant;
