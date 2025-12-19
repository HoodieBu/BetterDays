// ===== Floating Header Scroll Logic (with Logo Swap) =====
window.addEventListener("scroll", () => {
  const header = document.getElementById("mainHeader");
  const logo = document.getElementById("headerLogo");

  if (window.scrollY > 60) {
    header.classList.add("scrolled");
    logo.setAttribute("src", "/Images/HeaderImage2.png");
  } else {
    header.classList.remove("scrolled");
    logo.setAttribute("src", "/Images/DefaultHeaderImage.png");
  }
});




const disorders = document.querySelectorAll('.disorder');

window.addEventListener('scroll', () => {
  const triggerBottom = window.innerHeight * 0.85; // reveal when 85% in view

  disorders.forEach((d, i) => {
    const top = d.getBoundingClientRect().top;

    if (top < triggerBottom && !d.classList.contains('visible')) {
      setTimeout(() => {
        d.classList.add('visible');
      }, i * 120); // staggered delay
    }
  });
});

function scrollToResources() {
  const target = document.getElementById('resources');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  } else {
    alert('Resources section coming soon!');
  }
}

// ===== Particles Background =====
const canvas = document.getElementById('particles-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const section = document.querySelector('.spotlight-section');
  canvas.width = section.offsetWidth;
  canvas.height = section.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];
const particleCount = 60;
const connectDistance = 140; // make the web a bit wider

for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    baseAlpha: Math.random() * 0.3 + 0.4,
    pulseSpeed: Math.random() * 0.02 + 0.005,
    pulseOffset: Math.random() * Math.PI * 2,
  });
}

function drawParticles(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connectDistance) {
        const alpha = 0.25 * (1 - dist / connectDistance);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(37,99,235,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => {
    const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.25 + 0.75;
    const alpha = p.baseAlpha * pulse;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59,130,246,${alpha})`;
    ctx.fill();
  });
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
}

function animateParticles(time = 0) {
  drawParticles(time / 1000);
  updateParticles();
  requestAnimationFrame(animateParticles);
}

animateParticles();

function openResources() {
  window.location.href = "resources.html";
}

// ===== Fade-in Scroll Animations =====
const fadeEls = document.querySelectorAll('.fade-in-left, .fade-in-right, .fade-in-up');

function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  fadeEls.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerBottom) el.classList.add('visible');
  });
}
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// ===== Doughnut Charts =====
const depressionChart = new Chart(document.getElementById('chartDepression'), {
  type: 'doughnut',
  data: {
    labels: ['Adults Experiencing Depression', 'Others'],
    datasets: [{
      data: [21, 79],
      backgroundColor: ['#93C5FD', '#2563EB'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  },
  options: {
    cutout: '70%',
    rotation: -90,
    circumference: 360,
    plugins: { legend: { display: false } },
    animation: { animateRotate: true, duration: 1800 }
  }
});

const suicideChart = new Chart(document.getElementById('chartSuicide'), {
  type: 'doughnut',
  data: {
    labels: ['Suicide Deaths (per 100k)', 'Other Population'],
    datasets: [{
      data: [14.3, 85.7],
      backgroundColor: ['#FCA5A5', '#93C5FD'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  },
  options: {
    cutout: '70%',
    rotation: -90,
    circumference: 360,
    plugins: { legend: { display: false } },
    animation: { animateRotate: true, duration: 1800 }
  }
});

// ===== Count-Up Animations =====
function animateValue(element, start, end, duration, suffix = '') {
  let startTime = null;
  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = start + (end - start) * progress;
    element.textContent = suffix ? value.toFixed(1) + suffix : value.toFixed(1);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let depressionAnimated = false;
let suicideAnimated = false;

function triggerCountups() {
  const triggerBottom = window.innerHeight * 0.85;

  const depressionCanvas = document.getElementById('chartDepression').getBoundingClientRect().top;
  const suicideCanvas = document.getElementById('chartSuicide').getBoundingClientRect().top;

  if (!depressionAnimated && depressionCanvas < triggerBottom) {
    animateValue(document.getElementById('depressionLabel'), 0, 21, 1500, '%');
    depressionAnimated = true;
  }

  if (!suicideAnimated && suicideCanvas < triggerBottom) {
    animateValue(document.getElementById('suicideLabel'), 0, 14.3, 1500);
    suicideAnimated = true;
  }
}

window.addEventListener('scroll', triggerCountups);
triggerCountups();

// ===== Online Counseling Chat Animation =====
const counselingSection = document.getElementById('counseling');
const messages = counselingSection.querySelectorAll('.message');
const typingBubbles = counselingSection.querySelectorAll('.typing');
let isAnimating = false;
let chatPlayed = false;

function playChatAnimation() {
  if (isAnimating) return;
  isAnimating = true;

  messages.forEach(msg => {
    msg.style.animation = 'none';
    msg.style.opacity = '0';
    msg.style.transform = 'translateY(30px)';
  });
  typingBubbles.forEach(bubble => {
    bubble.style.display = 'none';
  });

  let delay = 0;

  messages.forEach((msg, i) => {
    const isCounselor = msg.classList.contains('counselor');
    const typing = msg.previousElementSibling;

    if (isCounselor && typing?.classList.contains('typing')) {
      setTimeout(() => {
        typing.style.display = 'flex';
      }, delay);

      delay += 1200;

      setTimeout(() => {
        typing.style.display = 'none';
        msg.style.animation = 'slideInStay 1.2s ease forwards';
      }, delay);
    } else {
      setTimeout(() => {
        msg.style.animation = 'slideInStay 1.2s ease forwards';
      }, delay);
    }

    delay += 1200;
  });

  setTimeout(() => {
    isAnimating = false;
  }, delay + 1000);
}

function handleScroll() {
  const rect = counselingSection.getBoundingClientRect();
  const triggerBottom = window.innerHeight * 0.85;

  if (!chatPlayed && rect.top < triggerBottom && rect.bottom > 100) {
    playChatAnimation();
    chatPlayed = true;
  }
}

window.addEventListener('scroll', handleScroll);
handleScroll();

// ===== "Together We Grow" Scroll Animation =====
const growSection = document.querySelector(".grow-section");
const growText = growSection.querySelector(".grow-text");
const growImage = growSection.querySelector(".grow-image");
const growWords = growSection.querySelectorAll("h2 span");
let growAnimated = false;

function revealGrow() {
  const rect = growSection.getBoundingClientRect();
  const triggerBottom = window.innerHeight * 0.85;

  if (!growAnimated && rect.top < triggerBottom) {
    growText.classList.add("visible");
    growImage.classList.add("visible");

    growWords.forEach((word, i) => {
      word.style.animationDelay = `${i * 0.35}s`;
      word.style.animationPlayState = "running";
    });

    setTimeout(() => {
      growText.classList.add("show-details");
    }, 1400);

    growAnimated = true;
  }
}

window.addEventListener("scroll", revealGrow);

// ===== Letters from the Heart (Sequential Typing) =====
const letters = document.querySelectorAll('.letter');
window.addEventListener('scroll', () => {
  const trigger = window.innerHeight * 0.85;
  letters.forEach((letter, i) => {
    const top = letter.getBoundingClientRect().top;
    if (top < trigger) {
      setTimeout(() => {
        letter.classList.add('visible');
      }, i * 300);
    }
  });
});

const typedTexts = document.querySelectorAll('.typed-text');
let currentLetterIndex = 0;
let typing = false;

function typeSequentially(element, text, callback) {
  let i = 0;
  element.textContent = '';
  typing = true;

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, 35);
    } else {
      element.classList.add('done');
      typing = false;
      if (callback) callback();
    }
  }
  type();
}

function startTypingSequence() {
  if (typing || currentLetterIndex >= typedTexts.length) return;
  const current = typedTexts[currentLetterIndex];
  const fullText = current.getAttribute('data-text');

  typeSequentially(current, fullText, () => {
    currentLetterIndex++;
    if (currentLetterIndex < typedTexts.length) {
      setTimeout(startTypingSequence, 600);
    }
  });
}

const lettersSection = document.querySelector('.letters-section');
const sectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    startTypingSequence();
    sectionObserver.disconnect();
  }
}, { threshold: 0.4 });

sectionObserver.observe(lettersSection);

// ===== Echo Timeline Animation =====
const echoSection = document.querySelector('.echo-timeline');
const echoWords = document.querySelectorAll('.echo-word');
let echoPlayed = false;

function revealEchoTimeline() {
  const rect = echoSection.getBoundingClientRect();
  const triggerBottom = window.innerHeight * 0.85;

  if (!echoPlayed && rect.top < triggerBottom) {
    echoSection.classList.add('visible');
    echoWords.forEach((word, i) => {
      setTimeout(() => {
        word.classList.add('visible');
      }, i * 600);
    });
    echoPlayed = true;
  }
}

window.addEventListener('scroll', revealEchoTimeline);
revealEchoTimeline();

function openTestimonials() {
  window.location.href = "testimonials.html";
}

