const generate = document.getElementById("generate")
const board = document.getElementById("board")

const allModels = ["bart-mnli", "ada-002", "all-mpnet-base-v2", "flan-ul2", "llama-2", "gpt-4"];

generate.addEventListener("click", async () => {
    const modelName = allModels[Math.floor(Math.random() * allModels.length)];
    console.log("Using Model: ", modelName);

    board.innerHTML = "";

    const response = await fetch("gpt4games.json")
    const games = await response.json()

    const game = games[Math.floor(Math.random() * games.length)];

    loadGame(game)
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
            toggleSelection()
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

function toggleSelection() {
    console.log("hi")
}