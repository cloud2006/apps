// WaterTotter page: the glass on the Home screen, the adaptive goal calculator,
// the reminder timeline and the rising bubbles.
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ML_PER_OZ = 29.5735;

    // Date in the app's format: "11 October 2026"
    const todayLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    document.querySelectorAll("[data-today]").forEach((el) => {
        el.textContent = todayLabel;
    });

    // ---------- Rising bubbles ----------
    const bubbles = document.querySelector(".bubbles");
    if (bubbles && !reduceMotion) {
        for (let i = 0; i < 22; i++) {
            const bubble = document.createElement("span");
            bubble.style.setProperty("--x", `${Math.random() * 100}%`);
            bubble.style.setProperty("--s", `${6 + Math.random() * 22}px`);
            bubble.style.setProperty("--dur", `${10 + Math.random() * 14}s`);
            bubble.style.setProperty("--delay", `${-Math.random() * 20}s`);
            bubble.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
            bubbles.appendChild(bubble);
        }
    }

    // Single-choice pill groups (.seg): mark the pressed button and report its index
    const bindSeg = (seg, onChange) => {
        const buttons = [...seg.querySelectorAll("button")];
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === btn)));
                onChange(btn);
            });
        });
    };

    // ---------- The glass ----------
    const glass = document.getElementById("glass");
    if (glass) {
        const goalMl = 74 * ML_PER_OZ;
        const percentEl = document.getElementById("percentText");
        const amountEl = document.getElementById("amountText");
        const goalEl = document.getElementById("goalText");
        const unitBtn = document.getElementById("unitBtn");
        const unitLabel = document.getElementById("unitLabel");
        const drinkButtons = [...document.querySelectorAll(".wt-drink[data-amount-oz]")];

        // Today's 42 oz came from these drinks, so Undo has something to take back
        const history = [8, 17, 17].map((oz) => oz * ML_PER_OZ);
        let consumedMl = history.reduce((sum, ml) => sum + ml, 0);
        let unit = "oz";
        let shownPercent = 57;
        let frame = 0;

        const format = (ml) => (unit === "oz" ? `${Math.round(ml / ML_PER_OZ)} OZ` : `${Math.round(ml / 10) * 10} ML`);

        const animatePercent = (target) => {
            cancelAnimationFrame(frame);
            if (reduceMotion) {
                shownPercent = target;
                percentEl.textContent = `${target}%`;
                return;
            }
            const from = shownPercent;
            const start = performance.now();
            const step = (now) => {
                const t = Math.min((now - start) / 700, 1);
                shownPercent = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
                percentEl.textContent = `${shownPercent}%`;
                if (t < 1) frame = requestAnimationFrame(step);
            };
            frame = requestAnimationFrame(step);
        };

        const dropIn = (level) => {
            if (reduceMotion) return;
            const drop = document.createElement("span");
            drop.className = "drop";
            drop.style.setProperty("--land", `${(1 - level) * 100}%`);
            drop.addEventListener("animationend", () => drop.remove());
            glass.appendChild(drop);
        };

        const render = () => {
            const ratio = consumedMl / goalMl;
            const level = Math.min(ratio, 1);
            glass.style.setProperty("--level", level);
            glass.classList.toggle("is-full", ratio >= 1);
            animatePercent(Math.round(ratio * 100));
            amountEl.textContent = format(consumedMl);
            goalEl.textContent = format(goalMl);
            drinkButtons.forEach((btn) => {
                btn.querySelector(".wt-drink-label").textContent = unit === "oz" ? `${btn.dataset.amountOz} OZ` : `${btn.dataset.amountMl} ML`;
            });
            unitLabel.textContent = unit === "oz" ? "ML" : "OZ";
            unitBtn.setAttribute("aria-label", unit === "oz" ? "Switch to milliliters" : "Switch to ounces");
            return level;
        };

        const addDrink = (ml) => {
            history.push(ml);
            consumedMl += ml;
            dropIn(render());
        };

        drinkButtons.forEach((btn) => {
            btn.setAttribute("aria-label", `Log ${btn.dataset.amountOz} ounces`);
            btn.addEventListener("click", () => {
                addDrink(unit === "oz" ? Number(btn.dataset.amountOz) * ML_PER_OZ : Number(btn.dataset.amountMl));
            });
        });

        document.getElementById("sipBtn").addEventListener("click", () => {
            addDrink(unit === "oz" ? 4 * ML_PER_OZ : 100);
        });

        document.getElementById("undoBtn").addEventListener("click", () => {
            if (!history.length) return;
            consumedMl = Math.max(0, consumedMl - history.pop());
            render();
        });

        unitBtn.addEventListener("click", () => {
            unit = unit === "oz" ? "ml" : "oz";
            render();
        });

        render();
    }

    // ---------- Adaptive goal (illustrative numbers) ----------
    const goalDemo = document.getElementById("goalDemo");
    if (goalDemo) {
        const activityExtra = [0, 8, 18];
        const climateExtra = [-4, 0, 12];
        const ozEl = document.getElementById("goalOz");
        const litersEl = document.getElementById("goalMl");
        let activity = 1;
        let climate = 1;

        const renderGoal = () => {
            const oz = 66 + activityExtra[activity] + climateExtra[climate];
            ozEl.textContent = String(oz);
            litersEl.textContent = ((oz * ML_PER_OZ) / 1000).toFixed(1);
        };

        goalDemo.querySelectorAll(".seg").forEach((seg) => {
            bindSeg(seg, (btn) => {
                if (btn.dataset.activity) activity = Number(btn.dataset.activity);
                if (btn.dataset.climate) climate = Number(btn.dataset.climate);
                renderGoal();
            });
        });
        renderGoal();
    }

    // ---------- Reminder timeline (08:00 – 22:00) ----------
    const remindDemo = document.getElementById("remindDemo");
    if (remindDemo) {
        const track = document.getElementById("timelineTrack");
        const countEl = document.getElementById("remindCount");
        const start = 8 * 60;
        const end = 22 * 60;

        const renderTicks = (interval) => {
            track.replaceChildren();
            let count = 0;
            for (let minute = start; minute <= end; minute += interval) {
                const tick = document.createElement("span");
                const label = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
                tick.className = "tick";
                tick.title = label;
                tick.style.left = `${((minute - start) / (end - start)) * 100}%`;
                tick.style.setProperty("--i", count);
                track.appendChild(tick);
                count += 1;
            }
            countEl.textContent = String(count);
        };

        const seg = remindDemo.querySelector(".seg");
        bindSeg(seg, (btn) => renderTicks(Number(btn.dataset.interval)));
        renderTicks(Number(seg.querySelector('[aria-pressed="true"]').dataset.interval));
    }
})();
