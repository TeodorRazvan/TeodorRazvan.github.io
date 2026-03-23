// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all sections and project cards
document.querySelectorAll('section, .project-card').forEach(el => {
  observer.observe(el);
});

// Add typing effect to subtitle
const subtitle = document.querySelector('.subtitle');
if (subtitle) {
  const text = subtitle.textContent;
  subtitle.textContent = '';
  let i = 0;
  
  function typeWriter() {
    if (i < text.length) {
      subtitle.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  }
  
  setTimeout(typeWriter, 500);
}

// Project card tilt effect (reduced tilt amount)
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 50; // Reduced from 20 to 50
    const rotateY = (centerX - x) / 50; // Reduced from 20 to 50
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// Skill pills animation on hover
const skillPills = document.querySelectorAll('.skill-pill');

skillPills.forEach(pill => {
  pill.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1) rotate(2deg)';
  });
  
  pill.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1) rotate(0deg)';
  });
});

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #00f5ff, #7c3aed);
  width: 0%;
  z-index: 9999;
  transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

// Mobile menu toggle
function createMobileMenu() {
  const nav = document.querySelector('nav');
  const navLinks = document.querySelector('.nav-links');
  
  // Check if hamburger already exists
  if (document.querySelector('.hamburger')) return;
  
  const hamburger = document.createElement('div');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  hamburger.style.cssText = `
    display: none;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
  `;
  
  const spans = hamburger.querySelectorAll('span');
  spans.forEach(span => {
    span.style.cssText = `
      width: 25px;
      height: 3px;
      background: #00f5ff;
      border-radius: 2px;
      transition: all 0.3s ease;
    `;
  });
  
  if (window.innerWidth <= 768) {
    hamburger.style.display = 'flex';
  }
  
  nav.appendChild(hamburger);
  
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-active');
    hamburger.classList.toggle('active');
    
    if (hamburger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
  
  // Close menu when clicking on a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-active');
      hamburger.classList.remove('active');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

window.addEventListener('resize', () => {
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    if (window.innerWidth <= 768) {
      hamburger.style.display = 'flex';
    } else {
      hamburger.style.display = 'none';
      document.querySelector('.nav-links').classList.remove('mobile-active');
    }
  }
});

createMobileMenu();