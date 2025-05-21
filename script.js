import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBwGgvtyEzA_SvpFnTf867yP1WTZReDcdI",
  authDomain: "thinkeval.firebaseapp.com",
  projectId: "thinkeval",
  storageBucket: "thinkeval.appspot.com",
  messagingSenderId: "348522791964",
  appId: "1:348522791964:web:e53e677e9eb550a3b74bd9",
  measurementId: "G-ELDBL548WP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const allModels = ["bart-mnli", "ada-002", "all-mpnet-base-v2", "flan-ul2", "llama-2", "gpt-4"];

const evaluateBtn = document.getElementById("evaluate");
const vote1Btn = document.getElementById("vote-model-1");
const vote2Btn = document.getElementById("vote-model-2");
const debugToggleBtn = document.getElementById("debug-toggle");

const modelName1 = document.getElementById("model-name-1");
const modelName2 = document.getElementById("model-name-2");

debugToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("debug-visible");
});

evaluateBtn.addEventListener("click", () => {
  const debugVisible = document.body.classList.contains("debug-visible");

  // Reset model names and disable votes
  modelName1.textContent = "Model: (waiting...)";
  modelName2.textContent = "Model: (waiting...)";
  vote1Btn.disabled = true;
  vote2Btn.disabled = true;

  let model1, model2;
  if (debugVisible) {
    model1 = document.getElementById("model-select-1").value;
    model2 = document.getElementById("model-select-2").value;
  } else {
    const randomized = shuffle([...allModels]);
    model1 = randomized[0];
    model2 = randomized.find(m => m !== model1);

    // Update selects for debugging visibility (even if hidden)
    document.getElementById("model-select-1").value = model1;
    document.getElementById("model-select-2").value = model2;
  }

  console.log(`Evaluating ${model1} (left) vs ${model2} (right)`);

  evaluate(model1, model2, "left", () => {
    modelName1.textContent = `Model: ${model1}`;
  });
});

vote1Btn.addEventListener("click", async () => {
  const model1 = document.getElementById("model-select-1").value;
  if (modelName1.textContent.includes("(waiting...)")) return;
  await addDoc(collection(db, "Votes"), {
    votedFor: model1,
    modelPosition: "left",
    timestamp: Date.now()
  });
  console.log("Voted for:", model1);
});

vote2Btn.addEventListener("click", async () => {
  const model2 = document.getElementById("model-select-2").value;
  if (modelName2.textContent.includes("(waiting...)")) return;
  await addDoc(collection(db, "Votes"), {
    votedFor: model2,
    modelPosition: "right",
    timestamp: Date.now()
  });
  console.log("Voted for:", model2);
});

async function evaluate(model1, model2, side, onComplete) {
  const response = await fetch("games.json");
  const data = await response.json();

  const game = data[Math.floor(Math.random() * data.length)];
  let randomized = [];
  for (const category in game) randomized.push(...game[category]);
  randomized = shuffle(randomized);

  const puzzle = document.getElementsByClassName("puzzle")
  puzzle.innerHTML = JSON.stringify(randomized)

  let input = `You are playing a game in which you're given a set of words and it is possible to categorize each into groups of four.` 
  + `Given the set of words; ${JSON.stringify(randomized)}, find the groups of 4 words from here that will correspond to a category.` + 
  `Only output one of the groups since we're only allowed to check one group at a time. Write your final output in the following output:` + 
  `\"Word1 Word2 Word3 Word4\" where you wouldn't include the quotation marks in the response.`;

  let score = 0;
  for (let i = 0; i < 4; i++) {
    console.log(randomized)
    const res = await fetch("https://hf-backend-dusky.vercel.app/api/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const apiData = await res.json();
    if (!apiData.choices || !apiData.choices[0]) {
      console.error("API error:", apiData);
      return;
    }

    const output = apiData.choices[0].message.content.trim();
    await displayMessage(output, side);

    const group = output.split(" ");
    const correct_guesses = [0, 0, 0, 0];
    for (const guess of group) {
      let cat = 0;
      for (const category in game) {
        if (game[category].includes(guess)) correct_guesses[cat]++;
        cat++;
      }
    }

    const highest = Math.max(...correct_guesses);
    if (highest === 4) {
      randomized = randomized.filter(word => !group.includes(word));
      for (const word of group) {
        const index = randomized.indexOf(word);
        if (index !== -1) randomized.splice(index, 1);  
      }
      input = `You got a group correct!`
        + `Given the set of words; ${JSON.stringify(randomized)}, find the groups of 4 words from here that will correspond to a category.` + 
        `Only output one of the groups since we're only allowed to check one group at a time. Write your final output in the following output:` + 
        `\"Word1 Word2 Word3 Word4\" where you wouldn't include the quotation marks in the response.`;
      score++;
    } else {
      input = `You are ${4 - highest} word(s) away from a correct grouping.`
      + `Given the set of words; ${JSON.stringify(randomized)}, find the groups of 4 words from here that will correspond to a category.` + 
      `Only output one of the groups since we're only allowed to check one group at a time. Write your final output in the following output:` + 
      `\"Word1 Word2 Word3 Word4\" where you wouldn't include the quotation marks in the response.`;
    }
  }

  // After done typing, trigger completion callback
  onComplete();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function displayMessage(output, side) {
  const chatboxSelector = side === "left" ? ".model-col:nth-child(1) .chatbox" : ".model-col:nth-child(2) .chatbox";
  const chatbox = document.querySelector(chatboxSelector);

  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message model";
  chatbox.appendChild(messageDiv);

  let index = 0;
  return new Promise(resolve => {
    function typeNextChar() {
      if (index < output.length) {
        messageDiv.textContent += output.charAt(index);
        index++;
        chatbox.scrollTop = chatbox.scrollHeight;
        setTimeout(typeNextChar, 30);
      } else {
        resolve();
      }
    }
    typeNextChar();
  });
}

onSnapshot(collection(db, "Votes"), (snapshot) => {
  const voteCounts = {};
  allModels.forEach(model => { voteCounts[model] = 0; });

  snapshot.forEach(doc => {
    const model = doc.data().votedFor;
    voteCounts[model] = (voteCounts[model] || 0) + 1;
  });

  const sortedModels = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const leaderboardBox = document.getElementById("leaderboard-box");
  leaderboardBox.innerHTML = "";

  sortedModels.forEach(([model, count], index) => {
    const entry = document.createElement("div");
    entry.className = "leaderboard-entry";
    entry.textContent = `${index + 1}. ${model} (${count} votes)`;
    leaderboardBox.appendChild(entry);
  });
});
