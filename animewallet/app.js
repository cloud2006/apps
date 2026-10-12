// AnimeWallet page: the greeting and the night sky.
(() => {
    const random = (min, max) => min + Math.random() * (max - min);

    // Greeting, like the app's Home ("GOOD EVENING")
    const hour = new Date().getHours();
    const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    document.querySelectorAll("[data-greeting]").forEach((el) => {
        el.textContent = greeting;
    });

    // Sky: stars come out at night, gold sparkles stay by day
    const sky = document.querySelector(".sky");
    if (!sky) return;

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
})();
