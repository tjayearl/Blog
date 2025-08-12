// --- STATE ---
const API_URL = 'http://localhost:5000/api'; // Your backend API URL

let isAdminLoggedIn = false;
let isUserLoggedIn = false; // Track regular user login status
let loggedInUserEmail = null; // Store logged-in user's email
const ADMIN_EMAIL = 'admin@clearview.news'; // Hardcoded admin email for simulation
const ADMIN_PASSWORD = 'password123'; // Hardcoded admin password for simulation

let multimediaItems = [];
let articles = []; // This will hold all our blog posts
let currentlyEditingIndex = null; // To track which article is being edited
let selectedPlan = 'monthly'; // Default selected plan
let tickerText = 'This is a scrolling news ticker with the latest updates... Lorem ipsum dolor sit amet, consectetur adipiscing elit... Another breaking story follows...';
let currentCategoryFilter = 'all'; // To track the current category filter. 'all' shows everything.

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const homeContentWrapper = document.getElementById('home-content-wrapper');
const newsContainer = document.getElementById("news-container");
const notificationContainer = document.getElementById('notification-container');
const latestNewsGrid = document.getElementById('latest-news-grid');
const featuredStorySection = document.getElementById('featured-story-section');
const aboutSection = document.getElementById("about-section");
const contactForm = document.getElementById('contact-section');
const sidebar = document.getElementById('sidebar');
const opinionsSection = document.getElementById('opinions-section');
const multimediaSection = document.getElementById('multimedia-section');
const mainContentSections = [adminPanel, homeContentWrapper, aboutSection, contactForm, opinionsSection, multimediaSection];

// Buttons & Links
const loginBtn = document.getElementById("login-btn");
const addNewsBtn = document.getElementById("add-news");
const updateTickerBtn = document.getElementById('update-ticker-btn');
const addMultimediaBtn = document.getElementById('add-multimedia-btn');
const signInBtn = document.getElementById('sign-in-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const mainNav = document.getElementById('main-nav');
const heroReadMoreBtn = document.getElementById('hero-read-more');
const categoriesDropdown = document.getElementById('categories-dropdown');
const submitOpinionBtn = document.getElementById('submit-opinion-btn');
const navLinks = document.querySelectorAll('nav .nav-link[data-target]');

// Header Elements
const dateTimeEl = document.getElementById('date-time');
const authPanel = document.getElementById('auth-panel');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const imageWidthSlider = document.getElementById('news-image-width');
const imageWidthValue = document.getElementById('image-width-value');

const trendingStoriesList = document.getElementById('trending-stories-list');
const mostReadList = document.getElementById('most-read-list');
const sidebarNewsletterForm = document.getElementById('sidebar-newsletter-form');

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
        homeContentWrapper.classList.remove('hidden');
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
 * Fetches all multimedia items from the backend API.
 */
async function fetchMultimedia() {
    try {
        const response = await fetch(`${API_URL}/multimedia`);
        if (!response.ok) throw new Error('Failed to fetch multimedia.');
        multimediaItems = await response.json();
        displayMultimedia();
    } catch (error) {
        handleApiError(error, 'Could not load multimedia content');
    }
}

/**
 * Renders the multimedia items to the DOM.
 */
function displayMultimedia() {
    const videosContainer = document.getElementById('multimedia-videos');
    const galleriesContainer = document.getElementById('multimedia-galleries');
    const podcastsContainer = document.getElementById('multimedia-podcasts');

    if (!videosContainer || !galleriesContainer || !podcastsContainer) return;

    // Clear existing content
    videosContainer.innerHTML = '';
    galleriesContainer.innerHTML = '';
    podcastsContainer.innerHTML = '';

    if (multimediaItems.length === 0) {
        videosContainer.innerHTML = '<p class="empty-message">No videos have been added yet.</p>';
        return;
    }

    multimediaItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'multimedia-card';
        card.dataset.id = item._id;

        const adminDeleteBtn = isAdminLoggedIn ? `<button class="delete-btn" data-id="${item._id}">Delete</button>` : '';

        let cardContent = `
            ${adminDeleteBtn}
            <div class="multimedia-thumbnail">
                <a href="${escapeHTML(item.contentUrl)}" target="_blank" rel="noopener noreferrer">
                    <img src="${escapeHTML(item.thumbnailUrl)}" alt="${escapeHTML(item.title)}">
                    ${item.type === 'video' ? '<div class="play-icon"><i class="fas fa-play"></i></div>' : ''}
                </a>
            </div>
            <h4>${escapeHTML(item.title)}</h4>
            <p>${escapeHTML(item.description)}</p>
        `;

        if (item.type === 'podcast') {
            card.classList.add('podcast-card');
            cardContent += `<a href="${escapeHTML(item.contentUrl)}" target="_blank" rel="noopener noreferrer" class="listen-btn"><i class="fas fa-headphones-alt"></i> Listen Now</a>`;
        }

        card.innerHTML = cardContent;

        if (item.type === 'video') videosContainer.appendChild(card);
        else if (item.type === 'gallery') galleriesContainer.appendChild(card);
        else if (item.type === 'podcast') podcastsContainer.appendChild(card);
    });
}

/**
 * Adds a new multimedia item.
 */
async function addMultimedia() {
    const typeInput = document.getElementById('multimedia-type');
    const titleInput = document.getElementById('multimedia-title');
    const descriptionInput = document.getElementById('multimedia-description');
    const thumbnailUrlInput = document.getElementById('multimedia-thumbnail-url');
    const contentUrlInput = document.getElementById('multimedia-content-url');

    const newItemData = {
        type: typeInput.value,
        title: titleInput.value,
        description: descriptionInput.value,
        thumbnailUrl: thumbnailUrlInput.value,
        contentUrl: contentUrlInput.value
    };

    if (!newItemData.title || !newItemData.thumbnailUrl || !newItemData.contentUrl) {
        showNotification('Title, Thumbnail URL, and Content URL are required.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/multimedia`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(newItemData)
        });
        if (!response.ok) throw new Error('Failed to create multimedia item.');
        showNotification('Multimedia item added successfully!');

        // Reset form fields manually
        typeInput.value = 'video';
        titleInput.value = '';
        descriptionInput.value = '';
        thumbnailUrlInput.value = '';
        contentUrlInput.value = '';

        await fetchMultimedia(); // Refresh the list
    } catch (error) {
        handleApiError(error, 'Could not add multimedia item');
    }
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
      const categories = ["Breaking News", "Local", "World", "Politics", "Business", "Tech", "Entertainment", "Sports", "Lifestyle", "Opinion", "Guest Column", "Editorial Pick"];
      const categoryOptions = categories.map(cat =>
        `<option value="${escapeHTML(cat)}" ${article.category === cat ? 'selected' : ''}>${escapeHTML(cat)}</option>`
      ).join('');

      const homeCheckboxHTML = `
        <div class="form-option">
            <input type="checkbox" id="edit-show-on-home-${originalIndex}" class="edit-show-on-home" ${article.showOnHome ? 'checked' : ''}>
            <label for="edit-show-on-home-${originalIndex}">Feature on Home Page</label>
        </div>
      `;
      
      const trendingCheckboxHTML = `
        <div class="form-option">
            <input type="checkbox" id="edit-is-trending-${originalIndex}" class="edit-is-trending" ${article.isTrending ? 'checked' : ''}>
            <label for="edit-is-trending-${originalIndex}">Mark as Trending</label>
        </div>`;

      const mostReadCheckboxHTML = `
        <div class="form-option">
            <input type="checkbox" id="edit-is-most-read-${originalIndex}" class="edit-is-most-read" ${article.isMostRead ? 'checked' : ''}>
            <label for="edit-is-most-read-${originalIndex}">Mark as Most Read</label>
        </div>`;

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
            ${trendingCheckboxHTML}
            ${mostReadCheckboxHTML}
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
 * Renders a list of articles in a sidebar widget.
 * @param {HTMLElement} listElement - The UL or OL element to populate.
 * @param {Array<Object>} articlesToShow - The array of articles to display.
 */
function renderSidebarList(listElement, articlesToShow) {
    listElement.innerHTML = ''; // Clear old list
    if (articlesToShow.length === 0) {
        listElement.innerHTML = '<li>No articles to show.</li>';
        return;
    }
    articlesToShow.forEach(article => {
        const li = document.createElement('li');
        // Using a class for the link makes the event listener more specific
        li.innerHTML = `<a href="#" class="sidebar-link" data-category="${escapeHTML(article.category)}">${escapeHTML(article.title)}</a>`;
        listElement.appendChild(li);
    });
}

/**
 * Filters and displays articles marked as "Trending" in the sidebar.
 */
function displayTrendingStories() {
    if (!trendingStoriesList) return;
    // Get up to 5 most recent trending articles
    const trending = articles.filter(a => a.isTrending).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    renderSidebarList(trendingStoriesList, trending);
}

/**
 * Filters and displays articles marked as "Most Read" in the sidebar.
 */
function displayMostReadArticles() {
    if (!mostReadList) return;
    // Get up to 5 most recent "most read" articles
    const mostRead = articles.filter(a => a.isMostRead).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    renderSidebarList(mostReadList, mostRead);
}

/**
 * Displays the most recent articles in the "Latest News" section.
 * @param {number} count - The number of latest articles to display.
 */
function displayLatestNews(count = 3) {
    if (!latestNewsGrid) return;

    // Sort articles by creation date, newest first. The backend adds `createdAt`.
    const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take the top 'count' articles
    const latestArticles = sortedArticles.slice(0, count);

    latestNewsGrid.innerHTML = ''; // Clear previous content

    if (latestArticles.length === 0) {
        // Do not show a message, just leave it empty if no articles exist.
        return;
    }

    latestArticles.forEach(article => {
        const shortDescription = article.content.length > 100
            ? escapeHTML(article.content.substring(0, 100)) + '...'
            : escapeHTML(article.content);

        const publishedDate = new Date(article.createdAt).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });

        // Use a placeholder if no image is available
        const imageUrl = article.imageUrl || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800';

        const cardHTML = `
            <div class="latest-news-card">
                <a href="#" class="latest-news-link" data-category="${escapeHTML(article.category)}">
                    <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(article.title)}" class="latest-news-thumbnail">
                    <div class="latest-news-content">
                        <h3>${escapeHTML(article.title)}</h3>
                        <p class="latest-news-description">${shortDescription}</p>
                        <span class="latest-news-date">${publishedDate}</span>
                    </div>
                </a>
            </div>
        `;
        latestNewsGrid.innerHTML += cardHTML;
    });
}

/**
 * Displays the featured story in the hero section.
 */
function displayFeaturedStory() {
    if (!featuredStorySection) return;

    // Sort articles by creation date, newest first
    const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Find the most recent "Breaking News" article with an image
    let featuredArticle = sortedArticles.find(a => a.category === 'Breaking News' && a.imageUrl);

    // If no breaking news with an image, find the most recent article of any category with an image
    if (!featuredArticle) {
        featuredArticle = sortedArticles.find(a => a.imageUrl);
    }

    if (featuredArticle) {
        const heroTitle = document.getElementById('hero-title');
        const heroSummary = document.getElementById('hero-summary');

        heroTitle.textContent = featuredArticle.title;
        heroSummary.textContent = featuredArticle.content.length > 200
            ? escapeHTML(featuredArticle.content.substring(0, 200)) + '...'
            : escapeHTML(featuredArticle.content);

        // Set the background image of the hero section
        featuredStorySection.style.backgroundImage = `url('${escapeHTML(featuredArticle.imageUrl)}')`;

        // Store the category in the "Read More" button to handle clicks
        heroReadMoreBtn.dataset.category = featuredArticle.category;

        // Show the section
        featuredStorySection.classList.remove('hidden');
    } else {
        // If no suitable article is found, keep the section hidden
        featuredStorySection.classList.add('hidden');
    }
}

/**
 * Fetches all articles from the backend API.
 */
async function fetchArticles() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch articles.');
        articles = await response.json();
        // Now that we have articles, display all relevant sections
        displayFeaturedStory();
        displayLatestNews();
        displayTrendingStories();
        displayMostReadArticles();
        displayArticles();
    } catch (error) {
        handleApiError(error, 'Could not load articles');
    }
}

/**
 * Provides a centralized way to handle API errors and show user-friendly notifications.
 * @param {Error} error - The error object from the catch block.
 * @param {string} contextMessage - A message describing the action that failed (e.g., "Could not load articles").
 */
function handleApiError(error, contextMessage) {
    console.error(`API Error (${contextMessage}):`, error);
    let displayMessage = contextMessage;
    if (error.message === 'Failed to fetch') {
        displayMessage = `${contextMessage}. Could not connect to the server. Is it running?`;
    } else if (error.message) {
        displayMessage = error.message;
    }
    showNotification(displayMessage, 'error');
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
            handleApiError(error, 'Could not delete article');
        }
    }
}

/**
 * Deletes a multimedia item.
 * @param {string} id - The ID of the item to delete.
 */
async function deleteMultimedia(id) {
    if (!isAdminLoggedIn) return;
    if (confirm('Are you sure you want to delete this multimedia item?')) {
        try {
            const response = await fetch(`${API_URL}/multimedia/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete multimedia item.');
            showNotification('Multimedia item deleted successfully!');
            await fetchMultimedia(); // Refresh the list
        } catch (error) {
            handleApiError(error, 'Could not delete multimedia item');
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
    const isTrendingInput = document.getElementById("news-is-trending");
    const isMostReadInput = document.getElementById("news-is-most-read");

    if (titleInput.value && contentInput.value && categoryInput.value) {
        const newArticleCategory = categoryInput.value;
        const newArticle = {
            title: titleInput.value,
            content: contentInput.value,
            category: newArticleCategory,
            imageUrl: imageUrlInput.value.trim(),
            imagePosition: imagePositionInput.value,
            imageWidth: imageWidthInput.value,
            showOnHome: showOnHomeInput.checked,
            isTrending: isTrendingInput.checked,
            isMostRead: isMostReadInput.checked
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
            isTrendingInput.checked = false;
            isMostReadInput.checked = false;
            if (imageWidthValue) imageWidthValue.textContent = '100%';

            showNotification("Article added successfully!");
            currentCategoryFilter = newArticleCategory; // Switch view to the new article's category
            await fetchArticles(); // Refetch to get the new list with the new article
        } catch (error) {
            handleApiError(error, 'Could not create article');
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
    const newIsTrending = articleEl.querySelector('.edit-is-trending').checked;
    const newIsMostRead = articleEl.querySelector('.edit-is-most-read').checked;

    if (newTitle && newContent) {
        const updatedArticle = {
            title: newTitle,
            content: newContent,
            category: newCategory,
            imageUrl: newImageUrl.trim(),
            imagePosition: newImagePosition,
            imageWidth: newImageWidth,
            showOnHome: newShowOnHome,
            isTrending: newIsTrending,
            isMostRead: newIsMostRead
        };
        try {
            const response = await fetch(`${API_URL}/posts/${articleId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedArticle)
            });
            if (!response.ok) throw new Error('Failed to update article.');
            showNotification("Article updated successfully!");
            currentlyEditingIndex = null; // Exit edit mode on successful save
            await fetchArticles(); // Refetch to get updated list
        } catch (error) {
            handleApiError(error, 'Could not update article');
        }
    } else {
        showNotification('Title and content cannot be empty.', 'error');
    }
}

/**
 * Updates all UI elements based on the admin's login status.
 */
function updateAdminUI() {
    if (isAdminLoggedIn || isUserLoggedIn) {
        signInBtn.textContent = 'Logout';
        if (isAdminLoggedIn) {
            // Show admin panel only if on the home page
            if (!homeContentWrapper.classList.contains('hidden')) {
                adminPanel.classList.remove('hidden');
            } else {
                adminPanel.classList.add('hidden');
            }
            // Populate ticker input with current text
            const tickerTextInput = document.getElementById('ticker-text-input');
            if (tickerTextInput) tickerTextInput.value = tickerText;
        } else {
            // User is logged in, but not an admin
        }
    } else {
        signInBtn.textContent = 'Sign In / Register';
        exitEditMode(); // Ensure we exit edit mode on logout
        adminPanel.classList.add('hidden');
        authPanel.classList.add('hidden');
    }
    // Re-render articles to show/hide delete buttons
    displayArticles();
    displayMultimedia();
}

/**
 * Handles the admin login process.
 */
async function handleLogin() {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showNotification('Please enter both email and password.', 'error');
        return;
    }

    // --- Admin Login Check (Frontend Simulation) ---
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        isUserLoggedIn = false;
        loggedInUserEmail = email;
        authPanel.classList.add('hidden');
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        updateAdminUI();
        showNotification(`Welcome, Admin! You are now in control.`);
        return; // Stop further checks
    }

    // --- Regular User Login Check (Frontend Simulation) ---
    const users = JSON.parse(localStorage.getItem('blogUsers')) || [];
    const foundUser = users.find(user => user.email === email && user.password === password);

    if (foundUser) {
        isUserLoggedIn = true;
        isAdminLoggedIn = false;
        loggedInUserEmail = email;
        authPanel.classList.add('hidden');
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        updateAdminUI();
        showNotification(`Welcome back, ${email}! You are subscribed to notifications.`, 'success');
        return;
    }

    // --- If no match was found ---
    showNotification('Invalid email or password.', 'error');
}

/**
 * Handles the admin logout process.
 */
function handleLogout() {
    isAdminLoggedIn = false;
    isUserLoggedIn = false;
    loggedInUserEmail = null;
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
        authPanel.classList.toggle('hidden');
    }
});

loginBtn.addEventListener('click', handleLogin);
addNewsBtn.addEventListener('click', addArticle);
updateTickerBtn.addEventListener('click', handleUpdateTicker);
addMultimediaBtn.addEventListener('click', addMultimedia);
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

sidebar.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;

    e.preventDefault();
    // For now, clicking a sidebar link just filters by that article's category.
    // A more advanced implementation could scroll to the article itself.
    currentCategoryFilter = link.dataset.category;
    showPage('home');
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
    if (!authPanel.contains(e.target) && e.target !== signInBtn) {
        authPanel.classList.add('hidden');
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

sidebarNewsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('sidebar-email');
    if (emailInput.value && emailInput.checkValidity()) {
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

async function init() {
    const token = getAuthToken();
    if (token) {
        try {
            const response = await fetch(`${API_URL}/verify-token`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                isAdminLoggedIn = true;
            } else {
                // Token is invalid or expired, so remove it
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            // Server is likely down, we can't verify, so stay logged out.
            console.error('Could not verify token (server might be down):', error);
        }
    }

    // Now that login status is determined, proceed with setup
    updateDateTime(); // Call once to avoid delay
    setInterval(updateDateTime, 1000); // Update every second

    // Fetch articles and update the main UI.
    // fetchArticles() will display the main content.
    // updateAdminUI() will then correctly show/hide admin features on top of that.
    await fetchMultimedia();
    await fetchArticles();
    updateAdminUI();

    // Setup other parts of the page
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    loadTickerFromStorage();
    updateTickerDOM();
}

init();
