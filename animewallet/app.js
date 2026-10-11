// AnimeWallet page: greeting, night sky, the "+1 episode" card, list tabs,
// detail-card buttons and the day / night scenes.
(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = (min, max) => min + Math.random() * (max - min);

    // Greeting, like the app's Home ("GOOD EVENING")
    const hour = new Date().getHours();
    const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    document.querySelectorAll("[data-greeting]").forEach((el) => {
        el.textContent = greeting;
    });

    // ---------- Sky: stars come out at night, gold sparkles stay by day ----------
    const sky = document.querySelector(".sky");
    if (sky) {
        const starsLayer = document.createElement("div");
        starsLayer.className = "stars-layer";
        for (let i = 0; i < 70; i++) {
            const star = document.createElement("span");
            star.className = "star";
            star.style.setProperty("--x", `${random(0, 100)}%`);
            star.style.setProperty("--y", `${random(0, 100)}%`);
            star.style.setProperty("--s", `${random(1, 2.6)}px`);
            star.style.setProperty("--d", `${random(2.5, 6)}s`);
            star.style.setProperty("--delay", `${-random(0, 6)}s`);
            starsLayer.appendChild(star);
        }
        sky.prepend(starsLayer);

        for (let i = 0; i < 9; i++) {
            const sparkle = document.createElement("span");
            sparkle.className = "sparkle";
            sparkle.style.setProperty("--x", `${random(2, 96)}%`);
            sparkle.style.setProperty("--y", `${random(4, 70)}%`);
            sparkle.style.setProperty("--s", `${random(8, 15)}px`);
            sparkle.style.setProperty("--d", `${random(3, 7)}s`);
            sparkle.style.setProperty("--delay", `${-random(0, 7)}s`);
            sky.appendChild(sparkle);
        }
    }

    // ---------- Continue watching: +1 episode ----------
    const card = document.getElementById("watchCard");
    if (card) {
        const total = 12;
        let episode = 2;
        const progress = document.getElementById("watchProgress");
        const episodeEl = document.getElementById("watchEp");
        const button = document.getElementById("plusOne");

        const burst = () => {
            if (reduceMotion) return;
            const cardRect = card.getBoundingClientRect();
            const btnRect = button.getBoundingClientRect();
            const x = btnRect.left + btnRect.width / 2 - cardRect.left;
            const y = btnRect.top + btnRect.height / 2 - cardRect.top;
            const colors = ["var(--sun)", "var(--violet)", "var(--pink)", "var(--leaf)", "var(--steel)"];

            for (let i = 0; i < 14; i++) {
                const spark = document.createElement("span");
                const angle = (Math.PI * 2 * i) / 14;
                const distance = random(40, 90);
                spark.className = "spark";
                spark.style.left = `${x}px`;
                spark.style.top = `${y}px`;
                spark.style.setProperty("--c", colors[i % colors.length]);
                spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
                spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
                spark.addEventListener("animationend", () => spark.remove());
                card.appendChild(spark);
            }
        };

        const render = () => {
            const isDone = episode >= total;
            progress.style.setProperty("--v", episode / total);
            progress.setAttribute("aria-valuenow", String(episode));
            card.classList.toggle("is-complete", isDone);
            episodeEl.textContent = isDone ? `Completed · ${total} of ${total}` : `Episode ${episode} of ${total}`;
            button.textContent = isDone ? "↺" : "+1";
            button.setAttribute("aria-label", isDone ? "Watch again from episode 1" : "Mark next episode as watched");
        };

        button.addEventListener("click", () => {
            if (episode >= total) {
                episode = 1;
            } else {
                episode += 1;
                if (episode === total) burst();
            }
            render();
        });
        render();
    }

    // ---------- My Lists tabs ----------
    const tabs = [...document.querySelectorAll('.lists-card [role="tab"]')];
    const selectTab = (tab) => {
        tabs.forEach((other) => {
            const isSelected = other === tab;
            other.setAttribute("aria-selected", String(isSelected));
            other.tabIndex = isSelected ? 0 : -1;
            document.getElementById(other.getAttribute("aria-controls")).hidden = !isSelected;
        });
    };
    tabs.forEach((tab, i) => {
        tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
        tab.addEventListener("click", () => selectTab(tab));
        tab.addEventListener("keydown", (e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
            selectTab(next);
            next.focus();
        });
    });

    // ---------- Detail card buttons ----------
    const libraryBtn = document.getElementById("libraryBtn");
    libraryBtn?.addEventListener("click", () => {
        const isOn = libraryBtn.getAttribute("aria-pressed") !== "true";
        libraryBtn.setAttribute("aria-pressed", String(isOn));
        libraryBtn.querySelector("use").setAttribute("href", isOn ? "#i-check" : "#i-plus");
        libraryBtn.querySelector("span").textContent = isOn ? "In library" : "Add to library";
    });

    const watchedBtn = document.getElementById("watchedBtn");
    watchedBtn?.addEventListener("click", () => {
        watchedBtn.setAttribute("aria-pressed", String(watchedBtn.getAttribute("aria-pressed") !== "true"));
    });

    const collectionBtn = document.getElementById("collectionBtn");
    const picker = document.getElementById("collectionPicker");
    if (collectionBtn && picker) {
        const options = [...picker.querySelectorAll("button")];
        const label = collectionBtn.querySelector("span");

        collectionBtn.addEventListener("click", () => {
            const isOpen = collectionBtn.getAttribute("aria-expanded") !== "true";
            collectionBtn.setAttribute("aria-expanded", String(isOpen));
            picker.hidden = !isOpen;
        });

        options.forEach((option) => {
            option.addEventListener("click", () => {
                option.setAttribute("aria-pressed", String(option.getAttribute("aria-pressed") !== "true"));
                const chosen = options.filter((o) => o.getAttribute("aria-pressed") === "true");
                label.textContent =
                    chosen.length === 0 ? "Add to a collection" : chosen.length === 1 ? `In “${chosen[0].textContent}”` : `In ${chosen.length} collections`;
            });
        });
    }

    // ---------- Day / night scenes switch the page theme ----------
    const scenes = document.querySelectorAll("[data-scene]");
    if (scenes.length && window.appPage) {
        const syncScenes = () => {
            const theme = window.appPage.currentTheme();
            scenes.forEach((scene) => scene.setAttribute("aria-pressed", String(scene.dataset.scene === theme)));
        };
        scenes.forEach((scene) => {
            scene.addEventListener("click", () => window.appPage.setTheme(scene.dataset.scene));
        });
        root.addEventListener("themechange", syncScenes);
        syncScenes();
    }
})();
