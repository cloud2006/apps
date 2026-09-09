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

    // Initialize gallery scroll listeners for indicators
    initGalleryIndicators("habitsflow-gallery");
    initGalleryIndicators("water-gallery");
});

// Setup active dot and counter for a gallery
function initGalleryIndicators(galleryId) {
    const container = document.getElementById(galleryId);
    if (!container) return;

    const counter = document.getElementById(`${galleryId}-counter`);
    const dotsContainer = document.getElementById(`${galleryId}-dots`);
    const items = container.querySelectorAll(".screen-item");
    const total = items.length;

    let debounceTimer;
    container.addEventListener("scroll", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const scrollLeft = container.scrollLeft;
            const itemWidth = items[0]?.offsetWidth || 1;
            const activeIndex = Math.round(scrollLeft / itemWidth);
            const clampedIndex = Math.max(0, Math.min(activeIndex, total - 1));

            // Update counter
            if (counter) {
                counter.textContent = `${clampedIndex + 1} / ${total}`;
            }

            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll(".dot");
                dots.forEach((dot, idx) => {
                    dot.classList.toggle("active", idx === clampedIndex);
                });
            }
        }, 30);
    }, { passive: true });
}

// Scroll Gallery (Next / Prev)
function scrollGallery(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isMobile = window.innerWidth <= 640;
    const item = container.querySelector(".screen-item");
    const scrollStep = isMobile ? (item?.offsetWidth || container.clientWidth) : 240;

    container.scrollBy({
        left: direction * scrollStep,
        behavior: "smooth"
    });
}

// Jump to specific slide (Dot click)
function goToSlide(containerId, slideIndex) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = container.querySelectorAll(".screen-item");
    if (items[slideIndex]) {
        const itemLeft = items[slideIndex].offsetLeft - container.offsetLeft;
        container.scrollTo({
            left: itemLeft,
            behavior: "smooth"
        });
    }
}

// Lightbox Modal Handling
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

function openLightbox(src, alt) {
    const box = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    if (box && img) {
        img.src = src;
        img.alt = alt || "App screenshot preview";
        box.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeLightbox(e) {
    const box = document.getElementById("lightbox");
    if (!e || e.target === box || e.target.classList.contains("lightbox-close")) {
        box?.classList.remove("active");
        document.body.style.overflow = "";
    }
}

document.addEventListener("keydown", (e) => {
    const box = document.getElementById("lightbox");
    if (e.key === "Escape" && box?.classList.contains("active")) {
        closeLightbox();
    }
});

// Copy Email Function
function copyEmail() {
    const email = "dev.pavlo.antoniuk@gmail.com";
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
