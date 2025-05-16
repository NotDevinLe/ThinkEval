import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";


// Setting up the database
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

const evaluateBtn = document.getElementById("evaluate");

evaluateBtn.addEventListener("click", function() {
    const model1 = document.getElementById("model-select-1").value
    const model2 = document.getElementById("model-select-2").value

    evaluate(model1, "left");
    evaluate(model2, "right");

    // const voteModel1 = document.createElement('button');
    // voteModel1.textContent = 'Vote Model 1';
    // voteModel1.className = 'vote';
    // voteModel1.id = 'vote-model-1';
    // voteModel1.type = 'button'

    // const voteModel2 = document.createElement('button');
    // voteModel2.textContent = 'Vote Model 2';
    // voteModel2.className = 'vote';
    // voteModel2.id = 'vote-model-2';
    // voteModel2.type = 'button'

    // const buttonsContainer = document.getElementById("buttons")
    // buttonsContainer.append(voteModel1)
    // buttonsContainer.append(voteModel2)
})

async function evaluate(model, side) {
  const response = await fetch("games.json");
  const data = await response.json();

  const game = data[Math.floor(Math.random() * data.length)];

  let randomized = [];

  for (const category in game) {
    for (const word of game[category]) {
      randomized.push(word);
    }
  }

  randomized = shuffle(randomized);

  let input = `Given ${JSON.stringify(randomized)}, can you find a way to make 4 groups of 4 words based on their category? Only return the final answer with the four words with whitespace between them.`;
  let score = 0;

  for (let i = 0; i < 4; i++) {
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

    // DISPLAY THE OUTPUT
    const chatboxSelector = side === "left" ? ".model-col:nth-child(1) .chatbox" : ".model-col:nth-child(2) .chatbox";
    const chatbox = document.querySelector(chatboxSelector);

    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message model";
    chatbox.appendChild(messageDiv);

    // Typing effect
    let index = 0;
    function typeNextChar() {
      if (index < output.length) {
        messageDiv.textContent += output.charAt(index);
        index++;
        chatbox.scrollTop = chatbox.scrollHeight;
        setTimeout(typeNextChar, 30);
      }
    }
    typeNextChar();

    // Grouping logic
    const group = output.split(" ");
    const correct_guesses = [0, 0, 0, 0];

    for (const guess of group) {
      let cat = 0;
      for (const category in game) {
        for (let j = 0; j < 4; j++) {
          if (game[category][j] === guess) {
            correct_guesses[cat]++;
          }
        }
        cat++;
      }
    }

    const highest = Math.max(...correct_guesses);

    if (highest === 4) {
      for (let j = randomized.length - 1; j >= 0; j--) {
        if (group.includes(randomized[j])) {
          randomized.splice(j, 1);
        }
      }
      input = `You got a group correct! Find the next grouping for ${JSON.stringify(randomized)}.`;
      score++;
    } else {
      input = `You are ${4 - highest} word(s) away from a correct grouping. Repeat the process with ${JSON.stringify(randomized)}.`;
    }
  }
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const vote1Btn = document.getElementById("vote-model-1");
const vote2Btn = document.getElementById("vote-model-2");

vote1Btn.addEventListener("click", async () => {
    const model1 = document.getElementById("model-select-1").value;
    await addDoc(collection(db, "Votes"), {
        votedFor: model1,
        modelPosition: "left",
        timestamp: Date.now()
    });
    console.log("Voted for:", model1);
});

vote2Btn.addEventListener("click", async () => {
    const model2 = document.getElementById("model-select-2").value;
    await addDoc(collection(db, "Votes"), {
        votedFor: model2,
        modelPosition: "right",
        timestamp: Date.now()
    });
    console.log("Voted for:", model2);
});

// update leader board

const allModels = [
  "bart-mnli",
  "ada-002",
  "all-mpnet-base-v2",
  "flan-ul2",
  "llama-2",
  "gpt-3.5-turbo"
];

onSnapshot(collection(db, "Votes"), (snapshot) => {
  const voteCounts = {};

  // Initialize counts to 0 for all models
  allModels.forEach(model => {
    voteCounts[model] = 0;
  });

  snapshot.forEach(doc => {
    const model = doc.data().votedFor;
    voteCounts[model] = (voteCounts[model] || 0) + 1;
  });

  const sortedModels = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1]);

  const leaderboardBox = document.getElementById("leaderboard-box");
  leaderboardBox.innerHTML = "";

  sortedModels.forEach(([model, count], index) => {
    const entry = document.createElement("div");
    entry.className = "leaderboard-entry";
    entry.textContent = `${index + 1}. ${model} (${count} votes)`;
    leaderboardBox.appendChild(entry);
  });
});
