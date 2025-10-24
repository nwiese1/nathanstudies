import React, { useState, useEffect } from "react";
import { lists } from "./data";

export default function App() {
  const [selectedList, setSelectedList] = useState("");
  const [itemsState, setItemsState] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [forced, setForced] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stage, setStage] = useState("select");
  const [showStats, setShowStats] = useState(false);
  const [remainingThisRound, setRemainingThisRound] = useState([]);

  useEffect(() => {
    document.title = selectedList || "NathanStudies";
  }, [selectedList]);

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  const pickWeightedIndex = (state, avoidIndex = null) => {
    if (!state || state.length === 0) return null;
    const total = state.reduce((s, it) => s + (it.weight ?? 1), 0);
    let r = Math.random() * total;
    for (let i = 0; i < state.length; i++) {
      r -= state[i].weight ?? 1;
      if (r <= 0) {
        if (state.length > 1 && i === avoidIndex) return (i + 1) % state.length;
        return i;
      }
    }
    return state.length - 1;
  };

  const getNextIndex = (state, lastIndex) => {
    if (remainingThisRound.length > 0) {
      const nextIdx = remainingThisRound[0];
      setRemainingThisRound((prev) => prev.slice(1));
      return nextIdx;
    }
    return pickWeightedIndex(state, lastIndex);
  };

  const handleSelect = () => {
    if (!selectedList) return;
    setStage("loading");
    setTimeout(() => {
      const raw = lists[selectedList] || [];
      const initial = raw.map(([t, d]) => ({
        term: t,
        def: d,
        weight: 1,
        correct: 0,
        wrong: 0,
      }));
      const shuffled = shuffleArray([...initial]);
      setItemsState(shuffled);
      setRemainingThisRound(shuffled.map((_, i) => i).slice(1));
      setCurrentIndex(0);
      setStage("study");
      setAttempts(0);
      setForced(false);
      setInput("");
      setFeedback("");
    }, 600);
  };

  const updateItem = (index, change) => {
    setItemsState((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      if (copy[index]) {
        Object.keys(change).forEach((k) => {
          if (k === "weight") {
            copy[index].weight = Math.max(1, (copy[index].weight ?? 1) + change[k]);
          } else {
            copy[index][k] = (copy[index][k] ?? 0) + change[k];
          }
        });
      }
      return copy;
    });
  };

  const handleSubmit = () => {
    // Toggle stats view
    if (input.trim() === "://list") {
      setShowStats(true);
      setInput("");
      setFeedback("");
      return;
    }

    // No current item
    if (currentIndex === null) return;
    const current = itemsState[currentIndex];
    if (!current) return;

    const answer = current.def;
    const user = input.trim();

    // 1) Forced mode: user must type exact answer
    if (forced) {
      if (user === answer) {
        // Correct in forced mode
        setFeedback("✅ Correct!");
        updateItem(currentIndex, { correct: 1 });
        setAttempts(0);
        setForced(false);
        setInput("");
        const next = getNextIndex(itemsState, currentIndex);
        setTimeout(() => {
          setCurrentIndex(next);
          setFeedback("");
        }, 100);
      } else {
        // Still wrong in forced mode
        setFeedback("❌ Incorrect, please type the correct answer.");
        setAttempts(0);
        setInput("");
      }
      return;
    }

    // 2) No input: treat as wrong and skip
    if (user === "") {
      setFeedback(`❌ Incorrect, the answer was "${answer}".`);
      updateItem(currentIndex, { wrong: 1, weight: 2 });
      setForced(false);
      setAttempts(0);
      setInput("");
      const next = getNextIndex(itemsState, currentIndex);
      setTimeout(() => {
        setCurrentIndex(next);
        setFeedback("");
      }, 100);
      return;
    }

    // 3) Check exact match
    if (user === answer) {
      // Correct answer
      setFeedback("✅ Correct!");
      updateItem(currentIndex, { correct: 1, weight: -1 });
      setAttempts(0);
      setForced(false);
      setInput("");
      const next = getNextIndex(itemsState, currentIndex);
      setTimeout(() => {
        setCurrentIndex(next);
        setFeedback("");
      }, 100);
      return;
    }

    // 4) Wrong answer (first or second wrong)
    if (attempts === 0) {
      // First wrong attempt: let them try again
      setFeedback("❌ Incorrect, try again!");
      setAttempts((a) => a + 1);
      setInput("");
      return;
    }

    // Second wrong attempt: reveal answer and force them to type it
    setFeedback(`❌ Incorrect, the answer was "${answer}". You must type the correct answer to continue.`);
    updateItem(currentIndex, { wrong: 1, weight: 2 });
    setForced(true);
    setAttempts(0);
    setInput("");
  };

  if (stage === "select")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 px-4 bg-[#202124]">
        <h1 className="text-4xl font-bold">Choose List To Study</h1>
        <select
          className="bg-[#2c2d2f] rounded-2xl px-4 py-3 w-full max-w-lg text-xl"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <option value="">Select</option>
          {Object.keys(lists).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleSelect}
          className="bg-white text-main px-6 py-3 rounded-2xl font-bold text-xl hover:bg-gray-200 transition"
        >
          Select
        </button>
      </div>
    );

  if (stage === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen text-3xl animate-pulse bg-[#202124]">
        Loading your study session...
      </div>
    );

  const current = itemsState[currentIndex] ?? { term: "", def: "" };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full space-y-6 px-6 text-center bg-[#202124]">
      <div className="flex flex-col justify-center items-center h-full">
        <h2 className="text-3xl font-bold mb-6">{current.term}</h2>
        <input
          className="bg-[#2c2d2f] rounded-2xl px-4 py-3 w-full max-w-xl text-center text-xl focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Type your answer"
        />
        <button
          onClick={handleSubmit}
          className="bg-white text-main px-6 py-3 mt-4 rounded-2xl font-bold text-xl hover:bg-gray-200 transition"
        >
          Submit
        </button>
        {feedback && <p className="text-xl mt-4">{feedback}</p>}
      </div>

      {showStats && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#202124]/95">
          {/* Stats modal code (unchanged) */}
        </div>
      )}
    </div>
  );
}
