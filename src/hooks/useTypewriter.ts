import { useState, useEffect } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
}

/**
 * Custom hook for typewriter effect
 */
export function useTypewriter({
  text,
  speed = 30,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [text, speed, onComplete]);

  return { displayedText, isTyping };
}
