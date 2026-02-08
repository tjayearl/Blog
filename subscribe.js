// --- STATE ---
// No state needed for this simple form anymore.

// --- DOM ELEMENTS ---
const notificationContainer = document.getElementById('notification-container');
const subscribeForm = document.getElementById('subscribe-form');
const emailInput = document.getElementById('subscribe-email');
const subscribeBtn = document.getElementById('confirm-subscribe-btn');

// --- FUNCTIONS ---

/**
 * Displays a temporary notification message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' (default) or 'error'.
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    // These styles are in the main style.css, so they are available here
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.textContent = message;

    // The notification container on this page is inside the main content
    // so we adjust its position to be relative to the viewport
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '90px';
    notificationContainer.style.right = '2rem';
    notificationContainer.style.zIndex = '2000';

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

/**
 * Displays an inline message below the form.
 * @param {string} message - The message text.
 * @param {string} type - 'success' or 'error'.
 */
function showInlineMessage(message, type) {
    let msgEl = document.querySelector('.subscribe-message');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.className = 'subscribe-message';
        subscribeForm.appendChild(msgEl);
    }
    
    msgEl.textContent = message;
    msgEl.style.color = type === 'error' ? '#e06c75' : '#28a745'; // Red or Green
    msgEl.style.opacity = '1';
}

// --- EVENT LISTENERS ---

subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = emailInput.value.trim();
    
    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        showInlineMessage('❌ Please enter a valid email address.', 'error');
        // Shake animation for input
        emailInput.style.borderColor = '#e06c75';
        setTimeout(() => emailInput.style.borderColor = '', 500);
        return;
    }

    if (email) {
        // Save subscriber email to localStorage
        let subscribers = JSON.parse(localStorage.getItem('blogSubscribers')) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('blogSubscribers', JSON.stringify(subscribers));
        }

        // Success State
        showInlineMessage('✅ Thanks for subscribing! You’ll receive updates soon.', 'success');
        
        // Update Button
        subscribeBtn.textContent = 'Subscribed ✓';
        subscribeBtn.disabled = true;
        
        // Clear Input
        emailInput.value = '';
        emailInput.blur();

        // Optional: Reset after a delay if you want to allow another subscription
        // setTimeout(() => { ... }, 5000);
    }
});

// --- INITIALIZATION ---
document.getElementById('copyright-year').textContent = new Date().getFullYear();