export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  conversationId?: number;
  followUpQuestion?: string | null;
  skipTypewriter?: boolean; // Flag to skip typewriter for existing messages
}

export interface ChatWidgetConfig {
  /**
   * Base URL of the QA API
   */
  baseUrl: string;
  /**
   * API key for authentication (optional for now)
   */
  apiKey?: string;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Callback function called when widget is initialized
   */
  onInit?: () => void;
  /**
   * Storage key for session persistence (default: 'chat-widget-session')
   */
  sessionStorageKey?: string;
  /**
   * Default welcome message displayed when chat is first opened
   */
  welcomeMessage?: string;
  /**
   * Primary color for the widget (used for buttons, header, etc.)
   * Can be a Tailwind color class or hex color (e.g., 'blue-600' or '#3B82F6')
   */
  primaryColor?: string;
  /**
   * Secondary color for the widget (used for accents, hover states, etc.)
   * Can be a Tailwind color class or hex color (e.g., 'blue-700' or '#2563EB')
   */
  secondaryColor?: string;
  /**
   * Base text size for the widget ('sm', 'base', 'lg', 'xl')
   */
  textSize?: "sm" | "base" | "lg" | "xl";
  /**
   * Custom text for the chat button (default: 'Chat with us')
   */
  buttonText?: string;
  /**
   * Speed of typewriter effect in milliseconds per character (default: 30)
   * Set to 0 to disable typewriter effect
   */
  typewriterSpeed?: number;
  /**
   * Title text displayed in the chat header (default: 'AI Assistant')
   */
  title?: string;
  /**
   * Subtitle text displayed in the chat header (default: 'Ask me anything!')
   */
  subtitle?: string;
  /**
   * Placeholder text for the input field (default: 'Type your question...')
   */
  inputPlaceholder?: string;
  /**
   * Text for the send button (default: 'Send')
   */
  sendButtonText?: string;
  /**
   * Message shown when chat is empty (default: 'Start a conversation by asking a question!')
   */
  emptyStateMessage?: string;
}
