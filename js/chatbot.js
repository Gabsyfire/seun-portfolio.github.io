(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // Replace this URL after deploying your Cloudflare Worker
  // See cloudflare-worker/README.md for setup instructions
  // ============================================
  var WORKER_URL = 'https://seun-portfolio-chatbot.gabsyfy.workers.dev';

  // ============================================
  // STATE
  // ============================================
  var messages = [];
  var isOpen = false;
  var isLoading = false;

  // ============================================
  // DOM REFERENCES
  // ============================================
  var chatBubble, chatWindow, chatMessages, chatInput, chatSendBtn, typingIndicator;

  // ============================================
  // INITIALISE
  // ============================================
  function init() {
    injectHTML();
    bindEvents();
  }

  function injectHTML() {
    chatBubble = document.createElement('button');
    chatBubble.id = 'chatbotBubble';
    chatBubble.className = 'chatbot-bubble';
    chatBubble.setAttribute('aria-label', 'Open chat assistant');
    chatBubble.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(chatBubble);

    chatWindow = document.createElement('div');
    chatWindow.id = 'chatbotWindow';
    chatWindow.className = 'chatbot-window';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'Chat with AI assistant');
    chatWindow.innerHTML =
      '<div class="chatbot-header">' +
        '<span class="chatbot-header-title">Chat with Seun\'s AI Assistant</span>' +
        '<button class="chatbot-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="chatbot-messages" id="chatbotMessages">' +
        '<div class="chatbot-msg chatbot-msg--assistant">' +
          '<div class="chatbot-msg-bubble">' +
            'Hi! I\'m Seun\'s AI assistant. Ask me about his skills, projects, or how he can help your business.' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="chatbot-typing" id="chatbotTyping">' +
        '<span class="chatbot-typing-dot"></span>' +
        '<span class="chatbot-typing-dot"></span>' +
        '<span class="chatbot-typing-dot"></span>' +
      '</div>' +
      '<div class="chatbot-input-area">' +
        '<input type="text" class="chatbot-input" id="chatbotInput" ' +
          'placeholder="Type a message..." autocomplete="off" />' +
        '<button class="chatbot-send" id="chatbotSend" aria-label="Send message">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" ' +
          'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<line x1="22" y1="2" x2="11" y2="13"/>' +
          '<polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(chatWindow);

    chatMessages = document.getElementById('chatbotMessages');
    chatInput = document.getElementById('chatbotInput');
    chatSendBtn = document.getElementById('chatbotSend');
    typingIndicator = document.getElementById('chatbotTyping');
  }

  function bindEvents() {
    chatBubble.addEventListener('click', toggleChat);
    chatWindow.querySelector('.chatbot-close').addEventListener('click', toggleChat);
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ============================================
  // UI ACTIONS
  // ============================================
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('chatbot-window--open', isOpen);
    chatBubble.classList.toggle('chatbot-bubble--hidden', isOpen);
    if (isOpen) {
      chatInput.focus();
    }
  }

  function appendMessage(role, text) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'chatbot-msg chatbot-msg--' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chatbot-msg-bubble';
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    typingIndicator.classList.add('chatbot-typing--visible');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    typingIndicator.classList.remove('chatbot-typing--visible');
  }

  // ============================================
  // API COMMUNICATION
  // ============================================
  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    appendMessage('user', text);
    chatInput.value = '';
    chatInput.focus();

    isLoading = true;
    showTyping();
    chatSendBtn.disabled = true;

    var toSend = messages.slice(-10);

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: toSend })
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'Request failed');
        });
      }
      return response.json();
    })
    .then(function(data) {
      var reply = data.reply || 'Sorry, I could not generate a response.';
      messages.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);
    })
    .catch(function() {
      appendMessage('assistant', 'Sorry, something went wrong. Please try again in a moment.');
    })
    .finally(function() {
      isLoading = false;
      hideTyping();
      chatSendBtn.disabled = false;
    });
  }

  // ============================================
  // BOOTSTRAP
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
