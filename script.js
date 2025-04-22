async function fetchQuote() {
    const category = document.getElementById('category').value;
    const url = category 
        ? `https://api.quotable.io/random?tags=${category}` 
        : 'https://api.quotable.io/random';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch quote');
        const data = await response.json();
        
        document.getElementById('quote-text').textContent = `"${data.content}"`;
        document.getElementById('quote-author').textContent = `— ${data.author || 'Unknown'}`;
        
        const shareText = encodeURIComponent(`"${data.content}" — ${data.author}`);
        const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
        document.getElementById('share-button').href = shareUrl;
    } catch (error) {
        document.getElementById('quote-text').textContent = 'Oops! Something went wrong.';
        document.getElementById('quote-author').textContent = '— Unknown';
        console.error(error);
    }
}

// Fetch a quote when the page loads
document.addEventListener('DOMContentLoaded', fetchQuote);