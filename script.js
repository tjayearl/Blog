// --- STATE ---
const ADMIN_ACCOUNTS = [
    { user: "Tjay Earl", pass: "1884" },
    { user: "Ines Kibe", pass: "1454" }
];
let isAdminLoggedIn = false;
let articles = []; // This will hold all our blog posts
let currentlyEditingIndex = null; // To track which article is being edited
let selectedPlan = 'monthly'; // Default selected plan
let tickerText = 'This is a scrolling news ticker with the latest updates... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Another breaking story follows...';
let currentCategoryFilter = 'all'; // To track the current category filter

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const newsContainer = document.getElementById("news-container");
const notificationContainer = document.getElementById('notification-container');
const aboutSection = document.getElementById("about-section");
const contactForm = document.getElementById('contact-section');
const mainContentSections = [adminPanel, newsContainer.parentElement, aboutSection, contactForm];

// Buttons & Links
const loginBtn = document.getElementById("login-btn");
const addNewsBtn = document.getElementById("add-news");
const updateTickerBtn = document.getElementById('update-ticker-btn');
const subscribeBtn = document.querySelector('.subscribe-btn');
const signInBtn = document.getElementById('sign-in-btn');
const categoriesDropdown = document.getElementById('categories-dropdown');
const navLinks = document.querySelectorAll('nav .nav-link[data-target]');

// Header Elements
const dateTimeEl = document.getElementById('date-time');
const loginPanel = document.getElementById('login-panel');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const imageWidthSlider = document.getElementById('news-image-width');
const imageWidthValue = document.getElementById('image-width-value');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const paymentPlansContainer = document.querySelector('.payment-plans');
const declineSubscribeBtn = document.getElementById('decline-subscribe-btn');
const confirmSubscribeBtn = document.getElementById('confirm-subscribe-btn');

// --- FUNCTIONS ---

/**
 * Hides all main content sections.
 */
function hideAllMainContent() {
    mainContentSections.forEach(section => section.classList.add('hidden'));
}

/**
 * Shows the content for a given page target.
 * @param {string} target - The ID of the section to show, or 'home'.
 */
function showPage(target) {
    hideAllMainContent();

    if (target === 'home' || !target) { // Default to home
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
 * Updates the news ticker text in the DOM and restarts its animation.
 */
function updateTickerDOM() {
    const tickerContainer = document.querySelector('.ticker-content');
    const tickerTextElement = document.getElementById('ticker-text');

    if (tickerContainer && tickerTextElement) {
        // 1. Update the text content
        tickerTextElement.textContent = tickerText;

        // 2. Force a restart of the CSS animation on the container
        tickerContainer.style.animation = 'none';
        tickerContainer.offsetHeight; /* This triggers a DOM reflow, which is needed to restart the animation */
        tickerContainer.style.animation = null; /* This re-applies the animation from the stylesheet */
    }
}

/**
 * Saves the news ticker text to localStorage.
 */
function saveTickerToStorage() {
    localStorage.setItem('blogTickerText', tickerText);
}

/**
 * Loads the news ticker text from localStorage.
 */
function loadTickerFromStorage() {
    const storedTicker = localStorage.getItem('blogTickerText');
    if (storedTicker) {
        tickerText = storedTicker;
    }
}

/**
 * Handles the click event to update the news ticker.
 */
function handleUpdateTicker() {
    const tickerTextInput = document.getElementById('ticker-text-input');
    const newText = tickerTextInput.value.trim();
    if (newText) {
        tickerText = newText;
        saveTickerToStorage();
        updateTickerDOM();
        showNotification('News ticker updated successfully!');
    } else {
        showNotification('Ticker text cannot be empty.', 'error');
    }
}

/**
 * Renders the list of articles to the DOM.
 */
function displayArticles() {
    newsContainer.innerHTML = "";
    const filteredArticles = articles.filter(article =>
        currentCategoryFilter === 'all' || article.category === currentCategoryFilter
    );

  filteredArticles.forEach((article) => {
    const originalIndex = articles.indexOf(article);
    const articleEl = document.createElement("article");
    articleEl.dataset.index = originalIndex;

    if (currentlyEditingIndex === originalIndex) {
      // Render the article in EDIT mode
      const categories = ["Breaking News", "Local", "World", "Politics", "Business", "Tech", "Entertainment", "Sports", "Lifestyle"];
      const categoryOptions = categories.map(cat =>
        `<option value="${escapeHTML(cat)}" ${article.category === cat ? 'selected' : ''}>${escapeHTML(cat)}</option>`
      ).join('');

      const imageControlsHTML = `
        <h3 class="sub-heading">Image Options</h3>
        <input type="text" class="edit-image-url" value="${escapeHTML(article.imageUrl || '')}" placeholder="Image URL">
        <div class="image-controls">
            <div class="control-group">
                <label>Position</label>
                <select class="edit-image-position">
                    <option value="top" ${article.imagePosition === 'top' ? 'selected' : ''}>Top (Full Width)</option>
                    <option value="left" ${article.imagePosition === 'left' ? 'selected' : ''}>Float Left</option>
                    <option value="right" ${article.imagePosition === 'right' ? 'selected' : ''}>Float Right</option>
                </select>
            </div>
            <div class="control-group">
                <label>Width: <span class="edit-image-width-value">${article.imageWidth || 100}%</span></label>
                <input type="range" class="edit-image-width" min="25" max="100" value="${article.imageWidth || 100}">
            </div>
        </div>
      `;

      articleEl.innerHTML = `
        <div class="edit-form">
            <input type="text" class="edit-title" value="${escapeHTML(article.title)}">
            <select class="edit-category">${categoryOptions}</select>
            <textarea class="edit-content">${escapeHTML(article.content)}</textarea>
            ${imageControlsHTML}
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

      const categoryHTML = article.category ? `<div class="article-meta">Category: ${escapeHTML(article.category)}</div>` : '';

      articleEl.innerHTML = `
        ${adminButtonsHTML}
        ${categoryHTML}
        <h2>${escapeHTML(article.title)}</h2>
        <p>${escapeHTML(article.content).replace(/\n/g, '<br>')}</p>
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
            content: "This year has seen incredible leaps in AI and quantum computing. From next-generation processors to AI-driven medical diagnostics, the landscape of technology is evolving at an unprecedented pace.",
            category: "Tech",
            imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
            imagePosition: "top",
            imageWidth: 100
        }, {
            title: "Local Park Gets a Facelift",
            content: "The community-led initiative to renovate the downtown park is now complete, featuring new playgrounds, walking trails, and a beautiful garden that has the whole town buzzing. It's a testament to what we can achieve when we work together.",
            category: "Local",
            imageUrl: "https://images.unsplash.com/photo-1583324113626-46a4f54155b2?q=80&w=1932&auto=format&fit=crop",
            imagePosition: "left",
            imageWidth: 40
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
    const categoryInput = document.getElementById("news-category");
    const imageUrlInput = document.getElementById("news-image-url");
    const imagePositionInput = document.getElementById("news-image-position");
    const imageWidthInput = document.getElementById("news-image-width");

    if (titleInput.value && contentInput.value && categoryInput.value) {
        articles.unshift({
            title: titleInput.value,
            content: contentInput.value,
            category: categoryInput.value,
            imageUrl: imageUrlInput.value.trim(),
            imagePosition: imagePositionInput.value,
            imageWidth: imageWidthInput.value
        });
        saveArticlesToStorage();
        displayArticles();
        titleInput.value = "";
        contentInput.value = "";
        categoryInput.value = "";
        imageUrlInput.value = "";
        imagePositionInput.value = "top";
        imageWidthInput.value = 100;
        if (imageWidthValue) imageWidthValue.textContent = '100%'; // Reset label
        showNotification("Article added successfully!");
    } else {
        showNotification("Please fill in title, content, and category.", "error");
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
    const newCategory = articleEl.querySelector('.edit-category').value;

    if (newTitle && newContent) {
        articles[index] = { title: newTitle, content: newContent, category: newCategory };
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
        // Populate ticker input with current text
        const tickerTextInput = document.getElementById('ticker-text-input');
        if (tickerTextInput) {
            tickerTextInput.value = tickerText;
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

categoriesDropdown.addEventListener('click', (e) => {
    e.preventDefault();
    const link = e.target.closest('.category-link');
    if (!link) return;

    currentCategoryFilter = link.dataset.category;
    // Ensure the main news feed is visible to show the filtered articles
    showPage('home');
});

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
updateTickerBtn.addEventListener('click', handleUpdateTicker);

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
    loadTickerFromStorage();
    // Set default selected plan on init
    paymentPlansContainer.querySelector(`.plan-card[data-plan='${selectedPlan}']`).classList.add('selected');
    showPage('home'); // Show the home page by default
    updateTickerDOM();
}

init();
