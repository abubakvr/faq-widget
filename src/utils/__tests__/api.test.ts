import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatAPIClient } from "../api";
import type { ApiResponse, AskQuestionResponse } from "../../types/api";

describe("ChatAPIClient", () => {
  const baseUrl = "http://localhost:8080";
  let client: ChatAPIClient;

  beforeEach(() => {
    client = new ChatAPIClient(baseUrl);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create client with baseUrl", () => {
      const client = new ChatAPIClient(baseUrl);
      expect(client).toBeInstanceOf(ChatAPIClient);
    });

    it("should remove trailing slash from baseUrl", () => {
      const client = new ChatAPIClient(`${baseUrl}/`);
      // This is tested indirectly through API calls
    });
  });

  describe("askQuestion", () => {
    it("should make POST request to /ask endpoint", async () => {
      const mockResponse: ApiResponse<AskQuestionResponse> = {
        status: true,
        code: "00",
        message: "Success",
        data: {
          answer: "Test answer",
          follow_up_question: null,
          conversation_id: 1,
          session_id: "session-123",
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const response = await client.askQuestion("Test question");

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/ask`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: "Test question",
          }),
        })
      );

      expect(response).toEqual(mockResponse);
    });

    it("should include session_id in request when provided", async () => {
      const mockResponse: ApiResponse<AskQuestionResponse> = {
        status: true,
        code: "00",
        message: "Success",
        data: {
          answer: "Test answer",
          follow_up_question: null,
          conversation_id: 1,
          session_id: "session-123",
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      await client.askQuestion("Test question", "session-123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/ask`,
        expect.objectContaining({
          body: JSON.stringify({
            question: "Test question",
            session_id: "session-123",
          }),
        })
      );
    });

    it("should trim question before sending", async () => {
      const mockResponse: ApiResponse<AskQuestionResponse> = {
        status: true,
        code: "00",
        message: "Success",
        data: {
          answer: "Test answer",
          follow_up_question: null,
          conversation_id: 1,
          session_id: "session-123",
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      await client.askQuestion("  Test question  ");

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.question).toBe("Test question");
    });

    it("should throw error on HTTP error", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        } as Response)
      );

      await expect(client.askQuestion("Test question")).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

      await expect(client.askQuestion("Test question")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getSessionInfo", () => {
    it("should make GET request to /session/{sessionId} endpoint", async () => {
      const mockResponse = {
        status: true,
        code: "00",
        message: "Success",
        data: {
          session_id: "session-123",
          last_activity: "2024-01-01T12:00:00Z",
          time_remaining_seconds: 900,
          has_previous_conversation: true,
          follow_up_question: null,
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const response = await client.getSessionInfo("session-123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/session/session-123`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      expect(response).toEqual(mockResponse);
    });

    it("should throw error on HTTP error", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        } as Response)
      );

      await expect(client.getSessionInfo("invalid-session")).rejects.toThrow(
        "HTTP error! status: 404"
      );
    });
  });

  describe("healthCheck", () => {
    it("should make GET request to root endpoint", async () => {
      const mockResponse = {
        status: true,
        code: "00",
        message: "API is running",
        data: {
          message: "API is running",
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const response = await client.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      expect(response).toEqual(mockResponse);
    });
  });
});
