document.addEventListener("DOMContentLoaded", () => {
    // Auto-update footer year
    const yearElem = document.getElementById("year");
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }

    // Auto-update effective date if element exists
    const dateElem = document.getElementById("effective-date");
    if (dateElem && !dateElem.textContent.trim()) {
        dateElem.textContent = new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
});
