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

  // Picks a word weighted by its weight (higher weight = more likely)
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

  // Decides next word index
  const getNextIndex = (state, lastIndex) => {
    if (remainingThisRound.length > 0) {
      const nextIdx = remainingThisRound[0];
      setRemainingThisRound((prev) => prev.slice(1));
      return nextIdx;
    }
    // After first round, weighted random
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
        weight: 1,   // starts at 1
        correct: 0,
        wrong: 0,
        lastSeen: 0, // for optional spaced repetition tracking
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
    if (input.trim() === "://list") {
      setShowStats(true);
      setInput("");
      setFeedback("");
      return;
    }

    if (currentIndex === null) return;
    const current = itemsState[currentIndex];
    if (!current) return;

    const answer = current.def;
    const user = input.trim();
    const isCorrect = user.toLowerCase() === answer.toLowerCase();

