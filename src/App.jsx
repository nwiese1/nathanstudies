import React, { useState, useEffect } from "react";
import { lists } from "./data";

export default function App() {
  const [selectedList, setSelectedList] = useState("");
  const [studyItems, setStudyItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [forced, setForced] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [stage, setStage] = useState("select");

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
      setForced(false);
      setInput("");
      const newQueue = [...queue];
      newQueue.splice(index, 1);
      if (newQueue.length === 0) {
        const reshuffled = shuffle([...studyItems]);
        setQueue(reshuffled);
        setIndex(0);
      } else {
        setQueue(newQueue);
        setIndex(index % newQueue.length);
      }
    } else {
      if (forced) {
        if (input.trim() === current[1]) {
          setFeedback("✅ Correct!");
          setAttempts(0);
          setForced(false);
          setInput("");
          const newQueue = [...queue];
          newQueue.splice(index, 1);
          if (newQueue.length === 0) {
            const reshuffled = shuffle([...studyItems]);
            setQueue(reshuffled);
            setIndex(0);
          } else {
            setQueue(newQueue);
            setIndex(index % newQueue.length);
          }
        } else {
          setFeedback("You must type the correct answer!");
          setInput("");
        }
      } else {
        if (attempts + 1 >= 2) {
          setFeedback(`❌ Incorrect, the answer was "${current[1]}".`);
          setForced(true);
        } else {
          setFeedback("Wrong, try again!");
          setAttempts(attempts + 1);
        }
        setInput("");
      }
    }
  };

  if (stage === "select")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8 px-4">
        <h1 className="text-5xl font-bold">Choose List To Study</h1>
        <select
          className="bg-[#2c2d2f] rounded-2xl px-6 py-4 w-full max-w-lg text-2xl"
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
          className="bg-white text-main px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-gray-200 transition"
        >
          Select
        </button>
      </div>
    );

  if (stage === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen text-4xl animate-pulse">
        Loading your study session...
      </div>
    );

  return (
    <div className="flex flex-col justify-center min-h-screen w-full space-y-8 px-6 text-center">
      <div className="flex flex-col justify-center items-center h-full">
        <h2 className="text-6xl font-bold mb-12">{current[0]}</h2>
        <input
          className="bg-[#2c2d2f] rounded-2xl px-8 py-5 w-full max-w-2xl text-center text-3xl focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={forced ? "Type The Correct Answer" : "Type The Definition"}
        />
        <button
          onClick={handleSubmit}
          className="bg-white text-main px-10 py-5 mt-6 rounded-2xl font-bold text-3xl hover:bg-gray-200 transition"
        >
          Submit
        </button>
        {feedback && <p className="text-3xl mt-6">{feedback}</p>}
        <p className="text-2xl opacity-70 mt-4">
          {studyItems.length - queue.length} Mastered / {studyItems.length} Total
        </p>
      </div>
    </div>
  );
}
