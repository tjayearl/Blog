// --- STATE ---
const ADMIN_USER = "Tjay Earl";
const ADMIN_PASS = "1884";
let articles = [];
let isAdminLoggedIn = false;

// --- DOM ELEMENTS ---
// Sections
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const newsContainer = document.getElementById("news-container");
const aboutSection = document.getElementById("about-section");
const contactSection = document.getElementById("contact-section");
const allContentSections = [loginSection, adminPanel, newsContainer, aboutSection, contactSection];

// Buttons & Links
const loginBtn = document.getElementById("login-btn");
const addNewsBtn = document.getElementById("add-news");
const signInBtn = document.getElementById('sign-in-btn');
const navLinks = document.querySelectorAll('nav .nav-link[data-target]');

// Other
const dateTimeEl = document.getElementById('date-time');

// --- FUNCTIONS ---

/**
 * Hides all main content sections.
 */
function hideAllSections() {
    allContentSections.forEach(section => section.classList.add('hidden'));
}

/**
 * Shows the content for a given page target.
 * @param {string} target - The ID of the section to show, or 'home'.
 */
function showPage(target) {
    hideAllSections();

    if (target === 'home') {
        newsContainer.classList.remove('hidden');
        if (isAdminLoggedIn) {
            adminPanel.classList.remove('hidden');
        }
    } else {
        const sectionToShow = document.getElementById(target);
        if (sectionToShow) {
            sectionToShow.classList.remove('hidden');
        }
    }
}

/**
 * Updates the date and time in the top bar.
 */
function updateDateTime() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Renders the list of articles to the DOM.
 */
function displayArticles() {
function deleteArticle(index) {
  articles.splice(index, 1);
  displayArticles();
}
