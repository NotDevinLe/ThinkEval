import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";


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

// Read a specific document
// const ref = doc(db, "ModelPerformance", "ada-002");
// const snap = await getDoc(ref);

// if (snap.exists()) {
//   console.log("Model Data:", snap.data());
//   document.body.innerHTML += `<p>${JSON.stringify(snap.data())}</p>`;
// } else {
//   console.log("No such document!");
// }

const evaluateBtn = document.getElementById("evaluate");

evaluateBtn.addEventListener("click", function() {
    const model1 = document.getElementById("model-select-1").value
    const model2 = document.getElementById("model-select-2").value

    evaluate(model1);
    evaluate(model2);

    const voteModel1 = document.createElement('button');
    voteModel1.textContent = 'Vote Model 1';
    voteModel1.className = 'vote';
    voteModel1.id = 'vote-model-1';
    voteModel1.type = 'button'

    const voteModel2 = document.createElement('button');
    voteModel2.textContent = 'Vote Model 2';
    voteModel2.className = 'vote';
    voteModel2.id = 'vote-model-2';
    voteModel2.type = 'button'

    const buttonsContainer = document.getElementById("buttons")
    buttonsContainer.append(voteModel1)
    buttonsContainer.append(voteModel2)
})

async function evaluate(model) {
    const response = await fetch("games.json");
    const data = await response.json();
    const game = data[Math.floor(Math.random() * data.length)];

    let randomized = [];

    for (const category in game) {
        for (const word in category) {
            randomized.push(word);
        }
    }

    randomized = shuffle(randomized)

    let input = `Given ${JSON.stringify(randomized)}, can you find a way to make 4 groups of 4 words based on their category? Only return the final answer with the four words with whitespace between them.`;
    let score = 0;
    // Simulate a game
    for (let i = 0; i < 4; i++) {
        // Call api here with a four word sequence with white space
        const output = "";
        const group = output.split(" ");

        const correct_guesses = [0, 0, 0, 0]
        
        // Compute the categories it got correct
        for (const guess in group) {
            let cat = 0;
            for (const category in game) {
                for (let j = 0; j < 4; j++) {
                    if (game[category][j] == guess) {
                        correct_guesses[cat]++;
                    }
                }
            }
            cat++;
        }

        const highest = Math.max(...correct_guesses)

        if (highest == 4) {
            for (let j = 0; j < randomized.length; j++) {
                for (let k = 0; k < 4; k++) {
                    if (randomized[j] == group[k]) {
                        randomized.splice(j, 1)
                    }
                }
            }
            input = `You got a group correct! Find the next grouping for ${JSON.stringify(randomized)}`;
            score++;
        }
        else {
            input = `You are ${4 - Math.max(...correct_guesses)} word(s) away from a corect grouping. Repeat the process with ${JSON.stringify(randomized)}.`    
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