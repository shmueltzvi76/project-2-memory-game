// Language System
let currentLanguage = 'he'; // Default to Hebrew

const translations = {
    he: {
        'main-title': '🧩 משחק הזיכרון',
        'subtitle': 'בחר נושא ואתחל לשחק!',
        'theme-harry-potter': '⚡ גיבורי הארי פוטר',
        'theme-dogs': '🐕 כלבים חמודים',
        'theme-countries': '🏳️ דגלי מדינות',
        'theme-random': '🎲 הפתעה אקראית',
        'loading': 'טוען משחק...',
        'stat-time': 'זמן',
        'stat-errors': 'טעויות',
        'stat-pairs': 'זוגות',
        'winner-title': '🎉 כל הכבוד! 🎉',
        'winner-message': 'סיימתם את המשחק בהצלחה!',
        'final-time-label': 'זמן סיום:',
        'final-errors-label': 'טעויות:',
        'btn-back': '🏠 חזרה',
        'btn-restart': '🔄 משחק חדש',
        'footer-love': '❤️נעשה באהבה בשבילך',
        'footer-rights': 'כל הזכויות שמורות',
        'footer-contact-title': '📞 פרטי התקשרות',
        'footer-role': 'מפתח Full Stack',
        'theme-name-harry-potter': 'דמויות מהארי פוטר',
        'theme-name-dogs': 'כלבים חמודים',
        'theme-name-countries': 'דגלי מדינות'
    },
    en: {
        'main-title': '🧩 Memory Game',
        'subtitle': 'Choose a theme and start playing!',
        'theme-harry-potter': '⚡ Harry Potter Heroes',
        'theme-dogs': '🐕 Cute Dogs',
        'theme-countries': '🏳️ Country Flags',
        'theme-random': '🎲 Random Surprise',
        'loading': 'Loading game...',
        'stat-time': 'Time',
        'stat-errors': 'Errors',
        'stat-pairs': 'Pairs',
        'winner-title': '🎉 Well Done! 🎉',
        'winner-message': 'You completed the game successfully!',
        'final-time-label': 'Final Time:',
        'final-errors-label': 'Errors:',
        'btn-back': '🏠 Back',
        'btn-restart': '🔄 New Game',
        'footer-love': '❤️Made with love for you',
        'footer-rights': 'All rights reserved',
        'footer-contact-title': '📞 Contact Details',
        'footer-role': 'Full Stack Developer',
        'theme-name-harry-potter': 'Harry Potter Characters',
        'theme-name-dogs': 'Cute Dogs',
        'theme-name-countries': 'Country Flags'
    }
};

// Detect country and set language automatically
async function detectCountryAndSetLanguage() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        // Set Hebrew only for Israel, English for all other countries
        if (countryCode === 'IL') {
            currentLanguage = 'he';
        } else {
            currentLanguage = 'en';
        }
    } catch (error) {
        // If detection fails, default to Hebrew
        console.log('Country detection failed, using default language');
        currentLanguage = 'he';
    }

    updatePageLanguage();
}

// Change language function
function changeLanguage(lang) {
    currentLanguage = lang;
    updatePageLanguage();
}

// Update all text on the page
function updatePageLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Update HTML lang and dir attributes
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'he' ? 'rtl' : 'ltr';

    // Update language toggle button
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.textContent = currentLanguage === 'he' ? 'English' : 'עברית';
    }

    // Update theme name if game is active
    if (game.theme && game.themeName) {
        const themeNameKey = `theme-name-${game.theme}`;
        if (translations[currentLanguage][themeNameKey]) {
            game.themeName = translations[currentLanguage][themeNameKey];
            const themeNameElement = document.getElementById('themeName');
            if (themeNameElement) {
                themeNameElement.textContent = game.themeName;
            }
        }
    }
}

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
                name: translations[currentLanguage]['theme-name-harry-potter'],
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
                name: translations[currentLanguage]['theme-name-dogs'],
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
                name: translations[currentLanguage]['theme-name-countries'],
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
            alert(currentLanguage === 'he' ? "שגיאה: עמך הסליחה נושא המשחק לא תקין" : "Error: Invalid game theme")
        } else {
            alert(currentLanguage === 'he' ? "שגיאה בחיבור לאינטרנט, אנא נסה שוב" : "Internet connection error, please try again")
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
    game.seenCards = new Set() // Track cards that have been seen before
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

// Preload all images before starting the game
function preloadImages(images) {
    return Promise.all(
        images.map(item => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(item)
                img.onerror = () => reject(new Error(`Failed to load image: ${item.image}`))
                img.src = item.image
            })
        })
    )
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
    alert(currentLanguage === 'he' ? "שגיאה טכנית בטעינה  בחר/י נושא אחר" : "Technical loading error, please choose another theme")
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
        // Only count as mistake if at least one card was seen before
        const firstCardId = `${first}-${firstCard.id}`
        const secondCardId = `${second}-${secondCard.id}`
        const firstWasSeen = game.seenCards.has(firstCardId)
        const secondWasSeen = game.seenCards.has(secondCardId)

        if (firstWasSeen || secondWasSeen) {
            game.wrongMoves++
        }

        // Mark these cards as seen for next time
        game.seenCards.add(firstCardId)
        game.seenCards.add(secondCardId)

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
    // Initialize language system
    detectCountryAndSetLanguage();

    // Language toggle button
    const languageToggle = document.getElementById('languageToggle');
    languageToggle.addEventListener('click', () => {
        const newLanguage = currentLanguage === 'he' ? 'en' : 'he';
        changeLanguage(newLanguage);
    });

    // Game buttons
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
        // Preload all images before showing the game
        await preloadImages(game.images)
        createGameCards()
        displayGame()

    } catch (error) {
        handleGameError(error)
    }
}




