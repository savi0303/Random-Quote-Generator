// Global state to prevent multiple fetch requests
let isFetching = false;
let favorites = [];

// Initialize - Load favorites from localStorage
function initFavorites() {
    const savedFavorites = localStorage.getItem('favoriteQuotes');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        renderFavorites();
    }
}

async function fetchQuote() {
    if (isFetching) return;
    
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const category = document.getElementById('category').value;
    const url = category 
        ? `https://api.quotable.io/random?tags=${category}` 
        : 'https://api.quotable.io/random';
    
    // Set loading state
    isFetching = true;
    quoteText.innerHTML = '<div class="loader"></div>';
    quoteAuthor.textContent = '';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch quote');
        const data = await response.json();
        
        // Add animation class
        quoteText.classList.add('quote-fade-in');
        quoteAuthor.classList.add('quote-fade-in');
        
        quoteText.textContent = `"${data.content}"`;
        quoteAuthor.textContent = `— ${data.author || 'Unknown'}`;
        
        const shareText = encodeURIComponent(`"${data.content}" — ${data.author}`);
        const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
        document.getElementById('share-button').href = shareUrl;
        
        // Reset like button state
        const likeButton = document.getElementById('like-button');
        likeButton.classList.remove('active');
        
        // Check if quote is in favorites
        const isLiked = favorites.some(q => 
            q.text === data.content && q.author === (data.author || 'Unknown'));
        if (isLiked) {
            likeButton.classList.add('active');
        }
        
        // Store current quote in session storage
        sessionStorage.setItem('currentQuote', JSON.stringify({
            text: data.content,
            author: data.author || 'Unknown'
        }));
        
        // Remove animation class after animation completes
        setTimeout(() => {
            quoteText.classList.remove('quote-fade-in');
            quoteAuthor.classList.remove('quote-fade-in');
        }, 500);
    } catch (error) {
        quoteText.textContent = 'Oops! Something went wrong.';
        quoteAuthor.textContent = '— Please try again';
        console.error(error);
    } finally {
        isFetching = false;
    }
}

function toggleFavorite() {
    const quoteText = document.getElementById('quote-text').textContent.replace(/^"|"$/g, '');
    const quoteAuthor = document.getElementById('quote-author').textContent.replace(/^— /, '');
    const likeButton = document.getElementById('like-button');
    
    const quote = {
        text: quoteText,
        author: quoteAuthor
    };
    
    // Check if quote is already in favorites
    const index = favorites.findIndex(q => q.text === quote.text && q.author === quote.author);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(quote);
        likeButton.classList.add('active');
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        likeButton.classList.remove('active');
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
    
    // Update the favorites display
    renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favorites-container');
    
    if (favorites.length === 0) {
        container.innerHTML = '<p class="no-favorites">Your favorite quotes will appear here</p>';
        return;
    }
    
    container.innerHTML = '';
    favorites.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'favorite-quote';
        quoteElement.innerHTML = `
            <p>"${quote.text}"</p>
            <p>— ${quote.author}</p>
            <button class="remove-favorite" data-index="${index}" aria-label="Remove from favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        container.appendChild(quoteElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.remove-favorite').dataset.index);
            favorites.splice(index, 1);
            localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
            renderFavorites();
        });
    });
}

function copyQuote() {
    const quoteText = document.getElementById('quote-text').textContent;
    const quoteAuthor = document.getElementById('quote-author').textContent;
    const fullQuote = `${quoteText} ${quoteAuthor}`;
    
    navigator.clipboard.writeText(fullQuote)
        .then(() => {
            const copyBtn = document.getElementById('copy-button');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
}

// Check if there's a previously fetched quote in session storage
function restorePreviousQuote() {
    const savedQuote = sessionStorage.getItem('currentQuote');
    if (savedQuote) {
        const { text, author } = JSON.parse(savedQuote);
        document.getElementById('quote-text').textContent = `"${text}"`;
        document.getElementById('quote-author').textContent = `— ${author}`;
        
        const shareText = encodeURIComponent(`"${text}" — ${author}`);
        const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
        document.getElementById('share-button').href = shareUrl;
    } else {
        fetchQuote();
    }
}

// Add keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press 'n' for new quote
        if (e.key === 'n' && !e.ctrlKey && !e.altKey) {
            fetchQuote();
        }
        
        // Press 'c' to copy quote
        if (e.key === 'c' && !e.ctrlKey && !e.altKey) {
            copyQuote();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFavorites();
    restorePreviousQuote();
    setupKeyboardShortcuts();
    
    // Add event listeners
    document.getElementById('copy-button').addEventListener('click', copyQuote);
    document.getElementById('like-button').addEventListener('click', toggleFavorite);
});