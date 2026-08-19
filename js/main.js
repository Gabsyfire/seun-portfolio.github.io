// ==========================================
// SMOOTH SCROLL NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // THEME TOGGLE
  // ==========================================
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });
  }

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
        const targetPosition = targetId === '#home' ? 0 : targetSection.offsetTop - headerHeight;

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

  document.querySelectorAll('.cert-card[data-href]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      window.open(card.dataset.href, '_blank', 'noopener,noreferrer');
    });
  });

  // ==========================================
  // SKILL MODAL
  // ==========================================
  const skillData = {
    // --- AI ---
    'copilot-studio': {
      title: 'Copilot Studio',
      items: ['Production agent design — topics, triggers, and generative orchestration', 'Grounding agents on internal documentation and Dataverse', 'Agent actions that write back through Power Automate, never direct from the model', 'Guardrails, fallback handling, and human escalation paths', 'Multi-agent suites sharing a common retrieve-reason-act pattern']
    },
    'ai-builder': {
      title: 'AI Builder',
      items: ['Prompt and model actions inside cloud flows', 'Document and form processing', 'Classification and extraction against business data', 'Model evaluation before it reaches production']
    },
    'agentic-patterns': {
      title: 'Agentic Patterns',
      items: ['Retrieve → reason → act, with a guardrail on every write', 'Narrowing an agent to an audited action surface', 'Human-in-the-loop escalation for consequential decisions', 'Designing for the failure case, not the happy path', 'Keeping the agent stateless and the audit trail durable']
    },
    'grounding': {
      title: 'Grounding & Retrieval',
      items: ['Grounding agents on curated internal documentation', 'Live Dataverse retrieval as an answer source', 'Surfacing Power BI data conversationally', 'Scoping retrieval so an agent cannot answer outside its remit']
    },

    // --- Power Platform ---
    'power-apps': {
      title: 'Power Apps',
      items: ['Canvas and model-driven app development', 'GPS and device-capability integration on mobile', 'Responsive layouts built for one-handed field use', 'Delegation-aware data access against Dataverse']
    },
    'power-automate': {
      title: 'Power Automate',
      items: ['Cloud flows as the action layer behind AI agents', 'Scheduled and event-driven data synchronisation', 'Custom connectors and HTTP calls to external APIs', 'Error handling, retry policy, and approval routing']
    },
    'dataverse': {
      title: 'Dataverse',
      items: ['Data modelling — tables, relationships, and alternate keys', 'Web API and OData query design', 'Upsert patterns on composite alternate keys', 'Security roles, business units, and row ownership']
    },
    'power-bi': {
      title: 'Power BI',
      items: ['Semantic models built directly on Dataverse', 'KPI design and profit trend analysis', 'Row-Level Security for role-scoped reporting', 'Dynamic period selection and slicer-driven exploration']
    },
    'power-fx': {
      title: 'Power Fx',
      items: ['Formula-based logic for canvas apps', 'Calculated fields and data manipulation', 'Conditional formatting and state handling', 'Delegation-aware queries']
    },

    // --- Dynamics 365 CE ---
    'model-driven': {
      title: 'Model-Driven Apps',
      items: ['Forms, views, dashboards, and site map configuration', 'Business rules and business process flows', 'Client-side scripting via JavaScript web resources', 'App design for both web and offline mobile clients']
    },
    'plugins': {
      title: 'Plugins & Custom APIs',
      items: ['C# plugin development across the event pipeline', 'Custom APIs and custom workflow activities', 'Pre/post image handling and transaction awareness', 'Performance-conscious registration and depth control']
    },
    'pcf-controls': {
      title: 'PCF Controls',
      items: ['Custom Power Apps Component Framework controls', 'Reusable UI components for model-driven apps', 'TypeScript-based control development', 'Packaging and solution-aware deployment']
    },
    'fetchxml': {
      title: 'FetchXML',
      items: ['Advanced Dataverse queries', 'Aggregate queries and linked-entity joins', 'Filtered views and pagination', 'Performance-optimised data retrieval']
    },
    'solution-alm': {
      title: 'Solution ALM',
      items: ['Managed and unmanaged solution strategy', 'Environment promotion — dev, test, production', 'Pipeline-based deployment via Azure DevOps', 'Connection references and environment variables']
    },

    // --- Azure ---
    'azure-functions': {
      title: 'Azure Functions',
      items: ['C# / .NET 8 isolated worker functions', 'HTTP, timer, and queue-triggered integration services', 'Paginated retrieval against rate-limited third-party APIs', 'Idempotent, replay-safe batch processing']
    },
    'key-vault': {
      title: 'Key Vault',
      items: ['Secret storage for integration credentials', 'Managed identity access — no secrets in app settings', 'Certificate and key lifecycle handling', 'Keeping credentials out of flows, forms, and source control']
    },
    'entra-id': {
      title: 'Entra ID & OAuth',
      items: ['App registrations and client credential flows', 'Token brokering between systems that do not trust each other', 'Service principal access to Dataverse', 'Group-based access control and role assignment']
    },
    'api-integrations': {
      title: 'REST & Webhooks',
      items: ['RESTful API design and consumption', 'Webhook receivers and event-driven callbacks', 'Third-party system integration and data mapping', 'Rate limiting, retry, and back-off strategy']
    },
    'azure-devops': {
      title: 'Azure DevOps',
      items: ['CI/CD pipelines for solution and code deployment', 'Automated build and release across environments', 'Repository and branch strategy', 'Infrastructure-as-code deployment workflows']
    },

    // --- Languages ---
    'csharp': {
      title: 'C#',
      items: ['Azure Functions and integration services on .NET 8', 'Dynamics 365 plugin and custom workflow development', 'Backend API development', 'Data migration and bulk-processing tooling']
    },
    'javascript': {
      title: 'JavaScript',
      items: ['Form logic and validation in Dynamics 365', 'Web resource development', 'Async operations and Web API calls', 'Code that runs unchanged on web and offline mobile clients']
    },
    'typescript': {
      title: 'TypeScript',
      items: ['PCF control development', 'Typed front-end application code', 'Typed API clients against REST services', 'Build tooling and module bundling']
    },
    'sql': {
      title: 'SQL',
      items: ['Query design and optimisation', 'Schema design for relational application data', 'Reporting queries and data reconciliation', 'Azure SQL provisioning and access control']
    },
    'dax': {
      title: 'DAX',
      items: ['Measure design for KPI and trend reporting', 'Time intelligence and dynamic period comparison', 'Row-Level Security filter expressions', 'Calculation groups and reusable measure patterns']
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


