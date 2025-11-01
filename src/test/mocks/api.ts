import { vi } from "vitest";
import type { ApiResponse, AskQuestionResponse } from "../../types/api";

export const mockAskQuestionResponse: ApiResponse<AskQuestionResponse> = {
  status: true,
  code: "00",
  message: "Response retrieved successfully",
  data: {
    answer: "This is a test answer from the API.",
    follow_up_question: "Would you like to know more?",
    conversation_id: 1,
    session_id: "test-session-123",
  },
};

export const mockAskQuestionResponseNoFollowUp: ApiResponse<AskQuestionResponse> =
  {
    status: true,
    code: "00",
    message: "Response retrieved successfully",
    data: {
      answer: "This is another test answer.",
      follow_up_question: null,
      conversation_id: 2,
      session_id: "test-session-123",
    },
  };

export const mockErrorResponse: ApiResponse<Record<string, never>> = {
  status: false,
  code: "01",
  message: "Question cannot be empty",
  data: {},
};

export const createMockFetch = (
  response:
    | ApiResponse<AskQuestionResponse>
    | ApiResponse<Record<string, never>>
) => {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      status: 200,
    } as Response)
  );
};
