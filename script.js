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

// Elements
const evaluateBtn = document.getElementById("evaluate");
const vote1Btn = document.getElementById("vote-model-1");
const vote2Btn = document.getElementById("vote-model-2");
const debugToggleBtn = document.getElementById("debug-toggle");

// Toggle Debug Visibility
debugToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("debug-visible");
});

// Evaluate Handler
evaluateBtn.addEventListener("click", () => {
  const debugVisible = document.body.classList.contains("debug-visible");

  let model1, model2;

  if (debugVisible) {
    model1 = document.getElementById("model-select-1")?.value;
    model2 = document.getElementById("model-select-2")?.value;
  } else {
    const randomizedModels = shuffle([...allModels]);
    model1 = randomizedModels[0];
    model2 = randomizedModels.find(m => m !== model1);

    const modelSelect1 = document.getElementById("model-select-1");
    const modelSelect2 = document.getElementById("model-select-2");

    if (modelSelect1) modelSelect1.value = model1;
    if (modelSelect2) modelSelect2.value = model2;
  }

  console.log(`Left model: ${model1}`);
  console.log(`Right model: ${model2}`);

  evaluate(model1, "left", model1);
  evaluate(model2, "right", model2);
});

// Voting Handlers
vote1Btn.addEventListener("click", async () => {
  const model1 = document.getElementById("model-select-1")?.value;
  await addDoc(collection(db, "Votes"), {
    votedFor: model1,
    modelPosition: "left",
    timestamp: Date.now()
  });
  console.log("Voted for:", model1);
});

vote2Btn.addEventListener("click", async () => {
  const model2 = document.getElementById("model-select-2")?.value;
  await addDoc(collection(db, "Votes"), {
    votedFor: model2,
    modelPosition: "right",
    timestamp: Date.now()
  });
  console.log("Voted for:", model2);
});

// Evaluate Model Function
async function evaluate(model, side, modelName) {
  const response = await fetch("games.json");
  const data = await response.json();

  const game = data[Math.floor(Math.random() * data.length)];
  let randomized = Object.values(game).flat();
  randomized = shuffle(randomized);

  let input = `Given ${JSON.stringify(randomized)}, can you find a way to make 4 groups of 4 words based on their category? Only return the final answer with the four words with whitespace between them.`;

  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://hf-backend-dusky.vercel.app/api/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const apiData = await res.json();
    const output = apiData.choices?.[0]?.message?.content?.trim();

    if (!output) {
      console.error("API error:", apiData);
      return;
    }

    await displayMessage(output, side, modelName);

    const group = output.split(" ");
    const correct_guesses = [0, 0, 0, 0];

    let cat = 0;
    for (const category in game) {
      for (const guess of group) {
        if (game[category].includes(guess)) {
          correct_guesses[cat]++;
        }
      }
      cat++;
    }

    const highest = Math.max(...correct_guesses);
    if (highest === 4) {
      randomized = randomized.filter(word => !group.includes(word));
      input = `You got a group correct! Find the next grouping for ${JSON.stringify(randomized)}.`;
    } else {
      input = `You are ${4 - highest} word(s) away from a correct grouping. Repeat with ${JSON.stringify(randomized)}.`;
    }
  }
}

// Typing Effect & Model Name Display
async function displayMessage(output, side, modelName) {
  const chatboxSelector = side === "left" ? ".model-col:nth-child(1) .chatbox" : ".model-col:nth-child(2) .chatbox";
  const modelNameSelector = side === "left" ? "#model-name-1" : "#model-name-2";

  const chatbox = document.querySelector(chatboxSelector);
  const modelNameDiv = document.querySelector(modelNameSelector);

  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message model";
  chatbox.appendChild(messageDiv);

  for (let index = 0; index < output.length; index++) {
    messageDiv.textContent += output.charAt(index);
    chatbox.scrollTop = chatbox.scrollHeight;
    await new Promise(res => setTimeout(res, 30));
  }

  // After typing done, show model name
  modelNameDiv.textContent = `Model: ${modelName}`;
}

// Shuffle Utility
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Realtime Leaderboard Update
onSnapshot(collection(db, "Votes"), (snapshot) => {
  const voteCounts = Object.fromEntries(allModels.map(m => [m, 0]));

  snapshot.forEach(doc => {
    const model = doc.data().votedFor;
    if (model in voteCounts) voteCounts[model]++;
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
