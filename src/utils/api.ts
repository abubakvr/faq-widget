import type {
  ApiResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  SessionInfo,
} from "../types/api";

export class ChatAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Ask a question to the AI chatbot
   */
  async askQuestion(
    question: string,
    sessionId?: string
  ): Promise<ApiResponse<AskQuestionResponse>> {
    const payload: AskQuestionRequest = {
      question: question.trim(),
    };

    if (sessionId) {
      payload.session_id = sessionId;
    }

    const response = await fetch(`${this.baseUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get session information
   */
  async getSessionInfo(sessionId: string): Promise<ApiResponse<SessionInfo>> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
