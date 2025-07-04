const toggleSwitch = document.getElementById("mode-toggle");
const modeLabel = document.getElementById("mode-label");

// Load mode from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleSwitch.checked = true;
  modeLabel.textContent = "Dark Mode";
}

// Toggle theme on click
toggleSwitch.addEventListener("change", () => {
  if (toggleSwitch.checked) {
    document.body.classList.add("dark-mode");
    modeLabel.textContent = "Dark Mode";
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    modeLabel.textContent = "Light Mode";
    localStorage.setItem("theme", "light");
  }
});
