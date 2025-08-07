document.querySelectorAll('.tab-link').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const tabId = button.getAttribute('data-tab');
    document.querySelectorAll('.tutorial-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
  });
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    faqItem.classList.toggle('open');
  });
});

document.getElementById('copy-script-button')?.addEventListener('click', async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/veriepicc/Serenity-Bloxd/main/dist/Serenity.js');
    const script = await response.text();
    await navigator.clipboard.writeText(script);
    alert('Script copied to clipboard!');
  } catch (err) {
    console.error('Copy failed:', err);
    alert('Failed to copy script.');
  }
});
