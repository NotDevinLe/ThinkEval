const generate = document.getElementById("generate")
const board = document.getElementById("board")
const send = document.getElementById("send")

const allModels = ["bart-mnli", "ada-002", "all-mpnet-base-v2", "flan-ul2", "llama-2", "gpt-4"];

let numSelected = 0
let selected = []
let game = []

generate.addEventListener("click", async () => {
    const modelName = allModels[Math.floor(Math.random() * allModels.length)];
    console.log("Using Model: ", modelName);

    board.innerHTML = "";
    numSelected = 0;

    const response = await fetch("gpt4games.json")
    const games = await response.json()

    game = games[Math.floor(Math.random() * games.length)];

    loadGame(game)
})

send.addEventListener("click", async () => {
    if (numSelected == 4) {
        const selectedWords = selected.map(tile => tile.textContent);
        for (const category in game) {
            const match = game[category].every(word => selectedWords.includes(word))

            if (match) {
                selected.forEach(tile => {
                    tile.classList.remove("selected");
                    tile.classList.add("correct");
                  });
            }
        }
    }
})

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
        numSelected++; 
        selected.push(tile);
    } else if (tile.classList.contains("selected")) {
        tile.classList.remove("selected");
        numSelected--;
        selected = selected.filter(t => t !== tile);
    }
}