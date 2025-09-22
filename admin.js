// Default admin credentials (TEST ONLY!)
const ADMIN_EMAIL = "admin@clearview.news";
const ADMIN_PASSWORD = "password123";

let articles = JSON.parse(localStorage.getItem("blogArticles")) || [];

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("login-error");

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadArticles();
  } else {
    error.textContent = "Invalid email or password!";
  }
}

// Logout function
function logout() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("login-container").classList.remove("hidden");
}

// Add new article
function addArticle() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (title === "" || content === "") {
    alert("Please fill in both fields");
    return;
  }

  const article = { _id: `article_${Date.now()}`, title, content, createdAt: new Date().toISOString() };
  articles.unshift(article);
  localStorage.setItem("blogArticles", JSON.stringify(articles));
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  loadArticles();
}

// Load articles into list
function loadArticles() {
  const list = document.getElementById("article-list");
  list.innerHTML = "";
  articles.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${article.title}</strong><br>
      ${article.content}<br>
      <button onclick="deleteArticle('${article._id}')">Delete</button>
    `;
    list.appendChild(li);
  });
}

// Delete article
function deleteArticle(id) {
  articles = articles.filter(article => article._id !== id);
  localStorage.setItem("blogArticles", JSON.stringify(articles));
  loadArticles();
}