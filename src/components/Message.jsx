import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Message = ({ msg }) => {
  // Detect if response contains code
  const codeMatch = msg.text.match(/```([\w]+)?\n([\s\S]+?)```/);
  
  return (
    <div className={`max-w-2xl p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-300 text-black self-start"}`}>
      {codeMatch ? (
        <SyntaxHighlighter language={codeMatch[1] || "javascript"} style={oneDark}>
          {codeMatch[2]}
        </SyntaxHighlighter>
      ) : (
        <p className="whitespace-pre-line">{msg.text}</p>
      )}
    </div>
  );
};

export default Message;
