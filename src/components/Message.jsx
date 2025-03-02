import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Message = ({ msg }) => (
  <div className={`max-w-2xl p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-300 text-black self-start"}`}>
    {msg.isCode ? (
      <SyntaxHighlighter language="javascript" style={oneDark}>
        {msg.text}
      </SyntaxHighlighter>
    ) : (
      <p className="whitespace-pre-line">{msg.text}</p>
    )}
  </div>
);

export default Message;
