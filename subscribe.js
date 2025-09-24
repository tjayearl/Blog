// --- STATE ---
// No state needed for this simple form anymore.

// --- DOM ELEMENTS ---
const notificationContainer = document.getElementById('notification-container');
const subscribeForm = document.getElementById('subscribe-form');
const emailInput = document.getElementById('subscribe-email');
const nameInput = document.getElementById('subscribe-name');
const subscribeContent = document.getElementById('subscribe-content');
const thankYouMessage = document.getElementById('thank-you-message');

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

// --- EVENT LISTENERS ---

subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = emailInput.value.trim();
    const name = nameInput.value.trim();

    if (email && emailInput.checkValidity()) {
        // In a real app, you would send this to a server.
        // For now, we'll just show the thank you message on the page.
        subscribeContent.classList.add('hidden');
        thankYouMessage.classList.remove('hidden');

        emailInput.value = '';
        nameInput.value = '';
    } else {
        showNotification('Please enter a valid email address.', 'error');
    }
});

// --- INITIALIZATION ---
document.getElementById('copyright-year').textContent = new Date().getFullYear();