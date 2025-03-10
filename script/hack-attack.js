// Configuration based on difficulty
const DIFFICULTY_SETTINGS = {
    'easy': {
        targetLifespan: 1500,
        spawnRate: 1100,
        lives: 5,
        targetShrink: false,
        speedIncrease: 0.9
    },
    'medium': {
        targetLifespan: 1250,
        spawnRate: 800,
        lives: 3,
        targetShrink: true,
        speedIncrease: 0.85
    },
    'hard': {
        targetLifespan: 1000,
        spawnRate: 600,
        lives: 2,
        targetShrink: true,
        speedIncrease: 0.8
    }
};

// Game state
let gameConfig = { ...DIFFICULTY_SETTINGS['easy'] };
let gameState = {
    score: 0,
    level: 1,
    targetsClicked: 0,
    lives: gameConfig.lives,
    gameActive: false,
    difficultySelected: 'easy',
    currentTargets: [],
    spawnInterval: null,
    codeLineInterval: null
};

// DOM elements
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.querySelector('#score .stat-value');
const levelElement = document.querySelector('#level .stat-value');
const targetsElement = document.querySelector('#targets .stat-value');
const livesElement = document.querySelector('#lives .stat-value');
const finalScoreElement = document.getElementById('final-score');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const leaderboardEntries = document.getElementById('leaderboard-entries');
const loadingScreen = document.querySelector('.loading');
const levelNotification = document.getElementById('level-notification');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard');

// Symbols for targets
const SYMBOLS = ['$', '#', '&', '@', '%', '*', '^', '!', '+', '=', '<', '>', '?', '~', '|'];

// Create a target
function createTarget() {
    if (!gameState.gameActive) return;

    const target = document.createElement('div');
    target.className = 'target';

    // Random position inside the game container
    const gameWidth = gameContainer.offsetWidth;
    const gameHeight = gameContainer.offsetHeight;
    const targetSize = window.innerWidth <= 480 ? 50 : window.innerWidth <= 768 ? 60 : 70;

    // Ensure targets are fully inside the container with padding
    const padding = 10;
    const randomX = Math.random() * (gameWidth - targetSize - padding * 2) + padding;
    const randomY = Math.random() * (gameHeight - targetSize - padding * 2) + padding;

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    // Random symbol
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    target.textContent = symbol;

    // Point value based on level (higher levels = more points)
    const pointValue = (Math.floor(Math.random() * 3) + 1) * gameState.level * 10;
    target.dataset.points = pointValue;

    // Add click handler
    target.addEventListener('click', () => handleTargetClick(target));

    // Add to game container
    gameContainer.appendChild(target);

    // Shrinking effect for higher difficulties
    if (gameConfig.targetShrink) {
        gsap.to(target, {
            scale: 0.5,
            duration: gameConfig.targetLifespan / 1000,
            ease: "linear"
        });
    }

    // Remove target after lifespan
    const timeout = setTimeout(() => {
        if (target.parentNode) {
            target.parentNode.removeChild(target);
            handleMissedTarget();
        }
    }, gameConfig.targetLifespan);

    // Keep track of target
    gameState.currentTargets.push({
        element: target,
        timeout: timeout
    });
}

// Handle target click
function handleTargetClick(target) {
    // Remove target from DOM
    target.parentNode.removeChild(target);

    // Find the target in our array to clear its timeout
    const targetIndex = gameState.currentTargets.findIndex(t => t.element === target);
    if (targetIndex !== -1) {
        clearTimeout(gameState.currentTargets[targetIndex].timeout);
        gameState.currentTargets.splice(targetIndex, 1);
    }

    // Get point value from data attribute
    const points = parseInt(target.dataset.points);

    // Update score
    gameState.score += points;
    gameState.targetsClicked++;

    // Update display
    scoreElement.textContent = gameState.score;
    targetsElement.textContent = gameState.targetsClicked;

    // Create particle effect at target position
    createParticleEffect(target);

    // Level up after certain number of targets
    if (gameState.targetsClicked % 10 === 0) {
        levelUp();
    }
}

// Handle missed target
function handleMissedTarget() {
    // Only penalize if game is active
    if (!gameState.gameActive) return;

    // Reduce lives
    gameState.lives--;
    livesElement.textContent = gameState.lives;

    // Flash the lives counter in red
    gsap.to(livesElement, {
        color: 'red',
        duration: 0.2,
        repeat: 3,
        yoyo: true,
        onComplete: () => {
            livesElement.style.color = 'var(--neon-pink)';
        }
    });

    // Game over when lives reach 0
    if (gameState.lives <= 0) {
        endGame();
    }
}

// Create particle effect
function createParticleEffect(target) {
    const rect = target.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    // Position relative to game container
    const x = rect.left + rect.width / 2 - gameRect.left;
    const y = rect.top + rect.height / 2 - gameRect.top;

    // Create particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Random color
        const colors = ['var(--neon-pink)', 'var(--neon-green)', 'var(--neon-blue)'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        gameContainer.appendChild(particle);

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 60;
        const destinationX = Math.cos(angle) * distance;
        const destinationY = Math.sin(angle) * distance;

        // Animate with GSAP
        gsap.to(particle, {
            x: destinationX,
            y: destinationY,
            opacity: 0,
            duration: 0.6 + Math.random() * 0.4,
            ease: "power2.out",
            onComplete: () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }
        });
    }

    // Show points gained
    const pointsText = document.createElement('div');
    pointsText.textContent = `+${target.dataset.points}`;
    pointsText.style.position = 'absolute';
    pointsText.style.left = `${x}px`;
    pointsText.style.top = `${y}px`;
    pointsText.style.color = 'var(--neon-green)';
    pointsText.style.fontWeight = 'bold';
    pointsText.style.fontSize = '1.2rem';
    pointsText.style.textShadow = '0 0 5px var(--neon-green)';
    pointsText.style.zIndex = '3';
    pointsText.style.pointerEvents = 'none';

    gameContainer.appendChild(pointsText);

    gsap.to(pointsText, {
        y: '-30',
        opacity: 0,
        duration: 1,
        ease: "power1.out",
        onComplete: () => {
            if (pointsText.parentNode) {
                pointsText.parentNode.removeChild(pointsText);
            }
        }
    });
}

// Level up
function levelUp() {
    gameState.level++;
    levelElement.textContent = gameState.level;

    // Speed up the game
    gameConfig.targetLifespan *= gameConfig.speedIncrease;
    gameConfig.spawnRate *= gameConfig.speedIncrease;

    // Show level notification
    levelNotification.textContent = `LEVEL ${gameState.level}`;
    levelNotification.style.opacity = '1';

    gsap.to(levelNotification, {
        opacity: 0,
        duration: 2,
        delay: 1,
        ease: "power2.out"
    });
}

// Create digital code lines effect
function createCodeLines() {
    if (!gameState.gameActive) return;

    const gameWidth = gameContainer.offsetWidth;
    const gameHeight = gameContainer.offsetHeight;

    // Create horizontal or vertical line randomly
    const isHorizontal = Math.random() > 0.5;
    const codeLine = document.createElement('div');
    codeLine.className = 'code-line';

    if (isHorizontal) {
        codeLine.style.width = `${gameWidth}px`;
        codeLine.style.height = '2px';
        codeLine.style.left = '0';
        codeLine.style.top = `${Math.random() * gameHeight}px`;
    } else {
        codeLine.style.height = `${gameHeight}px`;
        codeLine.style.width = '2px';
        codeLine.style.top = '0';
        codeLine.style.left = `${Math.random() * gameWidth}px`;
    }

    gameContainer.appendChild(codeLine);

    // Animate line
    gsap.to(codeLine, {
        opacity: 0,
        duration: 2,
        delay: 1,
        onComplete: () => {
            if (codeLine.parentNode) {
                codeLine.parentNode.removeChild(codeLine);
            }
        }
    });
}

// Start the game
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.level = 1;
    gameState.targetsClicked = 0;
    gameState.lives = gameConfig.lives;
    gameState.gameActive = true;
    gameState.currentTargets = [];

    // Clear any existing targets
    document.querySelectorAll('.target').forEach(target => target.remove());
    document.querySelectorAll('.particle').forEach(particle => particle.remove());
    document.querySelectorAll('.code-line').forEach(line => line.remove());

    // Update displays
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    targetsElement.textContent = gameState.targetsClicked;
    livesElement.textContent = gameState.lives;

    // Hide start and game over screens
    startScreen.style.display = 'none';
    gameOverScreen.classList.remove('visible');

    // Start spawning targets
    gameState.spawnInterval = setInterval(createTarget, gameConfig.spawnRate);

    // Start code line effect
    gameState.codeLineInterval = setInterval(createCodeLines, 2000);
}

// End game
function endGame() {
    // Set game as inactive
    gameState.gameActive = false;

    // Clear intervals
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.codeLineInterval);

    // Clear timeouts for existing targets
    gameState.currentTargets.forEach(target => {
        clearTimeout(target.timeout);
    });

    // Show game over screen
    gameOverScreen.classList.add('visible');

    // Update final score
    finalScoreElement.textContent = gameState.score;

    // Save score to leaderboard
    saveScore();
}

// Leaderboard functionality
function saveScore() {
    let leaderboard = JSON.parse(localStorage.getItem('hackAttackLeaderboard')) || [];

    // Get player name from session or use fallback
    const playerName = sessionStorage.getItem('visitorName') || `Hacker_${Math.floor(Math.random() * 1000)}`;

    // Add new score
    leaderboard.push({
        name: playerName,
        score: gameState.score,
        level: gameState.level,
        targets: gameState.targetsClicked,
        difficulty: gameState.difficultySelected,
        date: new Date().toISOString()
    });

    // Sort and limit to top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem('hackAttackLeaderboard', JSON.stringify(leaderboard));

    // Update leaderboard display
    updateLeaderboard(playerName);

    // If connected to Supabase, also save score to the database
    if (typeof supabase !== 'undefined') {
        try {
            supabase.from('game_scores').insert([{
                player_name: playerName,
                score: gameState.score,
                level: gameState.level,
                targets: gameState.targetsClicked,
                difficulty: gameState.difficultySelected
            }]);
        } catch (err) {
            console.error('Error saving score to Supabase:', err);
        }
    }
}

// Update leaderboard display
function updateLeaderboard(currentPlayerName = null) {
    const leaderboard = JSON.parse(localStorage.getItem('hackAttackLeaderboard')) || [];
    leaderboardEntries.innerHTML = '';

    if (leaderboard.length === 0) {
        const emptyEntry = document.createElement('div');
        emptyEntry.className = 'leaderboard-entry';
        emptyEntry.textContent = 'No scores yet. Be the first!';
        leaderboardEntries.appendChild(emptyEntry);
        return;
    }

    leaderboard.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        if (entry.name === currentPlayerName) {
            entryElement.classList.add('highlight');
        }

        const rankElement = document.createElement('div');
        rankElement.textContent = `#${index + 1}`;

        const nameElement = document.createElement('div');
        nameElement.textContent = entry.name;

        const scoreElement = document.createElement('div');
        scoreElement.textContent = `${entry.score} pts (Lvl ${entry.level})`;

        entryElement.appendChild(rankElement);
        entryElement.appendChild(nameElement);
        entryElement.appendChild(scoreElement);

        leaderboardEntries.appendChild(entryElement);
    });
}

// Clear leaderboard functionality
function clearLeaderboard() {
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to clear all leaderboard data?';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'confirm-dialog-buttons';

    const confirmButton = document.createElement('button');
    confirmButton.className = 'button';
    confirmButton.textContent = 'Yes, Clear';
    confirmButton.style.backgroundColor = 'var(--neon-pink)';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'button';
    cancelButton.textContent = 'Cancel';

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);

    document.body.appendChild(dialog);

    // Button event handlers
    confirmButton.addEventListener('click', function () {
        // Clear leaderboard data
        localStorage.removeItem('hackAttackLeaderboard');
        updateLeaderboard();
        document.body.removeChild(dialog);
    });

    cancelButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
    });
}

// Set game difficulty
function setDifficulty(difficulty) {
    gameState.difficultySelected = difficulty;
    gameConfig = { ...DIFFICULTY_SETTINGS[difficulty] };

    // Update UI
    difficultyButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('selected');
        }
    });
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    gameOverScreen.classList.remove('visible');
    startScreen.style.display = 'flex';
});

difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.difficulty);
    });
});

clearLeaderboardBtn.addEventListener('click', clearLeaderboard);

// Pause game if window loses focus
window.addEventListener('blur', () => {
    if (gameState.gameActive) {
        gameState.gameActive = false;
        clearInterval(gameState.spawnInterval);
        clearInterval(gameState.codeLineInterval);
    }
});

// Resume game when window regains focus
window.addEventListener('focus', () => {
    if (!gameState.gameActive && !gameOverScreen.classList.contains('visible') && startScreen.style.display === 'none') {
        gameState.gameActive = true;
        gameState.spawnInterval = setInterval(createTarget, gameConfig.spawnRate);
        gameState.codeLineInterval = setInterval(createCodeLines, 2000);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Reposition any active targets
    document.querySelectorAll('.target').forEach(target => {
        const gameWidth = gameContainer.offsetWidth;
        const gameHeight = gameContainer.offsetHeight;
        const targetSize = window.innerWidth <= 480 ? 50 : window.innerWidth <= 768 ? 60 : 70;
        const padding = 10;

        // Keep targets within bounds
        let left = parseInt(target.style.left);
        let top = parseInt(target.style.top);

        if (left > gameWidth - targetSize - padding) {
            target.style.left = `${gameWidth - targetSize - padding}px`;
        }

        if (top > gameHeight - targetSize - padding) {
            target.style.top = `${gameHeight - targetSize - padding}px`;
        }
    });
});

// Update leaderboard on load
updateLeaderboard();

// Hide loading screen after a delay
setTimeout(() => {
    loadingScreen.style.opacity = 0;
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}, 1500);