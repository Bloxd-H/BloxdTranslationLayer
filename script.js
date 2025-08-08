document.addEventListener("DOMContentLoaded", () => {
    // FAQアコーディオン
    document.querySelectorAll(".faq-question").forEach((btn) => {
        btn.addEventListener("click", () => {
            const answer = btn.nextElementSibling;
            answer.style.display =
                answer.style.display === "block" ? "none" : "block";
            btn.querySelector("i").classList.toggle("fa-chevron-down");
            btn.querySelector("i").classList.toggle("fa-chevron-up");
        });
    });
});
