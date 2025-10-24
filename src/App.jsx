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
  const [theme, setTheme] = useState("dark");

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
      const shuffled = shuffleArray(initial);
      setItemsState(shuffled);
      setRemainingThisRound(shuffled.map((_, i) => i));
      setCurrentIndex(shuffled.length > 0 ? 0 : null);
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
    const cmd = input.trim().toLowerCase();
    if (cmd === "://list") {
      setShowStats(true);
      setInput("");
      setFeedback("");
      return;
    }
    if (cmd === "://light") {
      setTheme("light");
      setInput("");
      setFeedback("Switched to light mode");
      return;
    }
    if (cmd === "://dark") {
      setTheme("dark");
      setInput("");
      setFeedback("Switched to dark mode");
      return;
    }

    if (currentIndex === null) return;
    const current = itemsState[currentIndex];
    if (!current) return;

    const answer = current.def;
    const user = input.trim();

    if (user === "") {
      setForced(true);
      setAttempts(0);
      setInput("");
      setFeedback("You must type the correct answer!");
      return;
    }

    const isCorrect = user.toLowerCase() === answer.toLowerCase();

    if (isCorrect) {
      setFeedback("✅ Correct!");
      if (!forced) updateItem(currentIndex, { correct: 1, weight: -1 });
      setAttempts(0);
      setForced(false);
      setInput("");
      setCurrentIndex(getNextIndex(itemsState, currentIndex));
      return;
    }

    if (forced) {
      const prevFeedback = `❌ Incorrect, the answer was "${answer}".`;
      setFeedback("You must type the correct answer!");
      setInput("");
      setTimeout(() => setFeedback(prevFeedback), 2000);
      return;
    }

    if (attempts + 1 >= 2) {
      setFeedback(`❌ Incorrect, the answer was "${answer}".`);
      setForced(true);
      setAttempts(0);
      setInput("");
      updateItem(currentIndex, { wrong: 1, weight: 2 });
    } else {
      setFeedback("Wrong, try again!");
      setAttempts((a) => a + 1);
      setInput("");
    }
  };

  const bgColor = theme === "dark" ? "#202124" : "#fdfdfd";
  const textColor = theme === "dark" ? "#fff" : "#202124";
  const inputBg = theme === "dark" ? "#2c2d2f" : "#eee";

  if (stage === "select")
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen space-y-6 px-4`} style={{ backgroundColor: bgColor, color: textColor }}>
        <h1 className="text-4xl font-bold">Choose List To Study</h1>
        <select
          className="rounded-2xl px-4 py-3 w-full max-w-lg text-xl"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
          style={{ backgroundColor: inputBg, color: textColor }}
        >
          <option value="">Select</option>
          {Object.keys(lists).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleSelect}
          className="px-6 py-3 rounded-2xl font-bold text-xl hover:opacity-80 transition"
          style={{ backgroundColor: theme === "dark" ? "#fff" : "#202124", color: theme === "dark" ? "#202124" : "#fff" }}
        >
          Select
        </button>
      </div>
    );

  if (stage === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen text-3xl animate-pulse" style={{ backgroundColor: bgColor, color: textColor }}>
        Loading your study session...
      </div>
    );

  const current = itemsState[currentIndex] ?? { term: "", def: "" };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full space-y-6 px-6 text-center" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="flex flex-col justify-center items-center h-full">
        <h2 className="text-3xl font-bold mb-6">{current.term}</h2>
        <input
          className="rounded-2xl px-4 py-3 w-full max-w-xl text-center text-xl focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={forced ? "Type The Correct Answer" : "Type The Definition"}
          style={{ backgroundColor: inputBg, color: textColor }}
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-3 mt-4 rounded-2xl font-bold text-xl hover:opacity-80 transition"
          style={{ backgroundColor: theme === "dark" ? "#fff" : "#202124", color: theme === "dark" ? "#202124" : "#fff" }}
        >
          Submit
        </button>
        {feedback && <p className="text-xl mt-4">{feedback}</p>}
      </div>

      {showStats && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: theme === "dark" ? "rgba(32,33,36,0.95)" : "rgba(255,255,255,0.95)" }}>
          <div style={{ backgroundColor: theme === "dark" ? "#1a1a1c" : "#f4f4f4", color: textColor }} className="rounded-2xl p-6 w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Stats</h3>
              <button
                onClick={() => setShowStats(false)}
                className="px-3 py-1 rounded-md font-semibold"
                style={{ backgroundColor: theme === "dark" ? "#fff" : "#202124", color: theme === "dark" ? "#202124" : "#fff" }}
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto space-y-2">
              {itemsState.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-md flex justify-between"
                  style={{ backgroundColor: theme === "dark" ? "#1c1c1e" : "#e0e0e0" }}
                >
                  <div>{it.term}</div>
                  <div className="flex space-x-4 text-sm">
                    <span>✅: {it.correct}</span>
                    <span>❌: {it.wrong}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
