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
      className={`fag-flex ${
        message.type === "user" ? "fag-justify-end" : "fag-justify-start"
      }`}
    >
      <div
        className={`fag-max-w-[80%] fag-rounded-lg fag-px-4 fag-py-2 ${
          message.type === "user"
            ? `fag-text-white ${
                primaryColor?.startsWith("#") ? "" : primaryBgClass
              }`
            : "fag-bg-white fag-text-gray-800 fag-shadow-sm fag-border fag-border-gray-200"
        }`}
        style={
          message.type === "user" && primaryColor?.startsWith("#")
            ? { backgroundColor: primaryColor }
            : {}
        }
      >
        <div className="fag-whitespace-pre-wrap fag-break-words">
          {answerText}
          {hasFollowUp && followUpText && (
            <>
              {"\n\n"}
              <button
                onClick={() => onFollowUpClick?.(followUpText)}
                className={`fag-mt-2 fag-text-left fag-p-2 fag-rounded-lg fag-transition-colors fag-font-medium ${textSizeClass} ${
                  primaryColor?.startsWith("#")
                    ? ""
                    : `${primaryBgClass} fag-hover:opacity-90`
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
                <span className="fag-inline-block fag-w-2 fag-h-4 fag-ml-1 fag-bg-current fag-animate-pulse">
                  |
                </span>
              )}
            </>
          )}
        </div>
        <p
          className={`fag-text-xs fag-mt-1 ${
            message.type === "user" ? "fag-opacity-80" : "fag-text-gray-500"
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
