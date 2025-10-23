import React, { useState, useEffect } from "react";
import { lists } from "./data";

export default function App() {
  const [stage, setStage] = useState("select");
  const [selectedList, setSelectedList] = useState("");
  const [studyItems, setStudyItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    document.title = selectedList || "NathanStudies";
  }, [selectedList]);

  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  const handleSelect = () => {
    if (!selectedList) return;
    setStage("loading");
    setTimeout(() => {
      const items = lists[selectedList];
      setStudyItems(items);
      setQueue(shuffle([...items]));
      setStage("study");
    }, 1000);
  };

  const current = queue[index];

  const handleSubmit = () => {
    if (!current) return;
    const correct = input.trim().toLowerCase() === current[1].toLowerCase();
    if (correct) {
      setFeedback("✅ Correct!");
      setAttempts(0);
      setInput("");
      const newQueue = [...queue];
      newQueue.splice(index, 1);
      setQueue(newQueue);
      if (newQueue.length === 0) {
        setStage("done");
      } else {
        setTimeout(() => {
          setFeedback("");
          setIndex(index % newQueue.length);
        }, 700);
      }
    } else {
      const tries = attempts + 1;
      setAttempts(tries);
      if (tries >= 5) {
        setFeedback(`❌ The answer was "${current[1]}"`);
        setAttempts(0);
        setInput("");
        setQueue([...queue, current]);
        setTimeout(() => {
          setFeedback("");
          setIndex((index + 1) % queue.length);
        }, 1200);
      } else {
        setFeedback("Wrong, try again!");
      }
    }
  };

  if (stage === "select")
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6">
        <h1 className="text-3xl font-semibold">Choose list to study</h1>
        <select
          className="bg-[#2c2d2f] rounded-2xl px-4 py-2"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <option value="">-- Select --</option>
          {Object.keys(lists).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleSelect}
          className="bg-white text-main px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200 transition"
        >
          Select
        </button>
      </div>
    );

  if (stage === "loading")
    return (
      <div className="flex items-center justify-center h-screen text-2xl animate-pulse">
        Loading your study session...
      </div>
    );

  if (stage === "done")
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-3xl font-semibold">All done!</h2>
        <p>You've mastered this list. Nice job!</p>
        <button
          className="bg-white text-main px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200 transition"
          onClick={() => {
            setStage("select");
            setSelectedList("");
            setIndex(0);
            setQueue([]);
          }}
        >
          Study Again
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 text-center px-4">
      <h2 className="text-2xl font-semibold">{current[0]}</h2>
      <input
        className="bg-[#2c2d2f] rounded-2xl px-4 py-2 w-64 text-center focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Type the definition"
      />
      <button
        onClick={handleSubmit}
        className="bg-white text-main px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200 transition"
      >
        Submit
      </button>
      {feedback && <p className="text-lg">{feedback}</p>}
      <p className="text-sm opacity-70">
        {studyItems.length - queue.length} mastered / {studyItems.length} total
      </p>
    </div>
  );
}
