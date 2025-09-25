// Default admin credentials (TEST ONLY!)
const ADMIN_EMAIL = "admin@clearview.news";
const ADMIN_PASSWORD = "password123";

// --- DUMMY DATA FOR FUTURE FEATURES ---
const dummyUsers = [
    { id: 1, name: 'Admin User', email: 'admin@clearview.news', role: 'Admin' },
    { id: 2, name: 'Tjay Earl', email: 'tjay@clearview.news', role: 'Editor' },
    { id: 3, name: 'Ines Kibe', email: 'ines@clearview.news', role: 'Author' },
];

const dummyComments = [
    { id: 1, author: 'John D.', content: 'This is a great article, very insightful!', articleTitle: 'The Future of AI', status: 'pending' },
    { id: 2, author: 'Jane S.', content: 'I disagree with some points, but it was a good read.', articleTitle: 'Market Hits Record Highs', status: 'pending' },
    { id: 3, author: 'SpamBot', content: 'BUY CHEAP STUFF HERE -> spam.com', articleTitle: 'The Future of AI', status: 'pending' },
];

let mediaItems = JSON.parse(localStorage.getItem("blogMedia")) || [];

let articles = JSON.parse(localStorage.getItem("blogArticles")) || [];

// --- DOM ELEMENTS ---
const contentSections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
const notificationContainer = document.getElementById('notification-container');
const contentInput = document.getElementById("content");
const editorStats = document.getElementById("editor-stats");
const sortSelect = document.getElementById('sort-articles');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const quickAddBtn = document.getElementById('quick-add-btn');
const mediaFileInput = document.getElementById('media-file-input');

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("login-error");
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    // Load initial data for the dashboard
    loadArticles();
    loadSubscribers();
    loadUnsavedDraft(); // Load any auto-saved draft
    loadUsers();
    loadCommentsForModeration();
    loadMedia();
  } else {
    error.textContent = "Invalid email or password!";
  }
}

// Logout function
function logout() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  localStorage.removeItem('unsavedDraft'); // Clear draft on logout
}

// Add new article
function addArticle(status) {
  const title = document.getElementById("title").value.trim();
  const scheduleDateInput = document.getElementById('schedule-date');

  if (!title || !contentInput.value.trim()) {
    showNotification("Title and Content are required.", "error");
    return;
  }

  if (status === 'scheduled' && !scheduleDateInput.value) {
    showNotification("Please select a date and time to schedule the article.", "error");
    return;
  }

  let articleStatus = status;
  let publishedAt = new Date().toISOString();
  if (status === 'scheduled') {
    publishedAt = new Date(scheduleDateInput.value).toISOString();
  }

  const article = { 
    _id: `article_${Date.now()}`, 
    title, 
    content: content.value.trim(), 
    createdAt: new Date().toISOString(),
    status: status // 'draft' or 'published'
  };
  if (status === 'scheduled') article.scheduledFor = publishedAt;

  articles.unshift(article);
  localStorage.setItem("blogArticles", JSON.stringify(articles));
  
  // Reset form, switch back to dashboard view, and reload
  document.getElementById("title").value = "";
  contentInput.value = "";
  localStorage.removeItem('unsavedDraft'); // Clear auto-saved draft on successful save
  showSection('dashboard-view');
  loadArticles();
  showNotification("Article added successfully!");
}

// Load articles into list
function loadArticles() {
  const list = document.getElementById("article-list");
  if (!list) return;

  // Update stats
  const publishedCount = articles.filter(a => a.status === 'published').length;
  document.getElementById('stats-total-articles').textContent = publishedCount;


  list.innerHTML = "";
  // Show only the last 5 articles on the dashboard
  const recentArticles = articles.slice(0, 5);
  recentArticles.forEach(article => {
    const articleCard = document.createElement("div");
    articleCard.className = "article-card";
    const articleDate = new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let dateLabel = `Published on: ${articleDate}`;
    if (article.status === 'scheduled') {
        const scheduledDate = new Date(article.scheduledFor).toLocaleString();
        dateLabel = `Scheduled for: ${scheduledDate}`;
    }

    const articlePreview = (article.content || '').substring(0, 100) + '...';
    const statusBadge = `<span class="status-badge ${article.status}">${article.status}</span>`;

    articleCard.innerHTML = `
      ${statusBadge}
      <h3>${article.title}</h3>
      <p class="date">${dateLabel}</p>
      <p class="preview">${articlePreview}</p>
      <div class="article-actions">
        <button class="action-btn preview" onclick="previewArticle('${article._id}')"><i class="fas fa-eye"></i> Preview</button>
        <button class="action-btn edit" onclick="editArticle('${article._id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="action-btn delete" onclick="deleteArticle('${article._id}')"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    list.appendChild(articleCard);
  });
}

// Load subscribers into list
function loadSubscribers() {
    const allSubscribers = JSON.parse(localStorage.getItem("blogSubscribers")) || [];
    const list = document.getElementById("subscriber-list");
    const latestList = document.getElementById("latest-subscribers-list");
    const searchInput = document.getElementById("subscriber-search");

    // Update stats
    document.getElementById('stats-total-subscribers').textContent = allSubscribers.length;

    // Populate the dashboard's "Latest Subscribers" list
    if (latestList) {
        latestList.innerHTML = "";
        const recentSubscribers = allSubscribers.slice(-5).reverse(); // Get last 5, newest first
        if (recentSubscribers.length === 0) {
            latestList.innerHTML = "<li>No subscribers yet.</li>";
        } else {
            recentSubscribers.forEach(email => {
                const li = document.createElement("li");
                li.textContent = email;
                latestList.appendChild(li);
            });
        }
    }

    // Populate the full subscriber list on the "Subscribers" page
    if (!list) return;
    function renderList(filter = '') {
        const filteredSubscribers = allSubscribers.filter(email => email.toLowerCase().includes(filter.toLowerCase()));
        list.innerHTML = "";
        if (filteredSubscribers.length === 0) {
            list.innerHTML = `<li>No subscribers found${filter ? ' for "' + filter + '"' : ''}.</li>`;
            return;
        }
        filteredSubscribers.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email;
            list.appendChild(li);
        });
    }

    // Initial render
    renderList();

    // Add event listener for search input
    searchInput.addEventListener('keyup', () => {
        renderList(searchInput.value);
    });

}

// Delete article
function deleteArticle(id) {
  if (confirm('Are you sure you want to delete this article?')) {
    articles = articles.filter(article => article._id !== id);
    localStorage.setItem("blogArticles", JSON.stringify(articles));
    showNotification("Article deleted successfully.");
    loadArticles(); // Reload to update the view
  }
}

// Placeholder for edit functionality
function editArticle(id) {
    showNotification(`Editing article with ID: ${id}. \n(Full edit functionality can be built out here.)`, 'info');
}

// Preview article in a new tab
function previewArticle(id) {
    const url = `preview.html?id=${id}`;
    window.open(url, '_blank');
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

// --- Navigation ---
function showSection(targetId) {
    contentSections.forEach(section => section.classList.toggle('hidden', section.id !== targetId));
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.target === targetId));

    // Load data for the "All Articles" view when it's shown
    if (targetId === 'all-articles-view') {
        loadAllArticles();
    } else if (targetId === 'media-view') {
        loadMedia();
    } else if (targetId === 'comments-view') {
        loadCommentsForModeration();
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.target);
    });
});

// --- Article Management Upgrades ---

// Word Count and Reading Time
contentInput.addEventListener('input', () => {
    const text = contentInput.value;
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Avg reading speed: 200 WPM

    editorStats.innerHTML = `
        <span>Word Count: ${wordCount}</span>
        <span>Reading Time: ${readingTime} min</span>
    `;
});

// Load All Articles with Sorting and Bulk Actions
function loadAllArticles() {
    const list = document.getElementById("all-articles-list");
    if (!list) return;

    const sortValue = sortSelect.value;
    let sortedArticles = [...articles];

    if (sortValue === 'date-desc') {
        sortedArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === 'date-asc') {
        sortedArticles.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortValue === 'title-asc') {
        sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
    }

    list.innerHTML = "";
    sortedArticles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.className = "article-card";
        const articleDate = new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusBadge = `<span class="status-badge ${article.status}">${article.status}</span>`;

        articleCard.innerHTML = `
            <input type="checkbox" class="bulk-checkbox" data-id="${article._id}">
            ${statusBadge}
            <h3>${article.title}</h3>
            <p class="date">${articleDate}</p>
            <div class="article-actions">
                <button class="action-btn preview" onclick="previewArticle('${article._id}')"><i class="fas fa-eye"></i> Preview</button>
                <button class="action-btn edit" onclick="editArticle('${article._id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn delete" onclick="deleteArticle('${article._id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        list.appendChild(articleCard);
    });
}

sortSelect.addEventListener('change', loadAllArticles);

deleteSelectedBtn.addEventListener('click', () => {
    const selectedCheckboxes = document.querySelectorAll('#all-articles-list .bulk-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showNotification("No articles selected.", "error");
        return;
    }
    if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} selected articles?`)) {
        const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
        articles = articles.filter(article => !idsToDelete.includes(article._id));
        localStorage.setItem("blogArticles", JSON.stringify(articles));
        showNotification(`${selectedCheckboxes.length} articles deleted successfully.`);
        loadAllArticles(); // Refresh the list
    }
});

// --- Auto-Save Drafts ---
function saveDraftToLocalStorage() {
    const title = document.getElementById("title").value;
    const contentValue = contentInput.value;
    if (title.trim() || contentValue.trim()) {
        const draft = { title, content: contentValue };
        localStorage.setItem('unsavedDraft', JSON.stringify(draft));
    } else {
        localStorage.removeItem('unsavedDraft'); // Remove if fields are empty
    }
}

function loadUnsavedDraft() {
    const draft = JSON.parse(localStorage.getItem('unsavedDraft'));
    if (draft) {
        document.getElementById("title").value = draft.title;
        contentInput.value = draft.content;
        // Trigger input event to update word count
        contentInput.dispatchEvent(new Event('input'));
        showNotification("Unsaved draft loaded.", "info");
    }
}

// Listen for input on editor fields to auto-save
document.getElementById("title").addEventListener('input', saveDraftToLocalStorage);
contentInput.addEventListener('input', saveDraftToLocalStorage);

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // Ctrl + N for New Article
    if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        showSection('add-article-view');
    }

    // Ctrl + S to Save as Draft (only if in the add article view)
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
        if (!document.getElementById('add-article-view').classList.contains('hidden')) {
            e.preventDefault();
            addArticle('draft');
        }
    }
});

// --- Future-Proof Additions ---

// Load Users for Role Management
function loadUsers() {
    const userListContainer = document.getElementById('user-list');
    if (!userListContainer) return;

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
            </tr>
        </thead>
        <tbody>
            ${dummyUsers.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <select data-userid="${user.id}">
                            <option ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option ${user.role === 'Editor' ? 'selected' : ''}>Editor</option>
                            <option ${user.role === 'Author' ? 'selected' : ''}>Author</option>
                        </select>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    userListContainer.innerHTML = '';
    userListContainer.appendChild(table);
}

// Load Comments for Moderation
function loadCommentsForModeration() {
    const list = document.getElementById('comments-moderation-list');
    if (!list) return;

    list.innerHTML = dummyComments.filter(c => c.status === 'pending').map(comment => `
        <div class="comment-moderation-card" data-commentid="${comment.id}">
            <p class="comment-meta">
                <strong>${comment.author}</strong> commented on "<em>${comment.articleTitle}</em>"
            </p>
            <p class="comment-body">${comment.content}</p>
            <div class="comment-actions">
                <button class="action-btn approve"><i class="fas fa-check"></i> Approve</button>
                <button class="action-btn delete"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');

    if (list.innerHTML === '') {
        list.innerHTML = '<p>No comments are awaiting moderation.</p>';
    }
}

// Media Manager
function loadMedia() {
    const grid = document.getElementById('media-grid');
    if (!grid) return;

    grid.innerHTML = mediaItems.map(item => `
        <div class="media-card">
            <img src="${item.url}" alt="Media item">
            <div class="media-card-overlay">
                <button class="action-btn delete" onclick="deleteMedia('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    if (grid.innerHTML === '') {
        grid.innerHTML = '<p>No media items uploaded yet.</p>';
    }
}

function deleteMedia(id) {
    if (confirm('Are you sure you want to delete this media item?')) {
        mediaItems = mediaItems.filter(item => item.id !== id);
        localStorage.setItem('blogMedia', JSON.stringify(mediaItems));
        loadMedia();
        showNotification('Media item deleted.');
    }
}

document.getElementById('upload-media-btn').addEventListener('click', () => {
    mediaFileInput.click();
});

mediaFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        // In a real app, you'd upload the file to a server and get a URL back.
        // Here, we'll simulate it by using a placeholder image URL.
        const newMedia = { id: `media_${Date.now()}`, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800' };
        mediaItems.unshift(newMedia);
        localStorage.setItem('blogMedia', JSON.stringify(mediaItems));
        loadMedia();
        showNotification('Media "uploaded" successfully (simulation).');
    }
});

quickAddBtn.addEventListener('click', (e) => { e.preventDefault(); showSection('add-article-view'); });

// --- Fix for subscribe page not saving emails ---
// This logic should be in subscribe.js, but for this exercise we'll patch it here
// to ensure the admin panel has data to show.

// Check if we are on the subscribe page by looking for a unique element
if (document.getElementById('subscribe-form')) {
    const subscribeForm = document.getElementById('subscribe-form');
    subscribeForm.addEventListener('submit', (e) => {
        const emailInput = document.getElementById('subscribe-email');
        const email = emailInput.value.trim();
        if (email && emailInput.checkValidity()) {
            let subscribers = JSON.parse(localStorage.getItem('blogSubscribers')) || [];
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('blogSubscribers', JSON.stringify(subscribers));
            }
        }
    });
}