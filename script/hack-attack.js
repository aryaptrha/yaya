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
    paused: false,
    difficultySelected: 'easy',
    currentTargets: [],
    spawnInterval: null,
    codeLineInterval: null
};

const CODE_LINE_RATE = 2000;

// Respected by every JS-driven (GSAP) effect below — CSS keyframes/transitions
// are handled separately via the prefers-reduced-motion rule in the stylesheet.
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = typeof window.gsap !== 'undefined';
let memoryLeaderboard = [];

function killTween(target) {
    if (HAS_GSAP) window.gsap.killTweensOf(target);
}

function readLeaderboard() {
    try {
        const stored = localStorage.getItem('hackAttackLeaderboard');
        if (stored === null) return [...memoryLeaderboard];

        const value = JSON.parse(stored);
        memoryLeaderboard = Array.isArray(value) ? value : [];
    } catch {
        // Storage can be unavailable or contain legacy/corrupt data.
    }
    return [...memoryLeaderboard];
}

function writeLeaderboard(leaderboard) {
    memoryLeaderboard = [...leaderboard];
    try {
        localStorage.setItem('hackAttackLeaderboard', JSON.stringify(leaderboard));
    } catch {
        // Keep the leaderboard working in memory when storage is unavailable.
    }
}

function clearStoredLeaderboard() {
    memoryLeaderboard = [];
    try {
        localStorage.removeItem('hackAttackLeaderboard');
    } catch {
        // The in-memory leaderboard is already clear.
    }
}

// Timers are restarted rather than mutated so a level-up actually changes the
// spawn rate — setInterval keeps its original period once created.
function startTimers() {
    stopTimers();
    gameState.spawnInterval = setInterval(createTarget, gameConfig.spawnRate);
    gameState.codeLineInterval = setInterval(createCodeLines, CODE_LINE_RATE);
}

function stopTimers() {
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.codeLineInterval);
    gameState.spawnInterval = null;
    gameState.codeLineInterval = null;
}

function forgetTarget(target) {
    const index = gameState.currentTargets.findIndex(t => t.element === target);
    if (index === -1) return null;
    return gameState.currentTargets.splice(index, 1)[0];
}

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

    // Shrinking effect for higher difficulties — skipped under reduced motion
    // since it's a continuous per-target tween, not the countdown itself.
    if (gameConfig.targetShrink && !PREFERS_REDUCED_MOTION && HAS_GSAP) {
        window.gsap.to(target, {
            scale: 0.5,
            duration: gameConfig.targetLifespan / 1000,
            ease: "linear"
        });
    }

    // Remove target after lifespan
    const timeout = setTimeout(() => {
        forgetTarget(target);
        if (target.parentNode) {
            killTween(target);
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
    // Ignore a second click that lands before the node is detached
    if (!target.parentNode) return;

    // Clear the expiry timeout before removing the node, so it can't fire a miss
    const tracked = forgetTarget(target);
    if (tracked) clearTimeout(tracked.timeout);

    // Measure while still attached — a detached node reports a zero rect, which
    // would fling the burst outside the container.
    const burst = targetCenter(target);
    const points = parseInt(target.dataset.points, 10) || 0;

    killTween(target);
    target.parentNode.removeChild(target);

    // Update score
    gameState.score += points;
    gameState.targetsClicked++;

    // Update display
    scoreElement.textContent = gameState.score;
    targetsElement.textContent = gameState.targetsClicked;

    // Create particle effect at target position
    createParticleEffect(burst.x, burst.y, points);

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

    // Flash the lives counter in red — a plain color swap under reduced motion,
    // the flicker animation otherwise.
    if (PREFERS_REDUCED_MOTION || !HAS_GSAP) {
        livesElement.style.color = 'var(--neon-pink)';
    } else {
        window.gsap.to(livesElement, {
            color: 'red',
            duration: 0.2,
            repeat: 3,
            yoyo: true,
            onComplete: () => {
                livesElement.style.color = 'var(--neon-pink)';
            }
        });
    }

    // Game over when lives reach 0
    if (gameState.lives <= 0) {
        endGame();
    }
}

// Centre of a target, in game-container coordinates
function targetCenter(target) {
    const rect = target.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - gameRect.left,
        y: rect.top + rect.height / 2 - gameRect.top
    };
}

// Create particle effect
function createParticleEffect(x, y, points) {
    // The particle spray is purely decorative and the highest-volume effect in
    // the game — skip it under reduced motion, the points readout still lands.
    if (!PREFERS_REDUCED_MOTION && HAS_GSAP) {
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
            window.gsap.to(particle, {
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
    }

    // Show points gained
    const pointsText = document.createElement('div');
    pointsText.textContent = `+${points}`;
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

    if (PREFERS_REDUCED_MOTION || !HAS_GSAP) {
        // Same readout, no float/fade tween — just a brief, static display.
        setTimeout(() => {
            if (pointsText.parentNode) {
                pointsText.parentNode.removeChild(pointsText);
            }
        }, 500);
    } else {
        window.gsap.to(pointsText, {
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
}

// Level up
function levelUp() {
    gameState.level++;
    levelElement.textContent = gameState.level;

    // Speed up the game, with a floor so late levels stay playable
    gameConfig.targetLifespan = Math.max(350, gameConfig.targetLifespan * gameConfig.speedIncrease);
    gameConfig.spawnRate = Math.max(220, gameConfig.spawnRate * gameConfig.speedIncrease);
    startTimers();

    // Kill any tween left over from a previous notification (this one, or a
    // pause/resume) before touching opacity directly, so they can't fight.
    killTween(levelNotification);

    // Show level notification
    levelNotification.textContent = `LEVEL ${gameState.level}`;
    levelNotification.style.opacity = '1';

    if (PREFERS_REDUCED_MOTION || !HAS_GSAP) {
        // Same hold-then-hide, no fade tween.
        setTimeout(() => {
            levelNotification.style.opacity = '0';
        }, 1000);
    } else {
        window.gsap.to(levelNotification, {
            opacity: 0,
            duration: 2,
            delay: 1,
            ease: "power2.out"
        });
    }
}

// Create digital code lines effect
function createCodeLines() {
    // Purely decorative and continuous — the first thing to drop under
    // reduced motion, since it adds/removes a node every couple of seconds
    // for no gameplay benefit.
    if (!gameState.gameActive || PREFERS_REDUCED_MOTION || !HAS_GSAP) return;

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
    window.gsap.to(codeLine, {
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
    // Reset the tuning back to the chosen difficulty. levelUp() mutates
    // gameConfig, so without this a second run starts at the speed the last
    // one ended at.
    gameConfig = { ...DIFFICULTY_SETTINGS[gameState.difficultySelected] };

    // Reset game state
    gameState.score = 0;
    gameState.level = 1;
    gameState.targetsClicked = 0;
    gameState.lives = gameConfig.lives;
    gameState.gameActive = true;
    gameState.paused = false;
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

    // Start spawning targets and the code-line effect
    startTimers();
}

// End game
function endGame() {
    // Set game as inactive
    gameState.gameActive = false;
    gameState.paused = false;

    stopTimers();

    // Clear timeouts for existing targets
    gameState.currentTargets.forEach(target => {
        clearTimeout(target.timeout);
    });
    gameState.currentTargets = [];

    // Show game over screen
    gameOverScreen.classList.add('visible');

    // Update final score
    finalScoreElement.textContent = gameState.score;

    // Save score to leaderboard
    saveScore();
}

// Leaderboard functionality
function saveScore() {
    let leaderboard = readLeaderboard();

    // Anonymous local player name — there's no account system, just a per-run tag
    const playerName = `Hacker_${Math.floor(Math.random() * 1000)}`;

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

    // Persist locally when browser storage is available.
    writeLeaderboard(leaderboard);

    // Update leaderboard display
    updateLeaderboard(playerName);
}

// Update leaderboard display
function updateLeaderboard(currentPlayerName = null) {
    const leaderboard = readLeaderboard();
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
    if (document.querySelector('.confirm-dialog')) return;

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

    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const previouslyFocused = document.activeElement;
    document.body.appendChild(dialog);
    cancelButton.focus();

    // Added post-append so the transition from the CSS's default opacity:0
    // actually runs (toggling the class in the same frame it's appended
    // would collapse to no transition at all).
    requestAnimationFrame(() => dialog.classList.add('visible'));

    function close() {
        document.removeEventListener('keydown', onKeydown);
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    }

    function onKeydown(event) {
        if (event.key === 'Escape') close();
    }

    document.addEventListener('keydown', onKeydown);

    confirmButton.addEventListener('click', function () {
        clearStoredLeaderboard();
        updateLeaderboard();
        close();
    });

    cancelButton.addEventListener('click', close);
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

// Pause when the tab is hidden, resume when it comes back. `paused` is tracked
// explicitly so resume can't restart a game that was never started or is over.
function pauseGame() {
    if (!gameState.gameActive) return;
    gameState.gameActive = false;
    gameState.paused = true;
    stopTimers();

    // A still-running levelUp() fade tween would otherwise keep ticking and
    // overwrite this opacity, making "PAUSED" fade away on its own.
    killTween(levelNotification);
    levelNotification.textContent = 'PAUSED';
    levelNotification.style.opacity = '1';
}

function resumeGame() {
    if (!gameState.paused) return;
    gameState.paused = false;
    gameState.gameActive = true;
    killTween(levelNotification);
    levelNotification.style.opacity = '0';
    startTimers();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
    else resumeGame();
});
window.addEventListener('blur', pauseGame);
window.addEventListener('focus', resumeGame);

// Handle window resize
window.addEventListener('resize', () => {
    // Reposition any active targets
    document.querySelectorAll('.target').forEach(target => {
        const gameWidth = gameContainer.offsetWidth;
        const gameHeight = gameContainer.offsetHeight;
        const targetSize = window.innerWidth <= 480 ? 50 : window.innerWidth <= 768 ? 60 : 70;
        const padding = 10;

        // Keep targets within bounds
        const left = parseInt(target.style.left, 10);
        const top = parseInt(target.style.top, 10);

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

// Hide the loading overlay once the page is actually ready, with a short floor
// so it doesn't just flash, and a ceiling so a stalled asset can't trap the user.
let loadingFallbackTimer = setTimeout(hideLoadingScreen, 4000);

function hideLoadingScreen() {
    if (!loadingScreen || loadingScreen.dataset.hidden === 'true') return;
    loadingScreen.dataset.hidden = 'true';

    // Whichever path fires first (ready, or the ceiling) makes the other moot.
    clearTimeout(loadingFallbackTimer);

    const removeOverlay = () => {
        loadingScreen.style.display = 'none';
    };

    if (PREFERS_REDUCED_MOTION) {
        loadingScreen.style.opacity = 0;
        removeOverlay();
    } else {
        loadingScreen.style.opacity = 0;
        setTimeout(removeOverlay, 500);
    }
}

if (document.readyState === 'complete') {
    setTimeout(hideLoadingScreen, 400);
} else {
    window.addEventListener('load', () => setTimeout(hideLoadingScreen, 400));
}