import React, { useState, useEffect } from "react";

interface TypingProps {
  phrases: string[];
}

export function Typing({ phrases }: TypingProps) {
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const type = () => {
      const word = phrases[wordIndex];
      if (isDeleting) {
        setCurrentWord(word.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
        if (charIndex === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        setCurrentWord(word.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
        if (charIndex === word.length) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 50000);
        }
      }
    };

    const typingSpeed = isDeleting ? 10 : 100;
    const timer = setTimeout(type, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <div className=" h-full flex justify-center items-center">
      <h1 id="typewriter" className="text-4xl font-bold flex items-center">
        {currentWord}
        {true && <span className="animate-caret mb-2">|</span>}
      </h1>
    </div>
  );
}
