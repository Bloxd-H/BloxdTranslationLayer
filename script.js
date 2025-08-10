document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a.nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
            });
            if (!isActive) item.classList.add('active');
        });
    });

    const faders = document.querySelectorAll('.fade-in');
    const options = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, options);

    faders.forEach(fader => {
        observer.observe(fader);
    });

    faders.forEach(fader => {
        const rect = fader.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            fader.classList.add('visible');
            observer.unobserve(fader);
        }
    });
});

const copyButton = document.getElementById('copyButton');

copyButton.addEventListener('click', () => {
  const textToCopy = `npm install
node index.js`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 1500);
  }).catch(() => {
    copyButton.textContent = 'Failed to copy';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 1500);
  });
});


const noticeBar = document.getElementById('noticeBar');
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    noticeBar.classList.add('hidden');
    navbar.style.top = '0';
  } else {
    noticeBar.classList.remove('hidden');
    navbar.style.top = noticeBar.offsetHeight + 'px';
  }
});

navbar.style.top = noticeBar.offsetHeight + 'px';
