import React, { useState, useEffect } from "react";

const lists = {
  "The Word Within the Word List #17": [
    ["thanatos", "death"],
    ["opia", "sight"],
    ["vac", "empty"],
    ["luc", "light"],
    ["ize", "make"],
    ["sed", "sit"],
    ["fug", "flee"],
    ["pusill", "small"],
    ["nepo", "nephew"],
    ["viv", "life"],
    ["spir", "breathe"],
    ["syn", "together"],
    ["man", "hand"],
    ["ex", "out"],
    ["ism", "system"],
    ["sub", "under"],
    ["ine", "nature of"],
    ["anim", "mind"],
    ["bon", "good"],
    ["ous", "full of"],
    ["thanatopsis", "view of death"],
    ["vacuous", "stupidly empty of ideas"],
    ["lucubration", "late studying"],
    ["ex cathedra", "from the throne"],
    ["legerdemain", "sleight of hand"],
    ["suspiration", "deep sigh"],
    ["nepotism", "favoritism to relatives"],
    ["synoptic", "general in view"],
    ["lionize", "treat as a celebrity"],
    ["assiduous", "persevering"],
    ["subterfuge", "evasive dodge"],
    ["bon vivant", "indulger in luxury"],
    ["saturnine", "gloomy and remote"],
    ["sedentary", "sitting"],
    ["pusillanimous", "small-minded"]
  ]
};

export default function App() {
  const [stage, setStage] = useState("select");
  const [selectedList, setSelectedList] = useState("");
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [mastery, setMastery] = useState({});

  useEffect(() => {
    document.body.style.fontFamily = "'Quicksand', sans-serif";
  }, []);

  const handleSelect = () => {
    if (!selectedList) return;
    setStage("loading");
    setTimeout(() => {
      setItems(lists[selectedList]);
      setStage("study");
    }, 1000);
  };

  const current = items[index];

  const handleSubmit = () => {
    if (!current) return;
    if (input.trim().toLowerCase() === current[1].toLowerCase()) {
      setFeedback("Correct!");
      const updated = { ...mastery, [current[0]]: (mastery[current[0]] || 0) + 1 };
      setMastery(updated);
      setAttempts(0);
      setInput("");
      setTimeout(() => {
        if (index < items.length - 1) setIndex(index + 1);
        else setStage("done");
        setFeedback("");
      }, 700);
    } else {
      const tries = attempts + 1;
      setAttempts(tries);
      if (tries >= 5) {
        setFeedback(`Out of tries! The answer was "${current[1]}".`);
        const updated = { ...mastery, [current[0]]: Math.max((mastery[current[0]] || 0) - 1, 0) };
        setMastery(updated);
        setAttempts(0);
        setInput("");
        setTimeout(() => {
          if (index < items.length - 1) setIndex(index + 1);
          else setStage("done");
          setFeedback("");
        }, 1200);
      } else {
        setFeedback("Wrong, try again!");
      }
    }
  };

  if (stage === "select") {
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
          className="bg-white text-[#202124] px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200"
        >
          Select
        </button>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-2xl animate-pulse">
        Loading your study session...
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-3xl font-semibold">All done!</h2>
        <p>You’ve completed the list.</p>
        <button
          className="bg-white text-[#202124] px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200"
          onClick={() => {
            setStage("select");
            setIndex(0);
            setMastery({});
            setSelectedList("");
          }}
        >
          Study Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 px-4 text-center">
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
        className="bg-white text-[#202124] px-6 py-2 rounded-2xl font-semibold hover:bg-gray-200"
      >
        Submit
      </button>
      {feedback && <p className="text-lg">{feedback}</p>}
      <p className="text-sm opacity-70">
        {index + 1} / {items.length}
      </p>
    </div>
  );
}
