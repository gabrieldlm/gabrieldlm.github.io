(function () {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  function currentTheme(): "light" | "dark" {
    const explicit = root.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyIcon(theme: "light" | "dark"): void {
    button!.textContent = theme === "dark" ? "☀" : "☾";
    button!.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  applyIcon(currentTheme());

  button.addEventListener("click", () => {
    const next: "light" | "dark" = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
    applyIcon(next);
  });
})();
