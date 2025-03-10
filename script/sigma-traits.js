const sigmaTraits = [
    {
        trait: "Stares at walls instead of people",
        description: "Walls don't judge. Walls understand the Sigma grindset.",
        emoji: "🧱"
    },
    {
        trait: "Uses dark mode on everything",
        description: "Light attracts bugs. Darkness attracts success.",
        emoji: "🌚"
    },
    {
        trait: "Types with 100% accuracy while looking at the ceiling",
        description: "True Sigmas don't need to look at keyboards. Keyboards look at them.",
        emoji: "⌨️"
    },
    {
        trait: "Spends 3 hours on a bug that could be fixed with a Google search",
        description: "It's not about efficiency, it's about sending a message to the compiler.",
        emoji: "🐛"
    },
    {
        trait: "Drinks coffee after 11 PM",
        description: "Sleep is for the weak. Caffeine is for the week... and weekend.",
        emoji: "☕"
    },
    {
        trait: "Responds to 'Hello' with 'HTTPS 200 OK'",
        description: "Social protocols are just another API to master.",
        emoji: "🤖"
    },
    {
        trait: "Has multiple personality disorder — all of them are programmers",
        description: "It's not a bug, it's a distributed system architecture.",
        emoji: "👥"
    },
    {
        trait: "Doesn't read documentation, just guesses the API",
        description: "Documentation is written by followers. Sigma males create their own reality.",
        emoji: "📝"
    },
    {
        trait: "Refuses to use frameworks",
        description: "Frameworks are training wheels. Sigmas code on unicycles.",
        emoji: "🦄"
    },
    {
        trait: "Uses lorem ipsum as actual content",
        description: "When you're Sigma enough, gibberish becomes profound wisdom to others.",
        emoji: "📜"
    },
    {
        trait: "Debugs with console.log instead of a debugger",
        description: "Real Sigmas don't need specialized tools. They print their way to success.",
        emoji: "🖨️"
    },
    {
        trait: "Pronounces SQL as 'Squirrel'",
        description: "Alphas say 'S-Q-L'. Betas say 'Sequel'. Sigmas create linguistic chaos.",
        emoji: "🐿️"
    },
    {
        trait: "GitHub profile is just README files",
        description: "Code is temporary. Documentation is forever.",
        emoji: "📚"
    },
    {
        trait: "Prefers CLI over GUI",
        description: "Graphics are for the visually dependent. Text is for the intellectually independent.",
        emoji: "💻"
    },
    {
        trait: "Has never closed a Stack Overflow tab",
        description: "Each tab represents a battle won in the war of knowledge.",
        emoji: "🏆"
    }
];

const generateBtn = document.getElementById('generateBtn');
const traitElement = document.getElementById('trait');
const descriptionElement = document.getElementById('description');
const emojiElement = document.querySelector('.emoji');

// Function to create sparkle effect
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);
    
    // Remove sparkle after animation completes
    setTimeout(() => {
        sparkle.remove();
    }, 500);
}

// Add mousemove event for sparkle effect
document.addEventListener('mousemove', (e) => {
    // Only create sparkles occasionally to avoid overwhelming the browser
    if (Math.random() < 0.1) {
        createSparkle(e.clientX, e.clientY);
    }
});

// Function to generate random trait
function generateTrait() {
    // Remove 'show' class for animation
    traitElement.classList.remove('show');
    descriptionElement.classList.remove('show');
    
    // Random shaking effect
    const card = document.querySelector('.sigma-card');
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'shake 0.5s';
    }, 10);
    
    // Generate random sparkles around the button
    const buttonRect = generateBtn.getBoundingClientRect();
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const x = buttonRect.left + Math.random() * buttonRect.width;
            const y = buttonRect.top + Math.random() * buttonRect.height;
            createSparkle(x, y);
        }, i * 50);
    }
    
    // Get random trait after short delay for animation
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * sigmaTraits.length);
        const randomTrait = sigmaTraits[randomIndex];
        
        traitElement.textContent = randomTrait.trait;
        descriptionElement.textContent = randomTrait.description;
        emojiElement.textContent = randomTrait.emoji;
        
        // Add 'show' class for animation
        traitElement.classList.add('show');
        descriptionElement.classList.add('show');
    }, 300);
}

// Button click event
generateBtn.addEventListener('click', generateTrait);

// Initial animation
setTimeout(() => {
    traitElement.classList.add('show');
    descriptionElement.classList.add('show');
}, 500);

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}`;
document.head.appendChild(shakeStyle);