import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypewriter } from "../useTypewriter";

describe("useTypewriter Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with empty text", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello World", speed: 50 })
    );
    expect(result.current.displayedText).toBe("");
  });

  it("should type characters progressively", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 50 })
    );

    expect(result.current.displayedText).toBe("");

    // Fast forward time to type first character
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayedText).toBe("H");

    // Fast forward to type second character
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.displayedText).toBe("Hi");
  });

  it("should complete typing after all characters", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "ABC", speed: 10 })
    );

    // Type all characters (need to advance for each character + one more to complete)
    act(() => {
      vi.advanceTimersByTime(40); // 3 characters * 10ms + buffer
    });

    expect(result.current.displayedText).toBe("ABC");
    expect(result.current.isTyping).toBe(false);
  });

  it("should indicate typing is in progress", () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: "Hello", speed: 50 })
    );

    expect(result.current.isTyping).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300); // 5 characters * 50ms + buffer to complete
    });

    expect(result.current.isTyping).toBe(false);
  });

  it("should reset when text changes", () => {
    const { result, rerender } = renderHook(
      ({ text, speed }) => useTypewriter({ text, speed }),
      {
        initialProps: { text: "Hello", speed: 50 },
      }
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayedText).toBe("He");

    // Change text
    rerender({ text: "World", speed: 50 });
    expect(result.current.displayedText).toBe("");
    expect(result.current.isTyping).toBe(true);
  });

  it("should handle empty string", () => {
    const { result } = renderHook(() => useTypewriter({ text: "", speed: 50 }));

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.displayedText).toBe("");
    expect(result.current.isTyping).toBe(false);
  });

  it("should respect different speeds", () => {
    const { result: fastResult } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 10 })
    );
    const { result: slowResult } = renderHook(() =>
      useTypewriter({ text: "Hi", speed: 100 })
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(fastResult.current.displayedText.length).toBeGreaterThanOrEqual(1);
    expect(slowResult.current.displayedText.length).toBe(0);

    act(() => {
      vi.advanceTimersByTime(90); // Total 100ms
    });

    expect(slowResult.current.displayedText.length).toBeGreaterThanOrEqual(1);
  });
});
