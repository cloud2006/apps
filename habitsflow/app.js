// HabitsFlow page: live Today screen, week grid, focus timer, schedule chips
// and the theme switch in the Appearance tile.
(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Header date and greeting, like the app
    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    document.querySelectorAll("[data-today-label]").forEach((el) => {
        el.textContent = dateLabel;
    });

    const hour = now.getHours();
    const greeting =
        hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : hour < 22 ? "Good evening" : "Good night";
    document.querySelectorAll("[data-greeting]").forEach((el) => {
        el.textContent = greeting;
    });

    // Monday-based index of today (0 = Monday … 6 = Sunday)
    const todayIndex = (now.getDay() + 6) % 7;

    // ---------- Today screen ----------
    const screen = document.getElementById("todayScreen");
    if (screen) {
        const habits = [...screen.querySelectorAll(".hf-habit")];
        const ring = document.getElementById("todayRing");
        const doneEl = document.getElementById("todayDone");
        const leftEl = document.getElementById("todayLeft");
        const progressCard = screen.querySelector(".hf-progress");
        const ringLength = 113.1;

        // Mini week rings: today is highlighted, the days after it haven't happened yet
        const weekDays = [...screen.querySelectorAll(".hf-weekrow span")];
        weekDays.forEach((day, i) => {
            day.classList.toggle("is-today", i === todayIndex);
            if (i > todayIndex) day.querySelector("b").style.setProperty("--p", 0);
        });
        const todayMini = weekDays[todayIndex]?.querySelector("b");

        const burst = () => {
            if (reduceMotion) return;
            const screenRect = screen.getBoundingClientRect();
            const ringRect = screen.querySelector(".hf-ring").getBoundingClientRect();
            const originX = ringRect.left + ringRect.width / 2 - screenRect.left;
            const originY = ringRect.top + ringRect.height / 2 - screenRect.top;
            const colors = ["--h-green", "--h-orange", "--h-red", "--h-magenta", "--h-violet", "--h-blue"];

            for (let i = 0; i < 18; i++) {
                const dot = document.createElement("span");
                const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
                const distance = 50 + Math.random() * 70;
                dot.className = "hf-burst";
                dot.style.left = `${originX}px`;
                dot.style.top = `${originY}px`;
                dot.style.setProperty("--c", `var(${colors[i % colors.length]})`);
                dot.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
                dot.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
                dot.addEventListener("animationend", () => dot.remove());
                screen.appendChild(dot);
            }
        };

        const render = (justChecked) => {
            const done = habits.filter((habit) => habit.getAttribute("aria-pressed") === "true").length;
            const left = habits.length - done;
            const progress = done / habits.length;

            ring.style.strokeDashoffset = String(ringLength * (1 - progress));
            doneEl.textContent = String(done);
            leftEl.textContent = left === 0 ? "All done for today" : `${left} habit${left === 1 ? "" : "s"} to go`;
            todayMini?.style.setProperty("--p", progress);
            progressCard.classList.toggle("is-complete", left === 0);
            if (justChecked && left === 0) burst();
        };

        habits.forEach((habit) => {
            habit.addEventListener("click", () => {
                const isOn = habit.getAttribute("aria-pressed") !== "true";
                habit.setAttribute("aria-pressed", String(isOn));
                render(isOn);
            });
        });
        render(false);
    }

    // ---------- Week grid: tap cycles empty → done → skipped ----------
    const weekGrid = document.getElementById("weekGrid");
    if (weekGrid) {
        const states = ["empty", "done", "skip"];
        const stateLabels = { empty: "not marked", done: "done", skip: "skipped" };
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        weekGrid.querySelectorAll(".week-days span").forEach((day, i) => {
            day.classList.toggle("is-today", i === todayIndex);
        });

        weekGrid.querySelectorAll(".week-row").forEach((row) => {
            const cells = [...row.querySelectorAll(".week-cells button")];
            const countEl = row.querySelector(".week-count");

            const update = () => {
                countEl.textContent = `${cells.filter((cell) => cell.dataset.state === "done").length}/7`;
                cells.forEach((cell, i) => {
                    const state = cell.disabled ? "upcoming" : stateLabels[cell.dataset.state];
                    cell.setAttribute("aria-label", `${row.dataset.habit}, ${dayNames[i]}: ${state}`);
                });
            };

            cells.forEach((cell, i) => {
                cell.type = "button";
                if (i > todayIndex) {
                    cell.dataset.state = "empty";
                    cell.disabled = true;
                }
                cell.addEventListener("click", () => {
                    cell.dataset.state = states[(states.indexOf(cell.dataset.state) + 1) % states.length];
                    update();
                });
            });
            update();
        });
    }

    // ---------- Focus timer (a real 25-minute Pomodoro) ----------
    const focusBtn = document.getElementById("focusBtn");
    if (focusBtn) {
        const timeEl = document.getElementById("focusTime");
        const focusRing = document.getElementById("focusRing");
        const ringLength = 326.73;
        const total = 25 * 60;
        let remaining = total;
        let timer = null;

        const renderFocus = () => {
            const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
            const seconds = String(remaining % 60).padStart(2, "0");
            timeEl.textContent = `${minutes}:${seconds}`;
            focusRing.style.strokeDashoffset = String(ringLength * (1 - remaining / total));
        };

        const stop = (label) => {
            clearInterval(timer);
            timer = null;
            focusBtn.textContent = label;
            focusBtn.classList.remove("is-running");
        };

        focusBtn.addEventListener("click", () => {
            if (timer) {
                stop("Resume");
                return;
            }
            if (remaining === 0) remaining = total;
            renderFocus();
            focusBtn.textContent = "Pause";
            focusBtn.classList.add("is-running");
            timer = setInterval(() => {
                remaining -= 1;
                renderFocus();
                if (remaining === 0) stop("Start again");
            }, 1000);
        });
    }

    // ---------- Schedule chips ----------
    const schedule = document.getElementById("schedule");
    if (schedule) {
        const chips = [...schedule.querySelectorAll(".day-chips button")];
        const countEl = document.getElementById("scheduleCount");

        const renderCount = () => {
            const count = chips.filter((chip) => chip.getAttribute("aria-pressed") === "true").length;
            countEl.textContent = count === 7 ? "Every day" : count === 0 ? "Pick some days" : `${count} day${count === 1 ? "" : "s"} a week`;
        };

        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
                renderCount();
            });
        });

        schedule.querySelectorAll("[data-days]").forEach((preset) => {
            preset.addEventListener("click", () => {
                chips.forEach((chip, i) => chip.setAttribute("aria-pressed", String(preset.dataset.days.includes(String(i)))));
                renderCount();
            });
        });
        renderCount();
    }

    // ---------- Appearance tile drives the page theme ----------
    const themeChoices = document.querySelectorAll("[data-theme-choice]");
    if (themeChoices.length && window.appPage) {
        const syncChoice = () => {
            const choice = root.dataset.theme || "auto";
            themeChoices.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === choice)));
        };

        themeChoices.forEach((btn) => {
            btn.addEventListener("click", () => {
                const choice = btn.dataset.themeChoice;
                window.appPage.setTheme(choice === "auto" ? null : choice);
            });
        });
        root.addEventListener("themechange", syncChoice);
        syncChoice();
    }
})();
