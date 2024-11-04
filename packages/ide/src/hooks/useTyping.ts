import { useState, useEffect } from "react";

const PHRASES = [
  "First phrase to type",
  "Second phrase to type",
  "Another cool phrase",
  "Yet another phrase",
  "Final phrase to display",
];

const DEFAULT_SPEEDS = {
  typingSpeed: 100,
  pauseBetweenPhrases: 2000,
  wipingSpeed: 50,
};

export const useTyping = (phrases: string[] = PHRASES) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [configSpeeds, setConfigSpeeds] = useState(DEFAULT_SPEEDS);

  useEffect(() => {
    let timeout: string | number | NodeJS.Timeout | undefined;

    if (isTyping) {
      if (currentText.length < phrases[currentPhraseIndex].length) {
        // Continue typing the current phrase
        timeout = setTimeout(() => {
          setCurrentText(
            (prev) => prev + phrases[currentPhraseIndex].charAt(prev.length)
          );
        }, configSpeeds.typingSpeed);
      } else {
        // Pause after completing the phrase
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, configSpeeds.pauseBetweenPhrases);
      }
    } else {
      if (currentText.length > 0) {
        // Wipe the text
        timeout = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, configSpeeds.wipingSpeed);
      } else {
        // Move to the next phrase
        setIsTyping(true);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isTyping, currentPhraseIndex, phrases]);

  return {
    currentText,
    setConfigSpeeds,
  };
};
