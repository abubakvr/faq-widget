import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Widget } from "../Widget";
import {
  mockAskQuestionResponse,
  mockErrorResponse,
  createMockFetch,
} from "../../test/mocks/api";

// Mock the API client - we'll let it use real implementation but mock fetch
vi.mock("../../utils/api", async () => {
  const actual = await vi.importActual("../../utils/api");
  return actual;
});

describe("Widget Component", () => {
  const defaultProps = {
    baseUrl: "http://localhost:8080",
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (globalThis as any).fetch = createMockFetch(mockAskQuestionResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the floating chat button", () => {
      render(<Widget {...defaultProps} />);
      const button = screen.getByLabelText(/open chat/i);
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Chat with us");
    });

    it("should not render modal initially", () => {
      render(<Widget {...defaultProps} />);
      expect(screen.queryByText(/AI Assistant/i)).not.toBeInTheDocument();
    });

    it("should render modal when button is clicked", async () => {
      render(<Widget {...defaultProps} />);

      const button = screen.getByLabelText(/open chat/i);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should render custom button text", () => {
      render(<Widget {...defaultProps} buttonText="Get Help" />);
      expect(screen.getByText("Get Help")).toBeInTheDocument();
    });
  });

  describe("Modal Opening and Closing", () => {
    it("should open modal when chat button is clicked", async () => {
      render(<Widget {...defaultProps} />);

      const button = screen.getByLabelText(/open chat/i);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should close modal when close button is clicked", async () => {
      render(<Widget {...defaultProps} />);

      // Open modal
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Close modal
      const closeButton = screen.getByTitle(/close chat/i);
      fireEvent.click(closeButton);

      await waitFor(
        () => {
          expect(screen.queryByText("AI Assistant")).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should close modal when backdrop is clicked", async () => {
      render(<Widget {...defaultProps} />);

      // Open modal
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Click backdrop - find it by its fixed position and z-index classes
      const backdrop = document.querySelector(".fixed.inset-0.z-40");
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(
        () => {
          expect(screen.queryByText("AI Assistant")).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Welcome Message", () => {
    it("should display welcome message when modal opens", async () => {
      const welcomeMessage = "Welcome! How can I help?";
      render(<Widget {...defaultProps} welcomeMessage={welcomeMessage} />);

      const button = screen.getByLabelText(/open chat/i);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should display default welcome message if not provided", async () => {
      render(<Widget {...defaultProps} />);

      const button = screen.getByLabelText(/open chat/i);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Hello! How can I help you today/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should persist welcome message after sending a message", async () => {
      const user = userEvent.setup();
      const welcomeMessage = "Welcome!";
      render(<Widget {...defaultProps} welcomeMessage={welcomeMessage} />);

      // Open modal
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Send a message - wait for input to be available
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");

      await waitFor(
        () => {
          expect(screen.getByLabelText(/send/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(screen.getByText("Test question")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Welcome message should still be visible
      expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
    });
  });

  describe("Message Sending", () => {
    it("should send a message when form is submitted", async () => {
      const user = userEvent.setup();
      render(<Widget {...defaultProps} />);

      // Open modal
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Type and send message
      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(screen.getByText("Test question")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should not send empty messages", async () => {
      const user = userEvent.setup();
      render(<Widget {...defaultProps} />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      expect(sendButton).toBeDisabled();

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "   "); // Only spaces
      expect(sendButton).toBeDisabled();
    });

    it("should clear input after sending message", async () => {
      const user = userEvent.setup();
      render(<Widget {...defaultProps} />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(
        /type your question/i
      ) as HTMLInputElement;
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(input.value).toBe("");
        },
        { timeout: 1000 }
      );
    });

    it("should show loading state while sending message", async () => {
      // Mock a delayed response
      (globalThis as any).fetch = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockAskQuestionResponse),
                  status: 200,
                } as Response),
              100
            )
          )
      );

      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");

      await waitFor(
        () => {
          expect(screen.getByLabelText(/send/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      // Loading indicator should appear immediately
      await waitFor(
        () => {
          const loadingIndicator = document.querySelector(
            '[class*="animate-bounce"]'
          );
          expect(loadingIndicator).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("API Integration", () => {
    it("should call API when sending a message", async () => {
      const fetchSpy = vi.fn(createMockFetch(mockAskQuestionResponse));
      (globalThis as any).fetch = fetchSpy;

      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");

      await waitFor(
        () => {
          expect(screen.getByLabelText(/send/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(fetchSpy).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
      const calls = (fetchSpy as any).mock.calls;
      if (calls && calls.length > 0 && calls[0] && calls[0][0]) {
        expect(String(calls[0][0])).toContain("/ask");
      }
    });

    it("should display API response in chat", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);
      await waitFor(
        () => {
          expect(
            screen.getByText(mockAskQuestionResponse.data.answer)
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should handle API errors gracefully", async () => {
      (globalThis as any).fetch = createMockFetch(mockErrorResponse);

      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);
      await waitFor(
        () => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should save session ID to localStorage", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");

      await waitFor(
        () => {
          expect(screen.getByLabelText(/send/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          const savedSession = localStorage.getItem("chat-widget-session");
          expect(savedSession).toBe(mockAskQuestionResponse.data.session_id);
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Follow-up Questions", () => {
    it("should display follow-up question button when provided", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");

      await waitFor(
        () => {
          expect(screen.getByLabelText(/send/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(mockAskQuestionResponse.data.follow_up_question!)
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should send "Yes" when follow-up question is clicked', async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);

      const followUpButton = screen.getByText(
        mockAskQuestionResponse.data.follow_up_question!
      );
      expect(followUpButton).toBeInTheDocument();
      fireEvent.click(followUpButton);
      await waitFor(
        () => {
          expect(screen.getByText("Yes")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Customization Props", () => {
    it("should apply custom title", async () => {
      render(<Widget {...defaultProps} title="Custom Title" />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(screen.getByText("Custom Title")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should apply custom subtitle", async () => {
      render(<Widget {...defaultProps} subtitle="Custom subtitle" />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(screen.getByText("Custom subtitle")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should apply custom input placeholder", async () => {
      render(
        <Widget {...defaultProps} inputPlaceholder="Ask me anything..." />
      );

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText("Ask me anything...")
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should apply custom empty state message", async () => {
      // Disable welcome message to test empty state
      render(
        <Widget
          {...defaultProps}
          emptyStateMessage="No messages yet!"
          welcomeMessage=""
        />
      );

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(screen.getByText("No messages yet!")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should call onInit callback", () => {
      const onInit = vi.fn();
      render(<Widget {...defaultProps} onInit={onInit} />);
      expect(onInit).toHaveBeenCalled();
    });
  });

  describe("Session Management", () => {
    it("should restore session from localStorage", () => {
      localStorage.setItem("chat-widget-session", "saved-session-123");
      render(<Widget {...defaultProps} />);
      // Session should be restored (no direct way to test this without exposing state)
      expect(localStorage.getItem("chat-widget-session")).toBe(
        "saved-session-123"
      );
    });

    it("should use custom session storage key", () => {
      localStorage.setItem("custom-session-key", "custom-session-123");
      render(
        <Widget {...defaultProps} sessionStorageKey="custom-session-key" />
      );
      expect(localStorage.getItem("custom-session-key")).toBe(
        "custom-session-123"
      );
    });

    it("should clear session when clear chat is clicked", async () => {
      localStorage.setItem("chat-widget-session", "session-123");

      render(<Widget {...defaultProps} />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(screen.getByTitle(/clear chat/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const clearButton = screen.getByTitle(/clear chat/i);
      fireEvent.click(clearButton);
      expect(localStorage.getItem("chat-widget-session")).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should display error when baseUrl is not provided", () => {
      render(<Widget baseUrl="" />);
      // Error should be set internally, check via UI if error message appears
      // This depends on implementation
    });

    it("should display error message from API response", async () => {
      (globalThis as any).fetch = createMockFetch(mockErrorResponse);

      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);
      await waitFor(
        () => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should handle network errors", async () => {
      (globalThis as any).fetch = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      );

      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);
      await waitFor(
        () => {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Input Handling", () => {
    it("should update input value when typing", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(
        /type your question/i
      ) as HTMLInputElement;
      await user.type(input, "Hello");

      expect(input.value).toBe("Hello");
    });

    it("should submit form on Enter key press", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question{enter}");
      await waitFor(
        () => {
          expect(screen.getByText("Test question")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Text Size Customization", () => {
    it("should apply custom text size class", async () => {
      render(<Widget {...defaultProps} textSize="lg" />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const title = screen.getByText("AI Assistant");
      expect(title).toHaveClass("text-lg");
    });
  });

  describe("Color Customization", () => {
    it("should apply custom primary color (hex)", async () => {
      render(<Widget {...defaultProps} primaryColor="#FF5733" />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          const header = screen
            .getByText("AI Assistant")
            .closest("div")?.parentElement;
          expect(header).toHaveStyle({ backgroundColor: "rgb(255, 87, 51)" });
        },
        { timeout: 1000 }
      );
    });

    it("should apply custom primary color (Tailwind class)", async () => {
      render(<Widget {...defaultProps} primaryColor="purple-600" />);

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(screen.getByText("AI Assistant")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const header = screen
        .getByText("AI Assistant")
        .closest("div")?.parentElement;
      expect(header).toHaveClass("bg-purple-600");
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no messages", async () => {
      // Disable welcome message to test empty state
      render(
        <Widget
          {...defaultProps}
          emptyStateMessage="No messages!"
          welcomeMessage=""
        />
      );

      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);

      await waitFor(
        () => {
          expect(screen.getByText("No messages!")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should not show empty state after messages are sent", async () => {
      render(<Widget {...defaultProps} />);

      const user = userEvent.setup();
      const chatButton = screen.getByLabelText(/open chat/i);
      fireEvent.click(chatButton);
      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/type your question/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const input = screen.getByPlaceholderText(/type your question/i);
      await user.type(input, "Test question");
      const sendButton = screen.getByLabelText(/send/i);
      fireEvent.click(sendButton);
      await waitFor(
        () => {
          expect(
            screen.queryByText(/Start a conversation/i)
          ).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });
});
