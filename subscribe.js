// --- STATE ---
let selectedPlan = 'monthly'; // Default selected plan

// --- DOM ELEMENTS ---
const notificationContainer = document.getElementById('notification-container');
const paymentPlansContainer = document.querySelector('.payment-plans');
const confirmSubscribeBtn = document.getElementById('confirm-subscribe-btn');
const emailInput = document.getElementById('subscribe-email');

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

paymentPlansContainer.addEventListener('click', (e) => {
    const clickedPlan = e.target.closest('.plan-card');
    if (!clickedPlan) return;

    // Update state
    selectedPlan = clickedPlan.dataset.plan;

    // Update UI
    const allPlanCards = paymentPlansContainer.querySelectorAll('.plan-card');
    allPlanCards.forEach(card => card.classList.remove('selected'));
    clickedPlan.classList.add('selected');
});

confirmSubscribeBtn.addEventListener('click', () => {
    if (emailInput.value && emailInput.checkValidity()) {
        showNotification(`Thank you for subscribing with ${emailInput.value}!`);
        emailInput.value = '';
    } else {
        showNotification('Please enter a valid email address.', 'error');
    }
});

// --- INITIALIZATION ---
document.getElementById('copyright-year').textContent = new Date().getFullYear();
// Set default selected plan on init
paymentPlansContainer.querySelector(`.plan-card[data-plan='${selectedPlan}']`).classList.add('selected');