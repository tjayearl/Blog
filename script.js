// --- STATE ---

/**
 * Seeds the browser's local storage with initial data if it's the first time running.
 * This makes the blog feel populated without needing a backend.
 */
function seedInitialData() {
    if (!localStorage.getItem('blogArticles')) {
        const initialArticles = [
            {
                _id: "article_1672531200000",
                title: "The Future of AI: Predictions for the Next Decade",
                summary: "Artificial Intelligence is evolving at an unprecedented pace. We dive into what the next 10 years might hold for AI, from autonomous vehicles to creative arts.",
                author: {
                    name: "Ines Kibe",
                    bio: "Ines is a tech enthusiast and co-founder of ClearView News, with a passion for making complex technology understandable.",
                    avatar: "https://i.pravatar.cc/150?u=ines"
                },
                content: "The last decade has seen AI transition from science fiction to an integral part of our daily lives. Looking ahead, experts predict even more transformative changes. Expect to see AI-driven diagnostics revolutionize healthcare, personalized education systems adapt to individual learning styles, and AI-powered creativity tools that will change the face of art and music. However, with great power comes great responsibility. The next decade will also be crucial for establishing ethical guidelines and ensuring AI development benefits all of humanity.",
                category: "Tech",
                imageUrl: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=800",
                imagePosition: "top",
                imageWidth: "100",
                showOnHome: true,
                isTrending: true,
                isMostRead: false,
                createdAt: "2023-10-26T10:00:00Z"
            },
            {
                _id: "article_1672617600000",
                title: "Breaking: Market Hits Record Highs Amidst Tech Rally",
                summary: "The stock market surged to new heights today, driven by a powerful rally in the technology sector. We break down the key players and what this means for investors.",
                author: {
                    name: "Tjay Earl",
                    bio: "Tjay is a seasoned financial journalist and co-founder of ClearView News, specializing in market analysis and economic trends.",
                    avatar: "https://i.pravatar.cc/150?u=tjay"
                },
                content: "Investors are celebrating as major indices shattered previous records. The rally was primarily led by big tech companies, whose recent earnings reports exceeded all expectations. Analysts are optimistic, but caution that volatility could be on the horizon. This article explores the factors contributing to the current market boom and offers insights on how to navigate this bullish environment.",
                category: "Breaking News",
                imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800",
                imagePosition: "top",
                imageWidth: "100",
                showOnHome: true,
                isTrending: true,
                isMostRead: true,
                createdAt: "2023-10-25T14:30:00Z"
            }
        ];
        localStorage.setItem('blogArticles', JSON.stringify(initialArticles));
    }
    if (!localStorage.getItem('blogMultimedia')) {
        localStorage.setItem('blogMultimedia', JSON.stringify([]));
    }
    if (!localStorage.getItem('blogSubscribers')) { localStorage.setItem('blogSubscribers', JSON.stringify([])); }
}

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
let currentSearchQuery = ''; // To store the current search query

// --- DOM ELEMENTS ---
// Sections
const adminPanel = document.getElementById("admin-panel");
const homeContentWrapper = document.getElementById('home-content-wrapper');
const newsContainer = document.getElementById("news-container");
const articleSummaryInput = document.getElementById("news-summary");
const notificationContainer = document.getElementById('notification-container');
const latestNewsGrid = document.getElementById('latest-news-grid');
const featuredStorySection = document.getElementById('featured-story-section');
const aboutSection = document.getElementById("about-section");
const contactForm = document.getElementById('contact-section');
const sidebar = document.getElementById('sidebar');
const opinionsSection = document.getElementById('opinions-section');
const multimediaSection = document.getElementById('multimedia-section'); // Keep this line
const mainContentSections = [adminPanel, homeContentWrapper, aboutSection, contactForm, opinionsSection, multimediaSection]; // Keep this line

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

const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
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
    const pageTarget = target || 'home';
    hideAllMainContent();

    if (pageTarget === 'home') {
        homeContentWrapper.classList.remove('hidden');
        document.title = 'ClearView News - Home';
    } else {
        const sectionToShow = document.getElementById(pageTarget);
        if (sectionToShow) {
            // Create a user-friendly title from the section ID
            const title = pageTarget.replace('-section', '').replace('-', ' ');
            const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
            document.title = `${capitalizedTitle} - ClearView News`;
            sectionToShow.classList.remove('hidden');
        }
    }
    // Ensure admin UI is correctly shown/hidden for the new page
    updateAdminUI();
}

/**
 * Saves the current multimedia items array to local storage.
 */
function saveMultimediaToStorage() {
    localStorage.setItem('blogMultimedia', JSON.stringify(multimediaItems));
}

/**
 * Fetches all multimedia items from local storage.
 */
function fetchMultimedia() {
    multimediaItems = JSON.parse(localStorage.getItem('blogMultimedia')) || [];
    displayMultimedia();
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
                    <img src="${escapeHTML(item.thumbnailUrl)}" alt="${escapeHTML(item.title)}" loading="lazy">
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
function addMultimedia() {
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
        contentUrl: contentUrlInput.value,
        _id: `media_${new Date().getTime()}`, // Simulate a unique ID
        createdAt: new Date().toISOString()
    };

    if (!newItemData.title || !newItemData.thumbnailUrl || !newItemData.contentUrl) {
        showNotification('Title, Thumbnail URL, and Content URL are required.', 'error');
        return;
    }

    multimediaItems.unshift(newItemData);
    saveMultimediaToStorage();
    showNotification('Multimedia item added successfully!');

    // Reset form fields manually
    typeInput.value = 'video';
    titleInput.value = '';
    descriptionInput.value = '';
    thumbnailUrlInput.value = '';
    contentUrlInput.value = '';

    fetchMultimedia(); // Refresh the list
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
    const searchQuery = currentSearchQuery.toLowerCase();

    // Start with all articles
    let articlesToDisplay = articles;

    // Apply search filter if there's a query
    if (searchQuery) {
        articlesToDisplay = articles.filter(article =>
            (article.title && article.title.toLowerCase().includes(searchQuery)) ||
            (article.summary && article.summary.toLowerCase().includes(searchQuery)) ||
            (article.content && article.content.toLowerCase().includes(searchQuery))
        );
    }

    if (currentCategoryFilter === 'home') {
        filteredArticles = articlesToDisplay.filter(article => article.showOnHome);
    } else {
        filteredArticles = articlesToDisplay.filter(article =>
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
            <textarea class="edit-summary" placeholder="Article Summary/Hook">${escapeHTML(article.summary || '')}</textarea>
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
            <img src="${escapeHTML(article.imageUrl)}" alt="${escapeHTML(article.title)}" class="article-image" loading="lazy">
         </div>` :
        "";

      const summaryHTML = article.summary ? `<p class="article-summary"><strong>${escapeHTML(article.summary)}</strong></p>` : '';

      articleEl.innerHTML = `
        ${adminButtonsHTML}
        ${imageHTML}
        <h2>${escapeHTML(article.title)}</h2>
        ${categoryHTML}
        ${summaryHTML}
        <p>${escapeHTML(article.content).replace(/\n/g, '<br>')}</p>
        ${generateSocialShareButtons(article, originalIndex)}
        ${generateCommentsSection(article, originalIndex)}
        ${generateAuthorBio(article)}
        ${generateRelatedPosts(article, originalIndex)}
      `;
    }
    newsContainer.appendChild(articleEl);
  });
}

/**
 * Generates social sharing buttons for an article.
 * @param {object} article - The article object.
 * @param {number} index - The index of the article.
 * @returns {string} - The HTML string for the share buttons.
 */
function generateSocialShareButtons(article, index) {
    // In a real app, this URL would be the permanent link to the article.
    // For this simulation, we'll just use the main page URL.
    const shareUrl = window.location.href;
    const shareTitle = encodeURIComponent(article.title);

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
    const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${encodeURIComponent(article.summary || '')}`;

    return `
        <div class="social-share">
            <span>Share:</span>
            <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="share-btn twitter" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
            <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        </div>
    `;
}

/**
 * Generates the HTML for an article's comments section.
 * @param {object} article - The article object.
 * @param {number} index - The index of the article.
 * @returns {string} - The HTML string for the comments section.
 */
function generateCommentsSection(article, index) {
    const comments = article.comments || [];
    const commentsHTML = comments.map(comment => `
        <div class="comment">
            <p class="comment-author">${escapeHTML(comment.author)} <span class="comment-date">- ${new Date(comment.createdAt).toLocaleString()}</span></p>
            <p class="comment-body">${escapeHTML(comment.text)}</p>
        </div>
    `).join('');

    return `
        <div class="comments-section">
            <h4>Comments (${comments.length})</h4>
            <div class="comments-list">
                ${comments.length > 0 ? commentsHTML : '<p class="no-comments">Be the first to comment!</p>'}
            </div>
            <div class="comment-form">
                <input type="text" class="comment-author-input" placeholder="Your Name">
                <textarea class="comment-text-input" placeholder="Write a comment..."></textarea>
                <button class="submit-comment-btn">Submit Comment</button>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for the author bio section.
 * @param {object} article - The article object.
 * @returns {string} - The HTML string for the author bio.
 */
function generateAuthorBio(article) {
    if (!article.author || !article.author.name) {
        return ''; // Don't render if there's no author info
    }

    const authorAvatar = article.author.avatar || 'https://i.pravatar.cc/150'; // Default avatar

    return `
        <div class="author-bio-box">
            <img src="${escapeHTML(authorAvatar)}" alt="Avatar of ${escapeHTML(article.author.name)}" class="author-avatar">
            <div class="author-info">
                <h4>About ${escapeHTML(article.author.name)}</h4>
                <p>${escapeHTML(article.author.bio)}</p>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for the related posts section.
 * @param {object} currentArticle - The article for which to find related posts.
 * @param {number} currentIndex - The index of the current article.
 * @returns {string} - The HTML string for the related posts section.
 */
function generateRelatedPosts(currentArticle, currentIndex) {
    const related = articles.filter((article, index) =>
        article.category === currentArticle.category && index !== currentIndex
    ).slice(0, 3); // Get up to 3 related articles

    if (related.length === 0) {
        return ''; // No related posts to show
    }

    const relatedPostsHTML = related.map(article => {
        const imageUrl = article.imageUrl || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800';
        return `
            <a href="#" class="related-post-card" data-category="${escapeHTML(article.category)}">
                <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(article.title)}" class="related-post-thumbnail" loading="lazy">
                <div class="related-post-content">
                    <h5>${escapeHTML(article.title)}</h5>
                </div>
            </a>
        `;
    }).join('');

    return `
        <div class="related-posts-section">
            <h4>Related Posts</h4>
            <div class="related-posts-grid">
                ${relatedPostsHTML}
            </div>
        </div>
    `;
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
        const shortDescription = escapeHTML(article.summary) || (escapeHTML(article.content.substring(0, 100)) + '...');

        const publishedDate = new Date(article.createdAt).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });

        // Use a placeholder if no image is available
        const imageUrl = article.imageUrl || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800';

        const cardHTML = `
            <div class="latest-news-card">
                <a href="#" class="latest-news-link" data-category="${escapeHTML(article.category)}" data-article-id="${escapeHTML(article._id)}">
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
        heroSummary.textContent = featuredArticle.summary || (featuredArticle.content.substring(0, 200) + '...');

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
 * Saves the current articles array to local storage.
 */
function saveArticlesToStorage() {
    localStorage.setItem('blogArticles', JSON.stringify(articles));
}

/**
 * Fetches all articles from local storage.
 */
function fetchArticles() {
    articles = JSON.parse(localStorage.getItem('blogArticles')) || [];
    // Now that we have articles, display all relevant sections
    displayFeaturedStory();
    displayLatestNews();
    displayTrendingStories();
    displayMostReadArticles();
    displayArticles();
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
        showNotification('Article deleted successfully!');
        fetchArticles(); // Refetch all articles to ensure consistency
    }
}

/**
 * Deletes a multimedia item.
 * @param {string} id - The ID of the item to delete.
 */
function deleteMultimedia(id) {
    if (!isAdminLoggedIn) return;
    if (confirm('Are you sure you want to delete this multimedia item?')) {
        multimediaItems = multimediaItems.filter(item => item._id !== id);
        saveMultimediaToStorage();
        showNotification('Multimedia item deleted successfully!');
        displayMultimedia(); // Refresh the list
    }
}

/**
 * Adds a new article to the list.
 */
function addArticle() {
    const titleInput = document.getElementById("news-title");
    const summaryInput = document.getElementById("news-summary");
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
            summary: summaryInput.value,
            author: { // Add default author info for new articles
                name: "ClearView Staff",
                bio: "This article was written by a member of the ClearView News staff.",
                avatar: "https://i.pravatar.cc/150?u=staff"
            },
            comments: [], // Initialize with an empty comments array
            content: contentInput.value,
            category: newArticleCategory,
            imageUrl: imageUrlInput.value.trim(),
            imagePosition: imagePositionInput.value,
            imageWidth: imageWidthInput.value,
            showOnHome: showOnHomeInput.checked,
            isTrending: isTrendingInput.checked,
            isMostRead: isMostReadInput.checked,
            _id: `article_${new Date().getTime()}`, // Simulate a unique ID
            createdAt: new Date().toISOString() // Simulate a creation date
        };

        articles.unshift(newArticle); // Add to the beginning of the array
        saveArticlesToStorage();

        // Reset form
        titleInput.value = "";
        summaryInput.value = "";
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
        fetchArticles(); // Refetch to get the new list with the new article
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
    const newSummary = articleEl.querySelector('.edit-summary').value;
    const newContent = articleEl.querySelector('.edit-content').value;
    const newCategory = articleEl.querySelector('.edit-category').value;
    const newImageUrl = articleEl.querySelector('.edit-image-url').value;
    const newImagePosition = articleEl.querySelector('.edit-image-position').value;
    const newImageWidth = articleEl.querySelector('.edit-image-width').value;
    const newShowOnHome = articleEl.querySelector('.edit-show-on-home').checked;
    const newIsTrending = articleEl.querySelector('.edit-is-trending').checked;
    const newIsMostRead = articleEl.querySelector('.edit-is-most-read').checked;

    if (newTitle && newContent) {
        const updatedArticleData = {
            title: newTitle,
            summary: newSummary,
            content: newContent,
            category: newCategory,
            imageUrl: newImageUrl.trim(),
            imagePosition: newImagePosition,
            imageWidth: newImageWidth,
            showOnHome: newShowOnHome,
            isTrending: newIsTrending,
            isMostRead: newIsMostRead
        };

        // Merge new data with old, preserving ID and creation date
        articles[index] = { ...articles[index], ...updatedArticleData };
        saveArticlesToStorage();
        showNotification("Article updated successfully!");
        currentlyEditingIndex = null; // Exit edit mode on successful save
        fetchArticles(); // Refetch to get updated list
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
function handleLogin() {
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

/**
 * Adds a comment to a specific article.
 * @param {number} index - The index of the article to comment on.
 */
function addComment(index) {
    const articleEl = document.querySelector(`article[data-index='${index}']`);
    const authorInput = articleEl.querySelector('.comment-author-input');
    const textInput = articleEl.querySelector('.comment-text-input');

    if (authorInput.value.trim() && textInput.value.trim()) {
        const newComment = {
            author: authorInput.value.trim(),
            text: textInput.value.trim(),
            createdAt: new Date().toISOString()
        };

        articles[index].comments = articles[index].comments || [];
        articles[index].comments.push(newComment);
        saveArticlesToStorage();
        fetchArticles(); // Refresh to show the new comment
    } else {
        showNotification('Please provide both a name and a comment.', 'error');
    }
}

function escapeHTML(str) {
    // Coerce to string to prevent errors on non-string types (like numbers) and handle null/undefined
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function handleSearch() {
    currentSearchQuery = searchInput.value;
    displayArticles();
}
// --- EVENT LISTENERS ---

categoriesDropdown.addEventListener('click', (e) => {
    e.preventDefault();
    const link = e.target.closest('.category-link');
    if (!link) return;

    currentCategoryFilter = link.dataset.category;
    currentSearchQuery = ''; // Reset search when changing category
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
    currentSearchQuery = ''; // Reset search when changing category
    showPage('home');
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

// --- Delegated Event Listeners for Performance ---

document.body.addEventListener('click', function(e) {
    // Article actions (edit, delete, save, cancel, comment)
    const articleEl = e.target.closest('article[data-index]');
    if (articleEl) {
        const index = parseInt(articleEl.dataset.index, 10);
        if (e.target.matches('.delete-btn')) {
            deleteArticle(index);
        } else if (e.target.matches('.edit-btn')) {
            enterEditMode(index);
        } else if (e.target.matches('.save-btn')) {
            saveArticle(index);
        } else if (e.target.matches('.cancel-btn')) {
            exitEditMode();
        } else if (e.target.matches('.submit-comment-btn')) {
            addComment(index);
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
    const email = emailInput.value.trim();

    if (email && emailInput.checkValidity()) {
        let subscribers = JSON.parse(localStorage.getItem('blogSubscribers')) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('blogSubscribers', JSON.stringify(subscribers));
            showNotification(`Thank you for subscribing with ${email}!`);
            emailInput.value = '';
        } else {
            showNotification('This email is already subscribed.', 'error');
        }
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

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

searchInput.addEventListener('keyup', (e) => {
    // Using keyup for real-time filtering
    handleSearch();
});

// --- INITIALIZATION ---

function init() {
    // Now that login status is determined, proceed with setup
    updateDateTime(); // Call once to avoid delay
    setInterval(updateDateTime, 1000); // Update every second

    // Check for and create initial data if it's the first visit
    seedInitialData();

    // Fetch articles and update the main UI.
    // fetchArticles() will display the main content.
    // updateAdminUI() will then correctly show/hide admin features on top of that.
    fetchMultimedia();
    fetchArticles();
    updateAdminUI();

    // Setup other parts of the page
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    loadTickerFromStorage();
    updateTickerDOM();

    // Set initial theme based on localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
        themeToggle.checked = true;
    }
}

init();
