const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['https://JohnLemma.github.io', 'https://t.me'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Game state
let gameState = {
    currentPot: 0,
    players: {},
    numberSelections: Array(10).fill(0),
    roundActive: false,
    timeRemaining: 30
};

// API Endpoints
app.post('/api/place-bet', (req, res) => {
    try {
        const { userId, username, number } = req.body;
        const betAmount = 10; // Fixed bet amount

        // Check if round is active
        if (!gameState.roundActive) {
            return res.status(400).json({ error: 'Round not active' });
        }

        // Check if user already placed a bet
        if (gameState.players[userId]) {
            return res.status(400).json({ error: 'Already placed bet for this round' });
        }

        // Record bet
        gameState.players[userId] = {
            username,
            number,
            amount: betAmount
        };
        gameState.currentPot += betAmount;
        gameState.numberSelections[number - 1]++;

        res.json({
            success: true,
            pot: gameState.currentPot,
            playerCount: Object.keys(gameState.players).length,
            numberSelections: gameState.numberSelections
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/game-state', (req, res) => {
    res.json({
        pot: gameState.currentPot,
        playerCount: Object.keys(gameState.players).length,
        numberSelections: gameState.numberSelections,
        roundActive: gameState.roundActive,
        timeRemaining: gameState.timeRemaining
    });
});

// Game Logic
function startNewRound() {
    gameState.roundActive = true;
    gameState.timeRemaining = 30;
    console.log('New round started');
}

function endRound() {
    const winningNumber = Math.floor(Math.random() * 10) + 1;
    console.log('Winning number:', winningNumber);

    // Find winners
    const winners = Object.entries(gameState.players)
        .filter(([_, bet]) => bet.number === winningNumber);

    // Calculate winnings
    if (winners.length > 0) {
        const winAmount = Math.floor(gameState.currentPot / winners.length);
        winners.forEach(([userId, player]) => {
            console.log(`Winner: ${player.username}, Amount: ${winAmount}`);
        });
    }

    // Reset game state
    gameState = {
        currentPot: 0,
        players: {},
        numberSelections: Array(10).fill(0),
        roundActive: false,
        timeRemaining: 30
    };

    // Start new round after a short delay
    setTimeout(startNewRound, 5000);
}

// Game Timer
setInterval(() => {
    if (gameState.roundActive) {
        gameState.timeRemaining--;
        
        if (gameState.timeRemaining <= 0) {
            endRound();
        }
    }
}, 1000);

// Start first round
startNewRound();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
