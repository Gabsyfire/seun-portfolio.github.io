// ==========================================
// SMOOTH SCROLL NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Smooth scroll to sections
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ==========================================
  // SCROLL ANIMATIONS
  // ==========================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally, stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with slide-up class
  const slideUpElements = document.querySelectorAll('.slide-up');
  slideUpElements.forEach(el => observer.observe(el));

  // ==========================================
  // NAVBAR SCROLL BEHAVIOR
  // ==========================================
  let lastScrollTop = 0;
  let scrollTimeout;

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add scrolled class when scrolled down
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();

    lastScrollTop = scrollTop;
  };

  // Throttle scroll event for performance
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  });

  // Update active nav link based on current section
  const updateActiveNavLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + header.offsetHeight + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  // ==========================================
  // MOBILE MENU TOGGLE
  // ==========================================
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');

    const isOpen = navMenu.classList.contains('active');
    navToggle.setAttribute('aria-expanded', isOpen);

    // Prevent body scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)) {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close menu with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (skillModalOverlay.classList.contains('active')) {
        closeSkillModal();
      } else if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    }
  });

  // ==========================================
  // CLICKABLE PROJECT CARDS
  // ==========================================
  document.querySelectorAll('.project-card[data-href]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      window.location.href = card.dataset.href;
    });
  });

  // ==========================================
  // SKILL MODAL
  // ==========================================
  const skillData = {
    'power-apps': {
      title: 'Power Apps',
      items: ['Canvas and model-driven app development', 'Custom business apps', 'Responsive mobile apps', 'Data integration with Dataverse and external sources']
    },
    'power-automate': {
      title: 'Power Automate',
      items: ['Cloud flows and automated workflows', 'API integrations', 'Scheduled data sync', 'Error handling and approval processes', 'Email processing automation']
    },
    'dynamics-365': {
      title: 'Dynamics 365',
      items: ['CRM customization', 'Plugin development (C#)', 'Entity configuration and business rules', 'Custom workflows, views, dashboards, and forms']
    },
    'azure': {
      title: 'Azure',
      items: ['VM setup and management', 'Azure Maps integration', 'Azure AD and Intune device management', 'Exchange Online configuration', 'Cloud infrastructure']
    },
    'power-fx': {
      title: 'Power FX',
      items: ['Formula-based logic for canvas apps', 'Calculated fields and data manipulation', 'Conditional formatting', 'Delegation-aware queries']
    },
    'fetchxml': {
      title: 'FetchXML',
      items: ['Advanced Dataverse queries', 'Aggregate queries and linked entity joins', 'Filtered views and pagination', 'Performance-optimized data retrieval']
    },
    'sharepoint': {
      title: 'SharePoint',
      items: ['Site administration', 'Document management and list automation', 'Integration with Power Platform', 'Custom permissions and workflows']
    },
    'javascript': {
      title: 'JavaScript',
      items: ['Form validation in Dynamics 365', 'Web resource development', 'DOM manipulation and API calls', 'Async operations and custom UI logic']
    },
    'powershell': {
      title: 'PowerShell',
      items: ['Scripting for system administration', 'Bulk operations', 'Azure resource management', 'Automated deployments and data migration scripts']
    }
  };

  const skillModalOverlay = document.getElementById('skillModal');
  const skillModalTitle = skillModalOverlay.querySelector('.skill-modal-title');
  const skillModalList = skillModalOverlay.querySelector('.skill-modal-list');
  let lastFocusedSkill = null;

  const openSkillModal = (skillKey) => {
    const data = skillData[skillKey];
    if (!data) return;
    skillModalTitle.textContent = data.title;
    skillModalList.innerHTML = data.items.map(item => `<li>${item}</li>`).join('');
    skillModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    skillModalOverlay.querySelector('.skill-modal-close').focus();
  };

  const closeSkillModal = () => {
    skillModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocusedSkill) lastFocusedSkill.focus();
  };

  document.querySelectorAll('.skill-badge[data-skill]').forEach(badge => {
    badge.addEventListener('click', () => {
      lastFocusedSkill = badge;
      openSkillModal(badge.dataset.skill);
    });
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastFocusedSkill = badge;
        openSkillModal(badge.dataset.skill);
      }
    });
  });

  skillModalOverlay.querySelector('.skill-modal-close').addEventListener('click', closeSkillModal);
  skillModalOverlay.addEventListener('click', (e) => {
    if (e.target === skillModalOverlay) closeSkillModal();
  });

  // ==========================================
  // FORM VALIDATION
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formMessage = document.querySelector('.form-message');

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isSubmitting = false;

  // Validation functions
  const validateName = () => {
    const name = nameInput.value.trim();
    const formGroup = nameInput.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');

    if (name === '') {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Name is required';
      return false;
    } else if (name.length < 2) {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Name must be at least 2 characters';
      return false;
    } else {
      formGroup.classList.remove('error');
      errorMessage.textContent = '';
      return true;
    }
  };

  const validateEmail = () => {
    const email = emailInput.value.trim();
    const formGroup = emailInput.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');

    if (email === '') {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Email is required';
      return false;
    } else if (!emailRegex.test(email)) {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Please enter a valid email address';
      return false;
    } else {
      formGroup.classList.remove('error');
      errorMessage.textContent = '';
      return true;
    }
  };

  const validateMessage = () => {
    const message = messageInput.value.trim();
    const formGroup = messageInput.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');

    if (message === '') {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Message is required';
      return false;
    } else if (message.length < 10) {
      formGroup.classList.add('error');
      errorMessage.textContent = 'Message must be at least 10 characters';
      return false;
    } else {
      formGroup.classList.remove('error');
      errorMessage.textContent = '';
      return true;
    }
  };

  // Validate on blur
  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  // Clear error on input
  nameInput.addEventListener('input', () => {
    if (nameInput.closest('.form-group').classList.contains('error')) {
      validateName();
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.closest('.form-group').classList.contains('error')) {
      validateEmail();
    }
  });

  messageInput.addEventListener('input', () => {
    if (messageInput.closest('.form-group').classList.contains('error')) {
      validateMessage();
    }
  });

  // Form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isMessageValid) {
      // Disable button while submitting
      isSubmitting = true;
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Send form data via Formspree
      fetch('https://formspree.io/f/mgolqbdz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value,
          email: emailInput.value,
          message: messageInput.value
        })
      }).then(response => {
        if (response.ok) {
          formMessage.className = 'form-message success';
          formMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
          contactForm.reset();
          document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            group.querySelector('.error-message').textContent = '';
          });
          setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
          }, 5000);
        } else {
          throw new Error('Form submission failed');
        }
      }).catch(() => {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'An error occurred. Please try again.';
      }).finally(() => {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
    } else {
      // Show error message
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Please fix the errors above and try again.';
    }
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================
  // Initial call to set active nav link on page load
  updateActiveNavLink();

  // Set first nav link as active by default if at top of page
  if (window.pageYOffset < 100) {
    navLinks[0].classList.add('active');
  }

  // Dynamic copyright year
  document.getElementById('year').textContent = new Date().getFullYear();
});


