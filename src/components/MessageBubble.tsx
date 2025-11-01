import { useTypewriter } from "../hooks/useTypewriter";
import type { ChatMessage } from "../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  primaryColor?: string;
  primaryBgClass: string;
  textSizeClass: string;
  enableTypewriter?: boolean;
  typewriterSpeed?: number;
  onFollowUpClick?: (followUpQuestion: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  primaryColor,
  primaryBgClass,
  textSizeClass,
  enableTypewriter = true,
  typewriterSpeed = 30,
  onFollowUpClick,
}) => {
  // Only use typewriter for assistant messages (skip error messages, welcome, and messages marked to skip)
  const shouldUseTypewriter =
    enableTypewriter &&
    message.type === "assistant" &&
    !message.id.startsWith("error") &&
    !message.skipTypewriter;

  const { displayedText, isTyping } = useTypewriter({
    text: shouldUseTypewriter ? message.content : "",
    speed: typewriterSpeed,
  });

  const displayText = shouldUseTypewriter ? displayedText : message.content;

  // Check if we have a follow-up question stored separately
  const hasFollowUp = message.followUpQuestion && !isTyping;
  // Extract answer and follow-up from displayText if they're combined
  let answerText = displayText;
  let followUpText = message.followUpQuestion || null;

  // If follow-up is in the content and we've finished typing, split it
  if (hasFollowUp && followUpText && displayText.includes(followUpText)) {
    const index = displayText.indexOf(followUpText);
    answerText = displayText.substring(0, index).trim();
  } else if (
    hasFollowUp &&
    followUpText &&
    !displayText.includes(followUpText)
  ) {
    // Follow-up hasn't appeared in typewriter yet, show just answer
    answerText = displayText;
    followUpText = null; // Wait until it appears
  }

  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.type === "user"
            ? `text-white ${
                primaryColor?.startsWith("#") ? "" : primaryBgClass
              }`
            : "bg-white text-gray-800 shadow-sm border border-gray-200"
        }`}
        style={
          message.type === "user" && primaryColor?.startsWith("#")
            ? { backgroundColor: primaryColor }
            : {}
        }
      >
        <div className="whitespace-pre-wrap break-words">
          {answerText}
          {hasFollowUp && followUpText && (
            <>
              {"\n\n"}
              <button
                onClick={() => onFollowUpClick?.(followUpText)}
                className={`mt-2 text-left p-2 rounded-lg transition-colors font-medium ${textSizeClass} ${
                  primaryColor?.startsWith("#")
                    ? ""
                    : `${primaryBgClass} hover:opacity-90`
                }`}
                style={
                  primaryColor?.startsWith("#")
                    ? {
                        backgroundColor: primaryColor,
                        color: "white",
                      }
                    : { color: "white" }
                }
              >
                💬 {followUpText}
              </button>
            </>
          )}
          {!hasFollowUp && (
            <>
              {isTyping && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse">
                  |
                </span>
              )}
            </>
          )}
        </div>
        <p
          className={`text-xs mt-1 ${
            message.type === "user" ? "opacity-80" : "text-gray-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
