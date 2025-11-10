import { useState, useRef, useEffect } from "react";
import { ChatAPIClient } from "../utils/api";
import type { ChatWidgetConfig, ChatMessage } from "../types/chat";
import type { ApiResponse, AskQuestionResponse } from "../types/api";
import { MessageBubble } from "./MessageBubble";

// Re-export the config type for convenience
export type WidgetProps = ChatWidgetConfig;

/**
 * Helper function to convert color to CSS variable or Tailwind class
 */
const getColorStyle = (
  color: string | undefined,
  defaultColor: string
): React.CSSProperties => {
  if (!color) {
    return {};
  }

  // If it's a hex color, use it directly
  if (color.startsWith("#")) {
    return { backgroundColor: color } as React.CSSProperties;
  }

  // If it's a Tailwind color like "blue-600", we'll use CSS variables
  // For now, return empty and use Tailwind classes with fallback
  return {};
};

/**
 * Helper to get Tailwind color classes with fallback
 */
const getTailwindColorClass = (
  color: string | undefined,
  defaultClass: string,
  type: "bg" | "text" | "border" | "hover" = "bg"
): string => {
  if (!color) return defaultClass;

  // If it's a hex color, we'll use inline styles instead
  if (color.startsWith("#")) return defaultClass;

  // Parse Tailwind color like "blue-600" or "blue-600/50"
  const [colorName, shade, opacity] = color.split(/[-/]/);
  if (shade && !isNaN(Number(shade))) {
    const opacityClass = opacity ? `/${opacity}` : "";
    return `fag-${type}-${colorName}-${shade}${opacityClass}`;
  }

  return defaultClass;
};

/**
 * Helper to get text size class
 */
const getTextSizeClass = (
  size: "sm" | "base" | "lg" | "xl" | undefined
): string => {
  const sizeMap = {
    sm: "fag-text-sm",
    base: "fag-text-base",
    lg: "fag-text-lg",
    xl: "fag-text-xl",
  };
  return sizeMap[size || "base"];
};

/**
 * Chat Widget Component
 *
 * A reusable AI chatbot widget component that opens as a modal from a floating button.
 *
 * @example
 * ```tsx
 * import { Widget } from 'fag-agent-sdk'
 * import 'fag-agent-sdk/style.css'
 *
 * function App() {
 *   return (
 *     <Widget
 *       baseUrl="http://localhost:8080"
 *       primaryColor="blue-600"
 *       secondaryColor="blue-700"
 *       welcomeMessage="Hello! How can I help you?"
 *       title="Support Assistant"
 *       subtitle="How can we help?"
 *     />
 *   )
 * }
 * ```
 */
export const Widget: React.FC<WidgetProps> = ({
  baseUrl,
  apiKey,
  className = "",
  onInit,
  sessionStorageKey = "chat-widget-session",
  welcomeMessage = "Hello! How can I help you today?",
  primaryColor = "blue-600",
  secondaryColor = "blue-700",
  textSize = "base",
  buttonText = "Chat with us",
  typewriterSpeed = 30,
  title = "AI Assistant",
  subtitle = "Ask me anything!",
  inputPlaceholder = "Type your question...",
  sendButtonText = "Send",
  emptyStateMessage = "Start a conversation by asking a question!",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const apiClientRef = useRef<ChatAPIClient | null>(null);
  const messagesOnOpenRef = useRef<Set<string>>(new Set()); // Track message IDs when modal opens

  // Get color classes
  const primaryBgClass = getTailwindColorClass(
    primaryColor,
    "fag-bg-blue-600",
    "bg"
  );
  const primaryBgHoverClass = getTailwindColorClass(
    secondaryColor,
    "fag-hover:bg-blue-700",
    "hover"
  );
  const primaryTextClass = getTailwindColorClass(
    primaryColor,
    "fag-text-blue-600",
    "text"
  );
  const secondaryBgClass = getTailwindColorClass(
    secondaryColor,
    "fag-bg-blue-700",
    "bg"
  );
  const textSizeClass = getTextSizeClass(textSize);

  // Get inline styles for hex colors
  const primaryColorStyle = primaryColor?.startsWith("#")
    ? ({ "--primary-color": primaryColor } as React.CSSProperties)
    : {};
  const secondaryColorStyle = secondaryColor?.startsWith("#")
    ? ({ "--secondary-color": secondaryColor } as React.CSSProperties)
    : {};

  // Initialize API client and restore session
  useEffect(() => {
    if (!baseUrl) {
      setError("Base URL is required");
      return;
    }

    apiClientRef.current = new ChatAPIClient(baseUrl);

    // Restore session from localStorage
    const savedSessionId = localStorage.getItem(sessionStorageKey);
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    onInit?.();
  }, [baseUrl, sessionStorageKey, onInit]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when modal opens and mark existing messages to skip typewriter
  useEffect(() => {
    if (isOpen) {
      // Mark all existing messages to skip typewriter
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          skipTypewriter: true, // Mark existing messages to skip typewriter
        }))
      );
      // Track current message IDs
      messagesOnOpenRef.current = new Set(messages.map((msg) => msg.id));

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Clear tracking when modal closes
      messagesOnOpenRef.current.clear();
    }
  }, [isOpen]);

  // Save session ID to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(sessionStorageKey, sessionId);
    }
  }, [sessionId, sessionStorageKey]);

  // Add welcome message when modal first opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && welcomeMessage) {
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        type: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, welcomeMessage]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim() || isLoading || !apiClientRef.current) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<AskQuestionResponse> =
        await apiClientRef.current.askQuestion(
          question,
          sessionId || undefined
        );

      if (response.status && response.code === "00") {
        const { answer, follow_up_question, conversation_id, session_id } =
          response.data;

        // Update session ID if we got a new one
        if (session_id && session_id !== sessionId) {
          setSessionId(session_id);
        }

        // Add assistant message with follow-up question appended
        const fullContent = follow_up_question
          ? `${answer}\n\n${follow_up_question}`
          : answer;

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: fullContent,
          timestamp: new Date(),
          conversationId: conversation_id,
          followUpQuestion: follow_up_question,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setFollowUpQuestion(null); // Clear since it's now in the message
      } else {
        throw new Error(response.message || "Failed to get response");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleFollowUpClick = (followUpQuestionText: string) => {
    // Send "Yes" to accept the follow-up question
    handleSendMessage("Yes");
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    setFollowUpQuestion(null);
    localStorage.removeItem(sessionStorageKey);

    // Re-add welcome message
    if (welcomeMessage) {
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        type: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  };

  const toggleModal = () => {
    if (isOpen) {
      // Start closing animation
      setIsAnimating(true);
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 300); // Match animation duration
    } else {
      // Open and start in closed state, then animate to open
      setIsOpen(true);
      setIsAnimating(true);
      // Trigger animation after DOM update
      setTimeout(() => {
        setIsAnimating(false);
      }, 10);
    }
  };

  // Get inline styles for buttons with hex colors
  const getButtonStyle = (isPrimary: boolean = true): React.CSSProperties => {
    if (isPrimary && primaryColor?.startsWith("#")) {
      return {
        backgroundColor: primaryColor,
      };
    }
    if (!isPrimary && secondaryColor?.startsWith("#")) {
      return { backgroundColor: secondaryColor };
    }
    return {};
  };

  return (
    <div className="fag-widget-container">
      {/* Floating Chat Button */}
      <button
        onClick={toggleModal}
        className={`fag-fixed fag-bottom-6 fag-right-6 fag-text-white fag-px-6 fag-py-4 fag-rounded-full fag-shadow-lg fag-hover:shadow-xl fag-transition-all fag-duration-200 fag-flex fag-items-center fag-space-x-2 fag-z-50 ${textSizeClass} fag-font-medium ${
          primaryColor?.startsWith("#")
            ? ""
            : `${primaryBgClass} ${primaryBgHoverClass}`
        }`}
        style={
          primaryColor?.startsWith("#")
            ? {
                ...getButtonStyle(),
                ...(secondaryColor?.startsWith("#")
                  ? {
                      "--hover-bg": secondaryColor,
                    }
                  : {}),
              }
            : {}
        }
        onMouseEnter={(e) => {
          if (secondaryColor?.startsWith("#")) {
            e.currentTarget.style.backgroundColor = secondaryColor;
          }
        }}
        onMouseLeave={(e) => {
          if (primaryColor?.startsWith("#")) {
            e.currentTarget.style.backgroundColor = primaryColor;
          }
        }}
        aria-label="Open chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="fag-h-5 fag-w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Modal Overlay */}
      {(isOpen || isAnimating) && (
        <>
          {/* Backdrop */}
          <div
            className={`fag-fixed fag-inset-0 fag-bg-black fag-bg-opacity-50 fag-z-40 fag-transition-opacity fag-duration-200 ${
              isAnimating ? "fag-opacity-0" : "fag-opacity-100"
            }`}
            onClick={toggleModal}
          />
          {/* Modal Content - Positioned above chat button */}
          <div
            className={`fag-fixed fag-bottom-28 fag-right-6 fag-z-50 fag-flex fag-flex-col fag-bg-white fag-rounded-2xl fag-shadow-2xl fag-overflow-hidden fag-w-[calc(100%-3rem)] fag-sm:w-full fag-max-w-lg fag-h-[600px] fag-sm:h-[700px] fag-transition-all fag-duration-300 fag-ease-out ${
              isAnimating
                ? "fag-opacity-0 fag-translate-y-4 fag-scale-95"
                : "fag-opacity-100 fag-translate-y-0 fag-scale-100"
            } ${className}`}
            style={{ ...primaryColorStyle, ...secondaryColorStyle }}
          >
            {/* Header */}
            <div
              className={`fag-text-white fag-p-4 fag-flex fag-items-center fag-justify-between ${
                primaryColor?.startsWith("#") ? "" : primaryBgClass
              }`}
              style={
                primaryColor?.startsWith("#")
                  ? { backgroundColor: primaryColor }
                  : {}
              }
            >
              <div>
                <h2 className={`${textSizeClass} fag-font-bold`}>{title}</h2>
                <p className="fag-text-xs fag-opacity-90">{subtitle}</p>
              </div>
              <div className="fag-flex fag-items-center fag-space-x-2">
                <button
                  onClick={handleClearChat}
                  className="fag-text-white fag-hover:opacity-80 fag-transition-opacity"
                  title="Clear chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fag-h-5 fag-w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleModal}
                  className="fag-text-white fag-hover:opacity-80 fag-transition-opacity"
                  title="Close chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fag-h-6 fag-w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div
              className={`fag-flex-1 fag-overflow-y-auto fag-p-4 fag-space-y-4 fag-bg-gray-50 ${textSizeClass}`}
            >
              {messages.length === 0 && (
                <div className="fag-text-center fag-text-gray-500 fag-mt-8">
                  <svg
                    className="fag-mx-auto fag-h-12 fag-w-12 fag-text-gray-400 fag-mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>{emptyStateMessage}</p>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  primaryColor={primaryColor}
                  primaryBgClass={primaryBgClass}
                  textSizeClass={textSizeClass}
                  enableTypewriter={typewriterSpeed > 0}
                  typewriterSpeed={typewriterSpeed}
                  onFollowUpClick={handleFollowUpClick}
                />
              ))}

              {isLoading && (
                <div className="fag-flex fag-justify-start">
                  <div className="fag-bg-white fag-rounded-lg fag-px-4 fag-py-2 fag-shadow-sm fag-border fag-border-gray-200">
                    <div className="fag-flex fag-space-x-2">
                      <div className="fag-w-2 fag-h-2 fag-bg-gray-400 fag-rounded-full fag-animate-bounce"></div>
                      <div
                        className="fag-w-2 fag-h-2 fag-bg-gray-400 fag-rounded-full fag-animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="fag-w-2 fag-h-2 fag-bg-gray-400 fag-rounded-full fag-animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && !isLoading && (
              <div className="fag-px-4 fag-py-2 fag-bg-red-50 fag-border-t fag-border-red-200">
                <p className={`fag-text-sm fag-text-red-600 ${textSizeClass}`}>
                  {error}
                </p>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="fag-p-4 fag-bg-white fag-border-t fag-border-gray-200"
            >
              <div className="fag-flex fag-space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={inputPlaceholder}
                  disabled={isLoading}
                  className={`fag-flex-1 fag-px-4 fag-py-2 fag-border fag-border-gray-300 fag-rounded-lg fag-focus:outline-none fag-focus:ring-2 fag-focus:ring-blue-500 fag-focus:border-transparent fag-disabled:bg-gray-100 fag-disabled:cursor-not-allowed ${textSizeClass}`}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`fag-p-2 fag-text-white fag-rounded-lg fag-transition-colors fag-disabled:bg-gray-300 fag-disabled:cursor-not-allowed fag-flex fag-items-center fag-justify-center ${
                    primaryColor?.startsWith("#")
                      ? ""
                      : `${primaryBgClass} ${primaryBgHoverClass}`
                  }`}
                  style={
                    primaryColor?.startsWith("#") &&
                    inputValue.trim() &&
                    !isLoading
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                  onMouseEnter={(e) => {
                    if (
                      inputValue.trim() &&
                      !isLoading &&
                      secondaryColor?.startsWith("#")
                    ) {
                      e.currentTarget.style.backgroundColor = secondaryColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      inputValue.trim() &&
                      !isLoading &&
                      primaryColor?.startsWith("#")
                    ) {
                      e.currentTarget.style.backgroundColor = primaryColor;
                    }
                  }}
                  aria-label={sendButtonText || "Send message"}
                  title={sendButtonText || "Send message"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fag-h-5 fag-w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Widget;
