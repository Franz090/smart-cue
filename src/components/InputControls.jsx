const InputControls = ({ input, setInput, toggleListening, handleAIResponse, isRecording, resetTranscript }) => {
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      setInput(value);
      
     
      if (!value.trim()) {
        resetTranscript();
      }
    };
  
    return (
      <div className="p-3 bg-white shadow-md flex gap-2 w-full fixed bottom-0 left-0 right-0 border-t">
        <button
          onClick={toggleListening}
          className={`px-3 py-2 rounded ${isRecording ? "bg-red-500" : "bg-green-500"} text-white`}
        >
          {isRecording ? "Stop" : "🎙 Start"}
        </button>
        
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange} 
          onKeyDown={(e) => e.key === "Enter" && handleAIResponse(input)}
        />
        
        <button onClick={() => handleAIResponse(input)} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    );
  };
  
  export default InputControls;
  