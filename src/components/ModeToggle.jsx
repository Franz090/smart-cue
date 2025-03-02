const ModeToggle = ({ mode, setMode }) => (
    <div className="flex items-center space-x-2">
      <span className={`${mode === "explanation" ? "text-yellow-500" : "text-gray-500"} text-sm`}>
        Explanation Mode
      </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={mode === "explanation"}
          onChange={() => setMode(mode === "explanation" ? "detailed" : "explanation")}
        />
        <span className="slider"></span>
      </label>
      <span className={`${mode === "detailed" ? "text-yellow-500" : "text-gray-500"} text-sm`}>
        Detailed Mode
      </span>
    </div>
  );
  
  export default ModeToggle;
  