// API Response Types
export interface ApiResponse<T = any> {
  status: boolean;
  code: string;
  message: string;
  data: T;
}

export interface AskQuestionResponse {
  answer: string;
  follow_up_question: string | null;
  conversation_id: number;
  session_id: string;
}

export interface Conversation {
  id: number;
  question: string;
  answer: string;
  follow_up_question: string | null;
  previous_conversation_id: number | null;
  created_at: string;
}

export interface SessionInfo {
  session_id: string;
  last_activity: string;
  time_remaining_seconds: number;
  has_previous_conversation: boolean;
  follow_up_question: string | null;
}

export interface AskQuestionRequest {
  question: string;
  session_id?: string;
}
