document.addEventListener("DOMContentLoaded", () => {
    // FAQアコーディオン
    document.querySelectorAll(".faq-question").forEach((btn) => {
        btn.addEventListener("click", () => {
            const faqItem = btn.parentElement;
            const answer = faqItem.querySelector(".faq-answer");

            // トグル表示
            if (faqItem.classList.contains("open")) {
                faqItem.classList.remove("open");
                answer.style.maxHeight = null;
            } else {
                // 他を閉じる場合（任意）
                document.querySelectorAll(".faq-item").forEach((item) => {
                    item.classList.remove("open");
                    item.querySelector(".faq-answer").style.maxHeight = null;
                });
                faqItem.classList.add("open");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
