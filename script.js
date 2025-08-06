// --- STATE ---
const API_URL = 'http://localhost:5000/api'; // Your backend API URL

let isAdminLoggedIn = false;
let articles = []; // This will hold all our blog posts
let currentlyEditingIndex = null; // To track which article is being edited
let selectedPlan = 'monthly'; // Default selected plan
let tickerText = 'This is a scrolling news ticker with the latest updates... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Another breaking story follows...';
let currentCategoryFilter = 'home'; // To track the current category filter. 'home' is a special filter.

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const newsContainer = document.getElementById("news-container");
const notificationContainer = document.getElementById('notification-container');
const aboutSection = document.getElementById("about-section");
const contactForm = document.getElementById('contact-section');
const opinionsSection = document.getElementById('opinions-section');
const mainContentSections = [adminPanel, newsContainer, aboutSection, contactForm, opinionsSection];

// Buttons & Links
const loginBtn = document.getElementById("login-btn");
const addNewsBtn = document.getElementById("add-news");
const updateTickerBtn = document.getElementById('update-ticker-btn');
const subscribeBtn = document.querySelector('.subscribe-btn');
const signInBtn = document.getElementById('sign-in-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNav = document.getElementById('main-nav');
const categoriesDropdown = document.getElementById('categories-dropdown');
const submitOpinionBtn = document.getElementById('submit-opinion-btn');
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
const footerNewsletterForm = document.getElementById('footer-newsletter-form');

// --- FUNCTIONS ---

/**
 * Gets the stored JWT from localStorage.
 * @returns {string|null} The token or null if not found.
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Returns the authorization headers for API requests.
 * @returns {HeadersInit} The headers object.
 */
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
}

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
    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const timeString = now.toLocaleTimeString('en-US'); // e.g., 10:30:55 PM
    dateTimeEl.textContent = `${now.toLocaleDateString('en-US', dateOptions)} | ${timeString}`;
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
function displayArticles() { // This function now only renders the state, it doesn't fetch it.
    newsContainer.innerHTML = "";
    let filteredArticles;

    if (currentCategoryFilter === 'home') {
        filteredArticles = articles.filter(article => article.showOnHome);
        if (filteredArticles.length === 0) {
            newsContainer.innerHTML = '<p class="empty-message">No articles have been featured on the home page yet.</p>';
            return;
        }
    } else {
        filteredArticles = articles.filter(article =>
            currentCategoryFilter === 'all' || article.category === currentCategoryFilter
        );
        if (filteredArticles.length === 0) {
            newsContainer.innerHTML = `<p class="empty-message">No articles found in this category.</p>`;
            return;
        }
    }

  filteredArticles.forEach((article) => {
    const originalIndex = articles.indexOf(article);
    const articleEl = document.createElement("article"); // Each article element gets its array index as a dataset attribute
    articleEl.dataset.index = originalIndex;

    if (currentlyEditingIndex === originalIndex) {
      // Render the article in EDIT mode
      const categories = ["Breaking News", "Local", "World", "Politics", "Business", "Tech", "Entertainment", "Sports", "Lifestyle"];
      const categoryOptions = categories.map(cat =>
        `<option value="${escapeHTML(cat)}" ${article.category === cat ? 'selected' : ''}>${escapeHTML(cat)}</option>`
      ).join('');

      const homeCheckboxHTML = `
        <div class="form-option">
            <input type="checkbox" id="edit-show-on-home-${originalIndex}" class="edit-show-on-home" ${article.showOnHome ? 'checked' : ''}>
            <label for="edit-show-on-home-${originalIndex}">Feature on Home Page</label>
        </div>
      `;

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
            ${homeCheckboxHTML}
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

      const imageHTML = article.imageUrl ?
        `<div class="article-image-container pos-${escapeHTML(article.imagePosition)}" style="width: ${escapeHTML(article.imageWidth || 100)}%;">
            <img src="${escapeHTML(article.imageUrl)}" alt="${escapeHTML(article.title)}" class="article-image">
         </div>` :
        "";

      articleEl.innerHTML = `
        ${adminButtonsHTML}
        ${imageHTML}
        ${categoryHTML}
        <h2>${escapeHTML(article.title)}</h2>
        <p>${escapeHTML(article.content).replace(/\n/g, '<br>')}</p>
      `;
    }
    newsContainer.appendChild(articleEl);
  });
}

/**
 * Fetches all articles from the backend API.
 */
async function fetchArticles() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch articles.');
        articles = await response.json();
        displayArticles();
    } catch (error) {
        console.error(error);
        showNotification('Could not load articles from the server.', 'error');
    }
}

/**
 * Deletes an article and re-renders the list.
 * @param {number} index - The index of the article to delete.
 */
async function deleteArticle(index) {
    if (!isAdminLoggedIn) return; // Extra security check
    const articleId = articles[index]._id;
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            const response = await fetch(`${API_URL}/posts/${articleId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete article.');
            showNotification('Article deleted successfully!');
            await fetchArticles(); // Refetch all articles to ensure consistency
        } catch (error) {
            console.error(error);
            showNotification('Could not delete article.', 'error');
        }
    }
}

/**
 * Adds a new article to the list.
 */
async function addArticle() {
    const titleInput = document.getElementById("news-title");
    const contentInput = document.getElementById("news-content");
    const categoryInput = document.getElementById("news-category");
    const imageUrlInput = document.getElementById("news-image-url");
    const imagePositionInput = document.getElementById("news-image-position");
    const imageWidthInput = document.getElementById("news-image-width");
    const showOnHomeInput = document.getElementById("news-show-on-home");

    if (titleInput.value && contentInput.value && categoryInput.value) {
        const newArticleCategory = categoryInput.value;
        const newArticle = {
            title: titleInput.value,
            content: contentInput.value,
            category: newArticleCategory,
            imageUrl: imageUrlInput.value.trim(),
            imagePosition: imagePositionInput.value,
            imageWidth: imageWidthInput.value,
            showOnHome: showOnHomeInput.checked
        };

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newArticle)
            });
            if (!response.ok) throw new Error('Failed to create article.');

            // Reset form
            titleInput.value = "";
            contentInput.value = "";
            categoryInput.value = "";
            imageUrlInput.value = "";
            imagePositionInput.value = "top";
            imageWidthInput.value = 100;
            showOnHomeInput.checked = false;
            if (imageWidthValue) imageWidthValue.textContent = '100%';

            showNotification("Article added successfully!");
            currentCategoryFilter = newArticleCategory; // Switch view to the new article's category
            await fetchArticles(); // Refetch to get the new list with the new article
        } catch (error) {
            console.error(error);
            showNotification('Could not create article.', 'error');
        }
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
async function saveArticle(index) {
    const articleEl = document.querySelector(`article[data-index='${index}']`);
    const articleId = articles[index]._id;

    const newTitle = articleEl.querySelector('.edit-title').value;
    const newContent = articleEl.querySelector('.edit-content').value;
    const newCategory = articleEl.querySelector('.edit-category').value;
    const newImageUrl = articleEl.querySelector('.edit-image-url').value;
    const newImagePosition = articleEl.querySelector('.edit-image-position').value;
    const newImageWidth = articleEl.querySelector('.edit-image-width').value;
    const newShowOnHome = articleEl.querySelector('.edit-show-on-home').checked;

    if (newTitle && newContent) {
        const updatedArticle = {
            title: newTitle,
            content: newContent,
            category: newCategory,
            imageUrl: newImageUrl.trim(),
            imagePosition: newImagePosition,
            imageWidth: newImageWidth,
            showOnHome: newShowOnHome
        };
        try {
            const response = await fetch(`${API_URL}/posts/${articleId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedArticle)
            });
            if (!response.ok) throw new Error('Failed to update article.');
            showNotification("Article updated successfully!");
            await fetchArticles(); // Refetch to get updated list
        } catch (error) {
            console.error(error);
            showNotification('Could not update article.', 'error');
        }
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
async function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed.');

        localStorage.setItem('authToken', data.token);
        isAdminLoggedIn = true;
        loginPanel.classList.add('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        updateAdminUI();
        showNotification(`Welcome, ${username}!`);
    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

/**
 * Handles the admin logout process.
 */
function handleLogout() {
    localStorage.removeItem('authToken');
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

/**
 * Resets the opinion section to its initial state.
 */
function resetOpinionsSection() {
    const websiteRatingStars = document.getElementById('website-rating-stars');
    const deliveryRatingStars = document.getElementById('delivery-rating-stars');

    if (websiteRatingStars) websiteRatingStars.dataset.rating = 0;
    if (deliveryRatingStars) deliveryRatingStars.dataset.rating = 0;

    document.getElementById('opinion-comments').value = '';
    document.querySelectorAll('.stars i').forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
    });
}

/**
 * Handles the hover effect over the rating stars.
 * @param {MouseEvent} e - The mouse event.
 */
function handleStarHover(e) {
    if (!e.target.matches('.fa-star')) return;
    const stars = Array.from(e.currentTarget.children);
    const hoverIndex = stars.indexOf(e.target);
    stars.forEach((star, index) => {
        star.classList.toggle('fas', index <= hoverIndex);
        star.classList.toggle('far', index > hoverIndex);
    });
}

/**
 * Handles when the mouse leaves the star container.
 * @param {MouseEvent} e - The mouse event.
 */
function handleStarMouseOut(e) {
    const stars = Array.from(e.currentTarget.children);
    const currentRating = parseInt(e.currentTarget.dataset.rating || '0', 10);
    stars.forEach((star, index) => {
        star.classList.toggle('fas', index < currentRating);
        star.classList.toggle('far', index >= currentRating);
    });
}

/**
 * Handles clicking on a star to set the rating.
 * @param {MouseEvent} e - The mouse event.
 */
function handleStarClick(e) {
    if (!e.target.matches('.fa-star')) return;
    const starContainer = e.currentTarget;
    const stars = Array.from(starContainer.children);
    const clickedIndex = stars.indexOf(e.target);
    starContainer.dataset.rating = clickedIndex + 1;
}

/**
 * Handles submitting the user's opinion.
 */
function handleSubmitOpinion() {
    const websiteRating = document.getElementById('website-rating-stars').dataset.rating || 0;
    const deliveryRating = document.getElementById('delivery-rating-stars').dataset.rating || 0;
    const comments = document.getElementById('opinion-comments').value;

    if (websiteRating > 0 && deliveryRating > 0) {
        // In a real app, you'd send this data to a server.
        // For now, we'll just show a notification.
        console.log({
            websiteRating,
            deliveryRating,
            comments
        });
        showNotification("Thank you for your valuable feedback!");
        resetOpinionsSection();
    } else {
        showNotification("Please provide a rating for both categories.", "error");
    }
}

function escapeHTML(str) {
    // Coerce to string to prevent errors on non-string types (like numbers) and handle null/undefined
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
submitOpinionBtn.addEventListener('click', handleSubmitOpinion);

hamburgerMenu.addEventListener('click', () => {
    mainNav.classList.toggle('nav-active');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(link.dataset.target);
        // Close hamburger menu on link click
        if (mainNav.classList.contains('nav-active')) {
            mainNav.classList.remove('nav-active');
        }
    });
});

mainNav.addEventListener('click', (e) => {
    // Handle mobile dropdown clicks for touch devices
    if (window.getComputedStyle(hamburgerMenu).display !== 'block') {
        return; // Not in mobile view, let CSS hover handle it
    }

    const dropdownLink = e.target.closest('.dropdown > .nav-link');
    if (dropdownLink) {
        e.preventDefault();
        const dropdown = dropdownLink.parentElement;
        dropdown.classList.toggle('active');
    }
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

newsContainer.addEventListener('input', (e) => {
    // Delegate listener for width sliders in edit forms
    if (e.target.matches('.edit-image-width')) {
        const valueSpan = e.target.parentElement.querySelector('.edit-image-width-value');
        if (valueSpan) {
            valueSpan.textContent = `${e.target.value}%`;
        }
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

footerNewsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('footer-email');
    if (emailInput.value && emailInput.checkValidity()) {
        // This could also trigger the main subscription modal
        // For now, it just shows a notification.
        showNotification(`Thank you for subscribing with ${emailInput.value}!`);
        emailInput.value = '';
    } else {
        showNotification('Please enter a valid email address.', 'error');
    }
});

if (imageWidthSlider && imageWidthValue) {
    imageWidthSlider.addEventListener('input', () => {
        imageWidthValue.textContent = `${imageWidthSlider.value}%`;
    });
}

const starRatingContainers = document.querySelectorAll('.stars');
starRatingContainers.forEach(container => {
    container.addEventListener('mouseover', handleStarHover);
    container.addEventListener('mouseout', handleStarMouseOut);
    container.addEventListener('click', handleStarClick);
});

// --- INITIALIZATION ---

function init() {
    const token = getAuthToken();
    if (token) {
        // A more robust solution would verify the token with the backend here
        isAdminLoggedIn = true;
    }

    updateDateTime(); // Call once to avoid delay
    setInterval(updateDateTime, 1000); // Update every second

    fetchArticles(); // Fetch articles from API instead of localStorage
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    loadTickerFromStorage();
    // Set default selected plan on init
    paymentPlansContainer.querySelector(`.plan-card[data-plan='${selectedPlan}']`).classList.add('selected');
    updateAdminUI(); // Set initial UI based on login state
    updateTickerDOM();
}

init();
