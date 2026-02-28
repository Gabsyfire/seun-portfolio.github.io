(function() {
  'use strict';

  var CONSENT_KEY = 'cookieConsent';
  var GA_ID = 'G-64FDCNBXVW';

  function loadGA() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function removeGACookies() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var name = cookies[i].trim().split('=')[0];
      if (name.indexOf('_ga') === 0 || name === '_gid') {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    }
  }

  function hideBanner() {
    var banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.classList.remove('cookie-banner--visible');
      banner.classList.add('cookie-banner--hidden');
      setTimeout(function() {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 400);
    }
  }

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    loadGA();
    hideBanner();
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    removeGACookies();
    hideBanner();
  }

  function showBanner() {
    var privacyHref = 'privacy-policy.html';
    if (window.location.pathname.indexOf('/projects/') !== -1) {
      privacyHref = '../privacy-policy.html';
    }

    var banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cookie-banner__content">' +
        '<p class="cookie-banner__text">' +
          'This website uses cookies to analyze traffic and improve your experience. ' +
          '<a href="' + privacyHref + '">Learn more</a>' +
        '</p>' +
        '<div class="cookie-banner__actions">' +
          '<button class="cookie-banner__btn cookie-banner__btn--decline" id="cookieDecline">Decline</button>' +
          '<button class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAccept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    // Force reflow for transition
    banner.offsetHeight;
    banner.classList.add('cookie-banner--visible');

    document.getElementById('cookieAccept').addEventListener('click', handleAccept);
    document.getElementById('cookieDecline').addEventListener('click', handleDecline);
  }

  // Main logic
  var consent = localStorage.getItem(CONSENT_KEY);

  if (consent === 'accepted') {
    loadGA();
  } else if (consent !== 'declined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
