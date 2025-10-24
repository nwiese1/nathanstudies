import React, { useState, useEffect } from "react";
import { lists } from "./data";

export default function App() {
  const [selectedList, setSelectedList] = useState("");
  const [itemsState, setItemsState] = useState([]); // { term, def, weight }
  const [currentIndex, setCurrentIndex] = useState(null);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [forced, setForced] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stage, setStage] = useState("select");

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
        if (state.length > 1 && i === avoidIndex) {
          const alt = (i + 1) % state.length;
          return alt;
        }
        return i;
      }
    }
    return state.length - 1;
  };

  const handleSelect = () => {
    if (!selectedList) return;
    setStage("loading");
    setTimeout(() => {
      const raw = lists[selectedList] || [];
      const initial = raw.map(([t, d]) => ({ term: t, def: d, weight: 1 }));
      setItemsState(shuffleArray(initial));
      const idx = pickWeightedIndex(initial);
      setCurrentIndex(idx);
      setStage("study");
      setAttempts(0);
      setForced(false);
      setInput("");
      setFeedback("");
    }, 600);
  };

  const moveToNext = (state, lastIndex) => {
    if (!state || state.length === 0) return null;
    const next = pickWeightedIndex(state, lastIndex);
    return next;
  };

  const updateItemWeight = (index, delta) => {
    setItemsState((prev) => {
      const copy = prev.map((it) => ({ ...it }));
      if (copy[index]) {
        copy[index].weight = Math.max(1, (copy[index].weight ?? 1) + delta);
      }
      return copy;
    });
  };

  const handleSubmit = () => {
    if (currentIndex === null) return;
    const current = itemsState[currentIndex];
    if (!current) return;
    const answer = current.def;
    const user = input.trim();
    const isCorrect = user.toLowerCase() === answer.toLowerCase();

    if (isCorrect) {
      setFeedback("✅ Correct!");
      setAttempts(0);
      setForced(false);
      setInput("");
      updateItemWeight(currentIndex, -1);
      const next = moveToNext(itemsState, currentIndex);
      setCurrentIndex(next);
      return;
    }

    if (forced) {
      if (user.toLowerCase() === answer.toLowerCase()) {
        setFeedback("✅ Correct!");
        setAttempts(0);
        setForced(false);
        setInput("");
        updateItemWeight(currentIndex, -1);
        const next = moveToNext(itemsState, currentIndex);
        setCurrentIndex(next);
      } else {
        setFeedback("You must type the correct answer!");
        setInput("");
      }
      return;
    }

    // not forced and incorrect
    if (attempts + 1 >= 2) {
      setFeedback(`❌ Incorrect, the answer was "${answer}".`);
      setForced(true);
      setAttempts(0);
      setInput("");
      updateItemWeight(currentIndex, 2);
    } else {
      setFeedback("Wrong, try again!");
      setAttempts((a) => a + 1);
      setInput("");
    }
  };

  if (stage === "select")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 px-4">
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
      <div className="flex items-center justify-center min-h-screen text-3xl animate-pulse">
        Loading your study session...
      </div>
    );

  const current = itemsState[currentIndex] ?? { term: "", def: "" };

  return (
    <div className="flex flex-col justify-center min-h-screen w-full space-y-6 px-6 text-center">
      <div className="flex flex-col justify-center items-center h-full">
        <h2 className="text-3xl font-bold mb-6">{current.term}</h2>
        <input
          className="bg-[#2c2d2f] rounded-2xl px-4 py-3 w-full max-w-xl text-center text-xl focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={forced ? "Type The Correct Answer" : "Type The Definition"}
        />
        <button
          onClick={handleSubmit}
          className="bg-white text-main px-6 py-3 mt-4 rounded-2xl font-bold text-xl hover:bg-gray-200 transition"
        >
          Submit
        </button>
        {feedback && <p className="text-xl mt-4">{feedback}</p>}
      </div>
    </div>
  );
}
