document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const notificationContainer = document.getElementById('notification-container');
    const signInLink = document.getElementById('sign-in-link');

    /**
     * Displays a temporary notification message.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' (default) or 'error'.
     */
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        // These styles are in the main style.css
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * Handles the user registration form submission.
     * @param {Event} e - The form submission event.
     */
    function handleRegistration(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // --- Validation ---
        if (!email || !password || !confirmPassword) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }

        // --- Simulate Backend Registration ---
        // NOTE: Storing passwords in localStorage is insecure and for simulation ONLY.
        // In a real application, this would be an API call to a secure backend.
        const users = JSON.parse(localStorage.getItem('blogUsers')) || [];

        if (users.some(user => user.email === email)) {
            showNotification('An account with this email already exists.', 'error');
            return;
        }

        // Add the new user
        users.push({ email, password });
        localStorage.setItem('blogUsers', JSON.stringify(users));

        showNotification('Registration successful! Redirecting to login...');

        // Redirect to the home page to log in after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    // --- EVENT LISTENERS ---
    registerForm.addEventListener('submit', handleRegistration);
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
});