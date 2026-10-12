// Shared behaviour for the per-app mini-sites: footer year, theme toggle,
// scroll reveal, screenshot carousels and the screenshot lightbox.
(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Footer year
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    // Theme toggle — pages that support both themes set data-theme-key on <html>
    // and restore the saved choice with a tiny inline script in <head>.
    const themeKey = root.dataset.themeKey;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
    const toggles = document.querySelectorAll("[data-theme-toggle]");

    const syncToggles = () => {
        const isDark = currentTheme() === "dark";
        toggles.forEach((btn) => {
            btn.dataset.state = isDark ? "dark" : "light";
            btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
        });
    };

    const setTheme = (theme) => {
        root.dataset.theme = theme;
        try {
            if (themeKey) localStorage.setItem(themeKey, theme);
        } catch (e) {
            // Storage can be unavailable (private mode); the theme still applies for this visit.
        }
        syncToggles();
    };

    toggles.forEach((btn) => {
        btn.addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark"));
    });
    darkQuery.addEventListener("change", syncToggles);
    if (themeKey) syncToggles();

    // Scroll reveal
    const revealEls = document.querySelectorAll("[data-reveal]");
    if (!reduceMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    // Section tabs: highlight the [data-section-link] whose [data-section] crosses the middle of the viewport
    const sectionLinks = document.querySelectorAll("[data-section-link]");
    if (sectionLinks.length && "IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    sectionLinks.forEach((link) => {
                        const isActive = link.dataset.sectionLink === entry.target.id;
                        link.classList.toggle("is-active", isActive);
                        if (isActive) link.setAttribute("aria-current", "true");
                        else link.removeAttribute("aria-current");
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        document.querySelectorAll("[data-section]").forEach((section) => sectionObserver.observe(section));
    }

    // Screenshot carousels: prev / next buttons point at a .shots track via data-scroll-target
    document.querySelectorAll(".shots").forEach((track) => {
        const buttons = document.querySelectorAll(`[data-scroll-target="${track.id}"]`);
        if (!buttons.length) return;

        const updateButtons = () => {
            const maxScroll = track.scrollWidth - track.clientWidth - 2;
            // Nothing to scroll (every screenshot already fits): hide the arrows
            buttons[0].closest(".shots-nav")?.toggleAttribute("hidden", maxScroll <= 0);
            buttons.forEach((btn) => {
                btn.disabled = Number(btn.dataset.dir) < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= maxScroll;
            });
        };

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const item = track.querySelector(".shot");
                const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
                const step = item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
                track.scrollBy({ left: Number(btn.dataset.dir) * step, behavior: reduceMotion ? "auto" : "smooth" });
            });
        });

        track.addEventListener("scroll", updateButtons, { passive: true });
        window.addEventListener("resize", updateButtons);
        updateButtons();
    });

    // Lightbox: any [data-lightbox="group"] trigger opens its image; arrows walk the group
    const dialog = document.querySelector("dialog.lightbox");
    if (!dialog) return;

    const dialogImg = dialog.querySelector("img");
    const dialogCaption = dialog.querySelector("figcaption");
    let group = [];
    let index = 0;

    const show = (i) => {
        index = (i + group.length) % group.length;
        const trigger = group[index];
        const thumb = trigger.querySelector("img");
        dialogImg.src = trigger.dataset.full || thumb.currentSrc || thumb.src;
        dialogImg.alt = thumb.alt;
        dialogCaption.textContent = trigger.dataset.caption || thumb.alt;
    };

    document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            group = [...document.querySelectorAll(`[data-lightbox="${trigger.dataset.lightbox}"]`)];
            show(group.indexOf(trigger));
            dialog.showModal();
        });
    });

    // The figure ignores pointer events, so a click anywhere but the image or buttons lands on the dialog
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) dialog.close();
    });
    dialog.querySelector("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());
    dialog.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => show(index - 1));
    dialog.querySelector("[data-lightbox-next]")?.addEventListener("click", () => show(index + 1));
    dialog.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
    });
})();
