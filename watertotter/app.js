// WaterTotter page: the rising bubbles behind the hero.
(() => {
    const bubbles = document.querySelector(".bubbles");
    if (!bubbles || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (let i = 0; i < 22; i++) {
        const bubble = document.createElement("span");
        bubble.style.setProperty("--x", `${Math.random() * 100}%`);
        bubble.style.setProperty("--s", `${6 + Math.random() * 22}px`);
        bubble.style.setProperty("--dur", `${10 + Math.random() * 14}s`);
        bubble.style.setProperty("--delay", `${-Math.random() * 20}s`);
        bubble.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
        bubbles.appendChild(bubble);
    }
})();
