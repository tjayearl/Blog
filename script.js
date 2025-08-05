// --- STATE ---
const ADMIN_ACCOUNTS = [
    { user: "Tjay Earl", pass: "1884" },
    { user: "Ines Kibe", pass: "1454" }
];
let isAdminLoggedIn = false;
let articles = []; // This will hold all our blog posts

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const newsContainer = document.getElementById("news-container");
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
const declineSubscribeBtn = document.getElementById('decline-subscribe-btn');
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

        // Conditionally add the delete button only if the admin is logged in
        const deleteButtonHTML = isAdminLoggedIn ?
            `<button class="delete-btn" onclick="deleteArticle(${index})">Delete</button>` :
            "";

        articleEl.innerHTML = `
      ${deleteButtonHTML}
      <h2>${article.title}</h2>
      <p>${article.content}</p>
    `;
        newsContainer.appendChild(articleEl);
    });
}

/**
 * Deletes an article and re-renders the list.
 * @param {number} index - The index of the article to delete.
 */
function deleteArticle(index) {
    if (!isAdminLoggedIn) return; // Extra security check
    articles.splice(index, 1);
    displayArticles();
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
        displayArticles();
        titleInput.value = "";
        contentInput.value = "";
    } else {
        alert("Please fill in both title and content.");
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
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

/**
 * Handles the admin logout process.
 */
function handleLogout() {
    isAdminLoggedIn = false;
    updateAdminUI();
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

confirmSubscribeBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('subscribe-email');
    if (emailInput.value && emailInput.checkValidity()) {
        alert(`Thank you for subscribing with ${emailInput.value}!`);
        modalOverlay.classList.add('hidden');
        emailInput.value = '';
    } else {
        alert('Please enter a valid email address.');
    }
});

// --- INITIALIZATION ---

function init() {
    updateDateTime();
    // Add some dummy articles for demonstration
    articles = [{
        title: "Tech Advances in 2024",
        content: "This year has seen incredible leaps in AI and quantum computing..."
    }, {
        title: "Local Park Gets a Facelift",
        content: "The community-led initiative to renovate the downtown park is now complete..."
    }, ];
    showPage('home'); // Show the home page by default
}

init();
