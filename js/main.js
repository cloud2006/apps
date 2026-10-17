document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    navToggle?.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        navToggle.textContent = isOpen ? "✕" : "☰";
    });

    // Close mobile menu on clicking any navigation link
    navMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            navToggle?.setAttribute("aria-expanded", "false");
            if (navToggle) navToggle.textContent = "☰";
        });
    });

    // Auto-update footer year
    const yearElem = document.getElementById("year");
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }
});

// Copy Email Function
function copyEmail() {
    const email = "support@antcraft.dev";
    navigator.clipboard.writeText(email).then(() => {
        const btn = document.getElementById("copyBtn");
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "Copied!";
            btn.style.background = "rgba(52, 211, 153, 0.2)";
            btn.style.color = "#34d399";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "";
                btn.style.color = "";
            }, 2000);
        }
    });
}
