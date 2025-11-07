// script.js
const apiUrl = window.location.origin + '/api';

// DOM Elements
const dateInput = document.getElementById('date-input');
const submitBtn = document.getElementById('submit-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');
const apiResponseElement = document.getElementById('api-response');
const responseUnix = document.getElementById('response-unix');
const responseUtc = document.getElementById('response-utc');
const requestHistoryElement = document.getElementById('request-history');
const footerStatus = document.getElementById('footer-status');
const uptimeElement = document.getElementById('uptime');
const requestsCountElement = document.getElementById('requests-count');

// States
let requestHistory = [];
let requestsCount = 0;
let startTime = new Date();
let currentTheme = 'dark';

// Theme definitions
const themes = {
    dark: {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#151520',
        '--bg-tertiary': '#1e1e2e',
        '--bg-card': '#252536',
        '--text-primary': '#e8e8f0',
        '--text-secondary': '#b8b8c8',
        '--text-dim': '#6c6c8a',
        '--border-primary': '#2a2a3a',
        '--border-active': '#4a4a6a',
        '--accent-primary': '#7e6ca8',
        '--accent-secondary': '#5d8bb0',
        '--accent-success': '#67c29c',
        '--accent-warning': '#d4b86a',
        '--accent-error': '#d46a6a',
        '--response-bg': '#1a1a2a'
    },
    blue: {
        '--bg-primary': '#0a0f1a',
        '--bg-secondary': '#151a2a',
        '--bg-tertiary': '#1e2436',
        '--bg-card': '#252b40',
        '--text-primary': '#e8f0f8',
        '--text-secondary': '#b8c8d8',
        '--text-dim': '#6c7a8a',
        '--border-primary': '#2a364a',
        '--border-active': '#4a5a6a',
        '--accent-primary': '#4a6ca8',
        '--accent-secondary': '#5d8bb0',
        '--accent-success': '#4a8c6a',
        '--accent-warning': '#a88c4a',
        '--accent-error': '#a84a4a',
        '--response-bg': '#1a2436'
    },
    green: {
        '--bg-primary': '#0a0f0a',
        '--bg-secondary': '#151a15',
        '--bg-tertiary': '#1e241e',
        '--bg-card': '#252b25',
        '--text-primary': '#e8f0e8',
        '--text-secondary': '#b8c8b8',
        '--text-dim': '#6c7a6c',
        '--border-primary': '#2a362a',
        '--border-active': '#4a5a4a',
        '--accent-primary': '#4a8c6a',
        '--accent-secondary': '#5dbb8b',
        '--accent-success': '#4a8c6a',
        '--accent-warning': '#8c8c4a',
        '--accent-error': '#8c4a4a',
        '--response-bg': '#1a241e'
    },
    purple: {
        '--bg-primary': '#0f0a1a',
        '--bg-secondary': '#1a152a',
        '--bg-tertiary': '#241e36',
        '--bg-card': '#2b2540',
        '--text-primary': '#f0e8f8',
        '--text-secondary': '#c8b8d8',
        '--text-dim': '#7a6c8a',
        '--border-primary': '#362a4a',
        '--border-active': '#5a4a6a',
        '--accent-primary': '#8c6ca8',
        '--accent-secondary': '#bb8bd0',
        '--accent-success': '#678ca8',
        '--accent-warning': '#d4b86a',
        '--accent-error': '#d46a6a',
        '--response-bg': '#1a1a2a'
    }
};

// Format Unix timestamp with commas
function formatUnixTimestamp(unix) {
    return unix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// API Functions
async function fetchTimestamp(dateString = '') {
    const endpoint = dateString ? `/api/${encodeURIComponent(dateString)}` : '/api';
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
}

function displayResponse(data) {
    if (data.error) {
        apiResponseElement.style.borderColor = 'var(--accent-error)';
        responseUnix.textContent = 'ERROR';
        responseUtc.textContent = data.error;
        responseUnix.style.color = 'var(--accent-error)';
        responseUtc.style.color = 'var(--accent-error)';
    } else {
        apiResponseElement.style.borderColor = 'var(--accent-success)';
        responseUnix.textContent = formatUnixTimestamp(data.unix);
        responseUtc.textContent = data.utc;
        responseUnix.style.color = 'var(--accent-success)';
        responseUtc.style.color = 'var(--accent-success)';
    }
    
    apiResponseElement.style.display = 'block';
}

function addToHistory(dateString, response) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    requestHistory.unshift({
        time: timeString,
        input: dateString || 'current',
        unix: response.unix || 'ERROR',
        utc: response.utc || response.error
    });
    
    // Keep only last 6 items (more compact)
    if (requestHistory.length > 6) {
        requestHistory.pop();
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    requestHistoryElement.innerHTML = '';
    requestHistory.forEach(item => {
        const historyItem = document.createElement('li');
        historyItem.className = 'history-item';
        
        const isError = item.unix === 'ERROR';
        const displayUnix = isError ? 'ERROR' : formatUnixTimestamp(item.unix);
        const unixColor = isError ? 'var(--accent-error)' : 'var(--text-primary)';
        
        historyItem.innerHTML = `
            <span class="history-time">${item.time}</span>
            <span class="history-input">${item.input}</span>
            <span class="history-unix" style="color: ${unixColor}">${displayUnix}</span>
        `;
        requestHistoryElement.appendChild(historyItem);
    });
}

function updateUptime() {
    const now = new Date();
    const diff = now - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    uptimeElement.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function copyToClipboard() {
    const text = `Unix: ${responseUnix.textContent}\nUTC: ${responseUtc.textContent}`;
    navigator.clipboard.writeText(text).then(() => {
        footerStatus.textContent = 'COPIED';
        footerStatus.style.color = 'var(--accent-success)';
        setTimeout(() => {
            footerStatus.textContent = 'READY';
            footerStatus.style.color = '';
        }, 1500);
    });
}

function toggleTheme() {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    currentTheme = themeNames[nextIndex];
    
    const theme = themes[currentTheme];
    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(key, theme[key]);
    });
    
    footerStatus.textContent = `THEME: ${currentTheme.toUpperCase()}`;
    setTimeout(() => {
        footerStatus.textContent = 'READY';
    }, 1500);
}

// Event Handlers
async function handleSubmit() {
    const dateString = dateInput.value.trim();
    
    if (!dateInput.value.trim()) {
        // If empty, show it's getting current time
        dateInput.placeholder = "Getting current time...";
    }
    
    footerStatus.textContent = 'FETCHING...';
    footerStatus.style.color = 'var(--accent-warning)';
    
    try {
        const data = await fetchTimestamp(dateString);
        displayResponse(data);
        addToHistory(dateString, data);
        
        requestsCount++;
        requestsCountElement.textContent = requestsCount;
        
        footerStatus.textContent = 'SUCCESS';
        footerStatus.style.color = 'var(--accent-success)';
    } catch (error) {
        footerStatus.textContent = 'NETWORK_ERROR';
        footerStatus.style.color = 'var(--accent-error)';
    }
    
    setTimeout(() => {
        footerStatus.textContent = 'READY';
        footerStatus.style.color = '';
        dateInput.placeholder = "e.g., 2015-12-25 or 1451001600000";
    }, 1500);
}

function handleClear() {
    dateInput.value = '';
    apiResponseElement.style.display = 'none';
    dateInput.focus();
    footerStatus.textContent = 'CLEARED';
    setTimeout(() => {
        footerStatus.textContent = 'READY';
    }, 1000);
}

function handleInputKeypress(e) {
    if (e.key === 'Enter') {
        handleSubmit();
    }
}

// Quick example buttons
function setupExampleButtons() {
    const examples = [
        { input: '2015-12-25', label: '2015-12-25' },
        { input: '1451001600000', label: '145,100,160,0000' },
        { input: '', label: 'Now' }
    ];
    
    const container = document.getElementById('example-buttons');
    examples.forEach(example => {
        const btn = document.createElement('button');
        btn.className = 'example-btn';
        btn.textContent = example.label;
        btn.addEventListener('click', () => {
            dateInput.value = example.input;
            handleSubmit();
        });
        container.appendChild(btn);
    });
}

// Initialize
function init() {
    // Set initial theme
    const theme = themes[currentTheme];
    Object.keys(theme).forEach(key => {
        document.documentElement.style.setProperty(key, theme[key]);
    });
    
    // Event listeners
    submitBtn.addEventListener('click', handleSubmit);
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', copyToClipboard);
    themeToggle.addEventListener('click', toggleTheme);
    dateInput.addEventListener('keypress', handleInputKeypress);
    
    // Focus input
    dateInput.focus();
    
    // Setup example buttons
    setupExampleButtons();
    
    // Initialize uptime counter
    updateUptime();
    setInterval(updateUptime, 1000);
    
    // Make initial request for current time
    setTimeout(async () => {
        const data = await fetchTimestamp();
        displayResponse(data);
        addToHistory('', data);
        requestsCount++;
        requestsCountElement.textContent = requestsCount;
    }, 500);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);