document
  .getElementById("themeToggleBtn")
  .addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
      this.textContent = "🌞";
    } else {
      this.textContent = "🌜";
    }
  });

function handleMaskedBackNavigation() {
  const maskedOverlay = document.getElementById("masked-page-overlay");
  const urlMaskOverlay = document.getElementById("url-mask-overlay");

  if (maskedOverlay) {
    maskedOverlay.remove();
    window.history.pushState({}, "", "/yaya/");
    return false;
  }

  if (urlMaskOverlay) {
    urlMaskOverlay.remove();
    window.history.pushState({}, "", "/yaya/");
    return false;
  }

  const currentPath = window.location.pathname;
  const maskedPaths = [
    "/dashboard/",
    "/admin/",
    "/secure-area/",
    "/classified/",
    "/top-secret/",
  ];
  const isMaskedPath = maskedPaths.some((path) => currentPath.includes(path));

  if (isMaskedPath) {
    navigateBackWithMasking();
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.history.back();
    }, 500);
  }
}
