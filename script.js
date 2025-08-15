let game = {
    theme: "",
    images: [],
    cards: [],
    flippedCards: [],
    wrongMoves: 0,
    matches: 0,
    isProcessing: false,
    startTime: null,
    timerRunning: null, 
    finalTime: null
};

let gameSeconds = 0;

function startTimer() {
    resetTimer()
    gameSeconds = 0;
    game.timerRunning = setInterval(() => {
        gameSeconds++
        displayTimeHtml()
    }, 1000)
}

function formatTimer(num) {
    return num.toString().padStart(2, "0")
}

function calcCurrentTimeString() {
    const minutes = Math.floor(gameSeconds / 60)
    const seconds = gameSeconds % 60
    return `${formatTimer(minutes)}:${formatTimer(seconds)}`
}

function displayTimeHtml() {
    document.getElementById("timer").textContent = calcCurrentTimeString()
}

function stopTimer() {
    game.finalTime = calcCurrentTimeString()
    clearInterval(game.timerRunning)
    game.timerRunning = null

}

function resetTimer() {
    if (game.timerRunning) {
        clearInterval(game.timerRunning)
    }
    gameSeconds = 0
    game.timerRunning = null
    game.finalTime = null
    document.getElementById("timer").textContent = "00:00"
}

const loadThemeData = async (theme) => {
    try {
        if (theme === "harry-potter") {
            const response = await fetch("https://hp-api.onrender.com/api/characters")
            const characters = await response.json()
            const validChars = characters.filter(char => char.name && char.image).slice(0, 8)
        
            return {
                name: "דמויות מארי פוטר",
                data: validChars.map((char, index) => ({
                    name: char.name,
                    image: char.image,
                    id: index
                }))
            }
        }

        if (theme === "dogs") {
            const dogs = []
            for (let i = 0; i < 8; i++) {
                const response = await fetch("https://dog.ceo/api/breeds/image/random")
                const dogData = await response.json() 
                const splitUrl = dogData.message.split("/")
                const breed = splitUrl[4]
                    console.log(`dogName ${i +1}: ${breed}`)

                dogs.push({
                    name:breed.charAt(0).toUpperCase() +breed.slice(1),
                    image:dogData.message,
                    id:i
                })
                    console.log(dogs)
            }

            return {
                name: "כלבים חמודים",
                data: dogs
            }
        }       

        if (theme === "countries") {
            const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags")
            const countries = await response.json();
            const validCountries = countries
                .filter(country => country.flags.png && country.name.common)
                .slice(0, 8);
                console.log(validCountries)

            return {
                name: "דגלי מדינות",
                data: validCountries.map((country, index) => ({
                    name: country.name.common,
                    image: country.flags.png,
                    id: index
                }))
            }       
        }

        throw new Error(`Unknown theme: ${theme}`)
    } catch (error) {
        if ( error.message.includes("Unknown theme")) {
            alert("שגיאה: עמך הסליחה נושא המשחק לא תקין")
        } else {
            alert("שגיאה בחיבור לאינטרנט, אנא נסה שוב")
        }
        throw error
    }
}

function selectTheme(selectedTheme) {
    if (selectedTheme === "random") {
        const themes = ["harry-potter", "dogs", "countries"]
        return themes[Math.floor(Math.random()*3)]
    }
    return selectedTheme
}

async function loadGameData(theme) {
    const themeData = await loadThemeData(theme)
    game.images = themeData.data
    game.themeName = themeData.name
}

function resetGameState() {
    game.flippedCards = []
    game.wrongMoves = 0
    game.matches = 0
    game.isProcessing = false
    game.finalTime = null
    const winnerMessage = document.getElementById("winnerMessage");
    winnerMessage.classList.remove("show");
    winnerMessage.style.display = "none";

} 

function randomShuffle(arr) {
    const shuffled = [...arr]

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        let changeIndex = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = changeIndex
    }
    return shuffled;
} 

function createGameCards() {
    const allCards = []
    game.images.forEach((image) => {
        allCards.push({id: image.id, image: image})
        allCards.push({id: image.id, image: image})
    })
    game.cards = randomShuffle(allCards)
}

function showLoading(show) {
    const loading = document.getElementById("loading")
    if (show) {
        loading.classList.add("show")
    } else {
        loading.classList.remove("show")
    }
}

function displayGame() {
    showLoading(false)
    document.getElementById("selectionScreen").style.display = "none"
    document.getElementById("gameScreen").style.display = "block"
    document.getElementById("themeName").textContent = game.themeName  
    createBoard()
    updateStats()
    startTimer()
}

function handleGameError(error) {
    console.error("שגיאה:", error)
    alert("שגיאה טכנית בטעינה  בחר/י נושא אחר")
    showLoading(false)
    document.getElementById("selectionScreen").style.display = "block"
    document.getElementById("gameScreen").style.display = "none"
}

function createBoard() {
    const gameBoard = document.getElementById("gameBoard")
    gameBoard.innerHTML = ""
    game.cards.forEach((card, index) => {
        const cardEL = document.createElement("div")
        cardEL.className = "card"
        cardEL.dataset.index = index
        cardEL.innerHTML = `
            <div class = "card-front">?</div>
            <div class = "card-back"> 
                <img src = "${card.image.image}" alt = "${card.image.name}">
                <div class = "card-name">${card.image.name}</div>
            </div>
        `
        cardEL.addEventListener("click", () => flipCard(index))
        gameBoard.appendChild(cardEL)
    })
}

function updateStats() {
    document.getElementById("wrongMoves").textContent = game.wrongMoves
    document.getElementById("matches").textContent = game.matches
}

function flipCard(index) {
    if (game.isProcessing || game.flippedCards.length >= 2 || game.flippedCards.includes(index)) {
        return 
    }
    const cardEL = document.querySelector(`[data-index="${index}"]`)
    if (cardEL.classList.contains("matched") || cardEL.classList.contains("flipped")) {
        return;
    }
    cardEL.classList.add("flipped")
    game.flippedCards.push(index)

    if (game.flippedCards.length === 2) {
        game.isProcessing = true
        setTimeout(checkMatch, 1000)
    }
}

function checkMatch() {
    const [first, second] = game.flippedCards
    const firstCard = game.cards[first]
    const secondCard = game.cards[second]
    const firstEl = document.querySelector(`[data-index="${first}"]`)
    const secondEl = document.querySelector(`[data-index="${second}"]`)

    if (firstCard.id === secondCard.id) {
        game.flippedCards = []
        game.isProcessing = false

        firstEl.classList.add("matched")
        secondEl.classList.add("matched")
        game.matches++
        updateStats()

        if (game.matches === 8) {
            stopTimer()
            setTimeout(() => {
                const winnerMessage = document.getElementById("winnerMessage");
                winnerMessage.style.display = "block"; 
                winnerMessage.classList.add("show");
                document.getElementById("finalTime").textContent = game.finalTime
                document.getElementById("finalWrongMoves").textContent = game.wrongMoves
            }, 500)
        }
    } else {
        game.wrongMoves++
        firstEl.classList.add("wrong")
        secondEl.classList.add("wrong")

        setTimeout(() => {
            firstEl.classList.remove("wrong", "flipped")
            secondEl.classList.remove("wrong", "flipped")
            game.flippedCards = []
            game.isProcessing = false
            updateStats()
        }, 600);
    }

}

function backToMenu() {
    resetTimer()
    resetGameState()
    document.getElementById("selectionScreen").style.display = "block"
    document.getElementById("gameScreen").style.display = "none"
}

function newGame() {
    resetTimer()
    resetGameState()
    startGame(game.theme)

}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            startGame(btn.dataset.theme)
        })
    })
    document.getElementById("backBtn").addEventListener("click", backToMenu)
    document.getElementById("restartBtn").addEventListener("click", newGame)
})

async function startGame(selectedTheme) {
    const theme = selectTheme(selectedTheme)
    game.theme = theme
    showLoading(true)

    try {
        resetTimer()
        resetGameState()
        await loadGameData(theme)
        createGameCards()
        displayGame()

    } catch (error) {
        handleGameError(error)
    }
}




