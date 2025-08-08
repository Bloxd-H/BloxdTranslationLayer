document.addEventListener('DOMContentLoaded', () => {
  // Copy Script Button
  const copyBtn = document.getElementById('copy-script-button');
  if (copyBtn) {
    const serenityScript = `// Paste your Serenity script content here
console.log('Serenity script copied!');`;

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(serenityScript).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Script';
        }, 2000);
      }).catch(() => {
        alert('Failed to copy. Please copy manually.');
      });
    });
  }

  // FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      question.classList.toggle('active');
      const answer = question.nextElementSibling;
      if (answer.classList.contains('open')) {
        answer.classList.remove('open');
      } else {
        answer.classList.add('open');
      }
    });
  });
});
