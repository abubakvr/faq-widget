// Import CSS so it gets bundled
import "./index.css";

// Export the main widget component
export { Widget, type WidgetProps } from "./components/Widget";

// Export types for advanced usage
export type { ChatWidgetConfig, ChatMessage } from "./types/chat";
export type {
  ApiResponse,
  AskQuestionResponse,
  Conversation,
  SessionInfo,
} from "./types/api";

// Export API client for advanced usage
export { ChatAPIClient } from "./utils/api";
