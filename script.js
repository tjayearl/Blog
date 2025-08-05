// --- STATE ---
const ADMIN_ACCOUNTS = [
    { user: "Tjay Earl", pass: "1884" },
    { user: "Ines Kibe", pass: "1454" }
];
let isAdminLoggedIn = false;
let articles = []; // This will hold all our blog posts
let currentlyEditingIndex = null; // To track which article is being edited
let selectedPlan = 'monthly'; // Default selected plan

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const newsContainer = document.getElementById("news-container");
const notificationContainer = document.getElementById('notification-container');
const aboutSection = document.getElementById("about-section");
const contactSection = document.getElementById("contact-section");
const mainPages = [newsContainer, aboutSection, contactSection];

// Buttons & Links
const loginBtn = document.getElementById("login-btn");
const addNewsBtn = document.getElementById("add-news");
const subscribeBtn = document.querySelector('.subscribe-btn');
const signInBtn = document.getElementById('sign-in-btn');
const navLinks = document.querySelectorAll('nav .nav-link[data-target]');

// Header Elements
const dateTimeEl = document.getElementById('date-time');
const loginPanel = document.getElementById('login-panel');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const paymentPlansContainer = document.querySelector('.payment-plans');
const declineSubscribeBtn = document.getElementById('decline-subscribe-btn');
const contactForm = document.querySelector('#contact-section');
const confirmSubscribeBtn = document.getElementById('confirm-subscribe-btn');

// --- FUNCTIONS ---

/**
 * Hides all main pages.
 */
function hideAllPages() {
    mainPages.forEach(page => page.classList.add('hidden'));
}

/**
 * Shows the content for a given page target.
 * @param {string} target - The ID of the section to show, or 'home'.
 */
function showPage(target) {
    hideAllPages();

    if (target === 'home') {
        newsContainer.classList.remove('hidden');
    } else {
        const sectionToShow = document.getElementById(target);
        if (sectionToShow) {
            sectionToShow.classList.remove('hidden');
        }
    }
    // Ensure admin UI is correctly shown/hidden for the new page
    updateAdminUI();
}

/**
 * Updates the date and time in the top bar.
 */
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Renders the list of articles to the DOM.
 */
function displayArticles() {
  newsContainer.innerHTML = "";
  articles.forEach((article, index) => {
    const articleEl = document.createElement("article");
    articleEl.dataset.index = index;

    if (currentlyEditingIndex === index) {
      // Render the article in EDIT mode
      articleEl.innerHTML = `
        <div class="edit-form">
            <input type="text" class="edit-title" value="${escapeHTML(article.title)}">
            <textarea class="edit-content">${escapeHTML(article.content)}</textarea>
            <div class="edit-form-actions">
                <button class="save-btn">Save Changes</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        </div>
      `;
    } else {
      // Render the article in DISPLAY mode
      const adminButtonsHTML = isAdminLoggedIn ?
        `<div class="article-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
         </div>` :
        "";

      articleEl.innerHTML = `
        ${adminButtonsHTML}
        <h2>${escapeHTML(article.title)}</h2>
        <p>${escapeHTML(article.content)}</p>
      `;
    }
    newsContainer.appendChild(articleEl);
  });
}

/**
 * Saves articles to localStorage.
 */
function saveArticlesToStorage() {
    localStorage.setItem('blogArticles', JSON.stringify(articles));
}

/**
 * Loads articles from localStorage.
 */
function loadArticlesFromStorage() {
    const storedArticles = localStorage.getItem('blogArticles');
    if (storedArticles) {
        articles = JSON.parse(storedArticles);
    } else {
        // Add some dummy articles if storage is empty
        articles = [{
            title: "Tech Advances in 2024",
            content: "This year has seen incredible leaps in AI and quantum computing..."
        }, {
            title: "Local Park Gets a Facelift",
            content: "The community-led initiative to renovate the downtown park is now complete..."
        }, ];
    }
}

/**
 * Deletes an article and re-renders the list.
 * @param {number} index - The index of the article to delete.
 */
function deleteArticle(index) {
    if (!isAdminLoggedIn) return; // Extra security check
    if (confirm('Are you sure you want to delete this article?')) {
        articles.splice(index, 1);
        saveArticlesToStorage();
        displayArticles();
    }
}

/**
 * Adds a new article to the list.
 */
function addArticle() {
    const titleInput = document.getElementById("news-title");
    const contentInput = document.getElementById("news-content");

    if (titleInput.value && contentInput.value) {
        articles.unshift({
            title: titleInput.value,
            content: contentInput.value
        });
        saveArticlesToStorage();
        displayArticles();
        titleInput.value = "";
        contentInput.value = "";
        showNotification("Article added successfully!");
    } else {
        showNotification("Please fill in both title and content.", "error");
    }
}

/**
 * Puts a specific article into edit mode.
 * @param {number} index - The index of the article to edit.
 */
function enterEditMode(index) {
    currentlyEditingIndex = index;
    displayArticles();
}

/**
 * Exits edit mode and reverts any unsaved changes.
 */
function exitEditMode() {
    currentlyEditingIndex = null;
    displayArticles();
}

/**
 * Saves the updated content of an article.
 * @param {number} index - The index of the article to save.
 */
function saveArticle(index) {
    const articleEl = document.querySelector(`article[data-index='${index}']`);
    const newTitle = articleEl.querySelector('.edit-title').value;
    const newContent = articleEl.querySelector('.edit-content').value;

    if (newTitle && newContent) {
        articles[index] = { title: newTitle, content: newContent };
        saveArticlesToStorage();
        exitEditMode(); // This will save and re-render the articles list
        showNotification("Article updated successfully!");
    } else {
        showNotification('Title and content cannot be empty.', 'error');
    }
}

/**
 * Updates all UI elements based on the admin's login status.
 */
function updateAdminUI() {
    if (isAdminLoggedIn) {
        signInBtn.textContent = 'Logout';
        // Show admin panel only if on the home page
        if (!newsContainer.classList.contains('hidden')) {
            adminPanel.classList.remove('hidden');
        } else {
            adminPanel.classList.add('hidden');
        }
    } else {
        signInBtn.textContent = 'Sign In / Register';
        exitEditMode(); // Ensure we exit edit mode on logout
        adminPanel.classList.add('hidden');
    }
    // Re-render articles to show/hide delete buttons
    displayArticles();
}

/**
 * Handles the admin login process.
 */
function handleLogin() {
    const user = usernameInput.value;
    const pass = passwordInput.value;
    const isAdmin = ADMIN_ACCOUNTS.some(account => account.user === user && account.pass === pass);

    if (isAdmin) {
        isAdminLoggedIn = true;
        loginPanel.classList.add('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        updateAdminUI();
        showNotification(`Welcome, ${user}!`);
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
    }
}

/**
 * Handles the admin logout process.
 */
function handleLogout() {
    isAdminLoggedIn = false;
    updateAdminUI();
}

/**
 * Displays a temporary notification message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' (default) or 'error'.
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
// --- EVENT LISTENERS ---

signInBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the document click listener from firing immediately
    if (isAdminLoggedIn) {
        handleLogout();
    } else {
        loginPanel.classList.toggle('hidden');
    }
});

loginBtn.addEventListener('click', handleLogin);
addNewsBtn.addEventListener('click', addArticle);

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(link.dataset.target);
    });
});

newsContainer.addEventListener('click', (e) => {
    const articleEl = e.target.closest('article');
    if (!articleEl) return;
    const index = parseInt(articleEl.dataset.index, 10);

    if (e.target.matches('.delete-btn')) {
        deleteArticle(index);
    } else if (e.target.matches('.edit-btn')) {
        enterEditMode(index);
    } else if (e.target.matches('.save-btn')) {
        saveArticle(index);
    } else if (e.target.matches('.cancel-btn')) {
        exitEditMode();
    }
});
// Close login panel if clicking anywhere else on the page
document.addEventListener('click', (e) => {
    if (!loginPanel.contains(e.target) && e.target !== signInBtn) {
        loginPanel.classList.add('hidden');
    }
});

subscribeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

declineSubscribeBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

// Close modal if clicking on the overlay itself
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
});

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
    const emailInput = document.getElementById('subscribe-email');
    if (emailInput.value && emailInput.checkValidity()) {
        showNotification(`Thank you for subscribing with ${emailInput.value}!`);
        modalOverlay.classList.add('hidden');
        emailInput.value = '';
    } else {
        showNotification('Please enter a valid email address.', 'error');
    }
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent actual form submission
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    if (nameInput.value && emailInput.value && emailInput.checkValidity() && messageInput.value) {
        showNotification("Thank you for your message! We'll be in touch.");
        contactForm.reset();
    } else {
        showNotification("Please fill out all fields with a valid email.", "error");
    }
});

// --- INITIALIZATION ---

function init() {
    updateDateTime();
    loadArticlesFromStorage();
    // Set default selected plan on init
    paymentPlansContainer.querySelector(`.plan-card[data-plan='${selectedPlan}']`).classList.add('selected');
    showPage('home'); // Show the home page by default
}

init();
