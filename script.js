import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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

const generate = document.getElementById("generate")
const board = document.getElementById("board")
const send = document.getElementById("send")
const good = document.getElementById("good")
const bad = document.getElementById("bad")

const allModels = ["bart-mnli", "ada-002", "all-mpnet-base-v2", "flan-ul2", "llama-2", "gpt-4"];

let selected = []
let game = []
let modelName = ""

generate.addEventListener("click", async () => {
    modelName = allModels[Math.floor(Math.random() * allModels.length)];
    console.log("Using Model: ", modelName);

    board.innerHTML = "";
    selected = []

    const response = await fetch("gpt4games.json")
    const games = await response.json()

    game = games[Math.floor(Math.random() * games.length)];

    loadGame(game)
})

send.addEventListener("click", async () => {
    if (selected.length == 4) {
        let highest = 0
        const selectedWords = selected.map(tile => tile.textContent);
        const message = document.getElementById("message")
        for (const category in game) {
            let currGroupings = 0
            for (const word of game[category]) {
                if (selectedWords.includes(word)) {
                    currGroupings++;
                }
            }
            highest = Math.max(highest, currGroupings)

            if (currGroupings == 4) {
                selected.forEach(tile => {
                    tile.classList.remove("selected");
                    tile.classList.add("correct");
                  });
                  selected = []
                  message.textContent = "You got a grouping correct!"
                  return
            }
        }
        message.textContent = `You were ${4 - highest} word(s) away.`


    }
})

good.addEventListener("click", async () => {
    if (!modelName) return;
  
    const modelRef = doc(db, "PuzzleGeneration", modelName);
    const modelSnap = await getDoc(modelRef);
  
    let elo = 1000;
  
    if (modelSnap.exists()) {
      elo = modelSnap.data().elo || 1000;
    } else {
      await setDoc(modelRef, { elo: elo });
      console.log(`Model ${modelName} added with default ELO ${elo}`);
    }
  
    const newElo = elo + 10;
  
    await updateDoc(modelRef, {
      elo: newElo
    });
  
  });

  bad.addEventListener("click", async () => {
    if (!modelName) return;
  
    const modelRef = doc(db, "PuzzleGeneration", modelName);
    const modelSnap = await getDoc(modelRef);
  
    let elo = 1000;
  
    if (modelSnap.exists()) {
      elo = modelSnap.data().elo || 1000;
    } else {
      await setDoc(modelRef, { elo: elo });
      console.log(`Model ${modelName} added with default ELO ${elo}`);
    }
  
    const newElo = elo - 10;
  
    await updateDoc(modelRef, {
      elo: newElo
    });
  
  });

function loadGame(game) {
    let randomized = [];
    for (const category in game) randomized.push(...game[category]);
    randomized = shuffle(randomized);

    for (const word of randomized) {
        const tile = document.createElement("div")
        tile.className = 'word-tile-game'
        tile.textContent = word
        tile.onclick = () => {
            toggleSelection(tile)
        }
        board.appendChild(tile)
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function toggleSelection(tile) {
    if (!tile.classList.contains("selected") && selected.length < 4) {
        tile.classList.add("selected");
        selected.push(tile);
    } else if (tile.classList.contains("selected")) {
        tile.classList.remove("selected");
        selected = selected.filter(t => t !== tile);
    }
}

onSnapshot(collection(db, "PuzzleGeneration"), (snapshot) => {
    const models = [];
  
    snapshot.forEach(doc => {
      const data = doc.data();
      models.push({
        name: doc.id,
        elo: data.elo || 1000
      });
    });
  
    models.sort((a, b) => b.elo - a.elo);
  
    const leaderboardBox = document.getElementById("leaderboard-box");
    leaderboardBox.innerHTML = "";
  
    models.forEach((model, index) => {
      const entry = document.createElement("div");
      entry.className = "leaderboard-entry";
      entry.textContent = `${index + 1}. ${model.name} (ELO: ${model.elo})`;
      leaderboardBox.appendChild(entry);
    });
  });