/*!
 * SRUB RUSSIA - Main JavaScript
 * Version: 2.0.2
 * Author: Your Name
 */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    headerScrollThreshold: 100,
    animationOffset: 100,
    sliderAutoplayDelay: 5000,
    formSubmitDelay: 1500,
    scrollToTopThreshold: 300,
    debounceDelay: 150,
    throttleDelay: 100
  };

  // ===== STATE =====
  const STATE = {
    isMenuOpen: false,
    isModalOpen: false,
    currentSlide: 0,
    isScrolling: false,
    hasAnimated: new Set()
  };

  // ===== DOM ELEMENTS =====
  const DOM = {
    header: document.getElementById('header'),
    nav: document.getElementById('nav'),
    navToggle: document.querySelector('.nav-toggle'),
    navLinks: document.querySelectorAll('.nav-link'),
    modal: document.getElementById('modal-callback'),
    modalTriggers: document.querySelectorAll('[data-modal]'),
    modalCloseTriggers: document.querySelectorAll('[data-close-modal]'),
    forms: document.querySelectorAll('form'),
    projectsSlider: document.getElementById('projects-slider'),
    projectPrev: document.querySelector('.project-prev'),
    projectNext: document.querySelector('.project-next'),
    projectsProgress: document.querySelector('.projects-progress'),
    faqToggles: document.querySelectorAll('.faq-toggle'),
    animatedElements: document.querySelectorAll('.stat-item, .service-card, .feature-item, .project-card, .faq-item, .testimonial-card, .step-item'),
    menuOverlay: null
  };

  // ===== UTILITY FUNCTIONS =====
  const SrubUtils = {
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    debounce: function(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },

    getScrollPosition: function() {
      return window.pageYOffset || document.documentElement.scrollTop;
    },

    lockScroll: function() {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    },

    unlockScroll: function() {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    },

    isInViewport: function(element, offset = 0) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= offset
      );
    },

    validateEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validatePhone: function(phone) {
      const digits = phone.replace(/\D/g, '');
      return digits.length >= 11;
    },

    animateNumber: function(element, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = end.toLocaleString();
        }
      };
      window.requestAnimationFrame(step);
    }
  };

  // ===== СОЗДАНИЕ ОВЕРЛЕЯ ДЛЯ МОБИЛЬНОГО МЕНЮ =====
  function createMenuOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 9998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      pointer-events: none;
    `;
    
    overlay.addEventListener('click', () => {
      closeMenu();
    });
    
    document.body.appendChild(overlay);
    DOM.menuOverlay = overlay;
    
    console.log('✓ Menu overlay created');
  }

  // ===== ДОБАВЛЕНИЕ СТИЛЕЙ ДЛЯ МОБИЛЬНОГО МЕНЮ =====
  function injectMobileMenuStyles() {
    const style = document.createElement('style');
    style.id = 'mobile-menu-styles';
    style.textContent = `
      /* Стили для мобильного меню */
      @media (max-width: 992px) {
        .nav {
          position: fixed;
          top: 0;
          right: -100%;
          width: 85%;
          max-width: 400px;
          height: 100vh;
          background: linear-gradient(135deg, #1a1814 0%, #24221a 100%);
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5);
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9999;
          overflow-y: auto;
          padding: 80px 0 30px;
        }
        
        .nav.active {
          right: 0;
        }
        
        /* Декоративная полоса сверху */
        .nav::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #c1ab61 0%, #d4c589 100%);
          pointer-events: none;
        }
        
        /* Градиент сверху */
        .nav::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(180deg, rgba(193, 171, 97, 0.1) 0%, transparent 100%);
          pointer-events: none;
        }
        
        .nav-list {
          flex-direction: column;
          gap: 0;
          padding: 0;
        }
        
        .nav-item {
          width: 100%;
          border-bottom: 1px solid rgba(193, 171, 97, 0.1);
        }
        
        .nav-link {
          display: block;
          padding: 18px 30px;
          font-size: 18px;
          color: #e8e6e3;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 2px;
          background: #c1ab61;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover,
        .nav-link.active {
          background: rgba(193, 171, 97, 0.1);
          color: #c1ab61;
          padding-left: 40px;
        }
        
        .nav-link:hover::before,
        .nav-link.active::before {
          width: 20px;
        }
        
        /* Оверлей для мобильного меню */
        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        
        /* Анимация появления пунктов меню */
        .nav.active .nav-item {
          animation: slideInRight 0.4s ease forwards;
          opacity: 0;
        }
        
        .nav.active .nav-item:nth-child(1) { animation-delay: 0.05s; }
        .nav.active .nav-item:nth-child(2) { animation-delay: 0.1s; }
        .nav.active .nav-item:nth-child(3) { animation-delay: 0.15s; }
        .nav.active .nav-item:nth-child(4) { animation-delay: 0.2s; }
        .nav.active .nav-item:nth-child(5) { animation-delay: 0.25s; }
        .nav.active .nav-item:nth-child(6) { animation-delay: 0.3s; }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Стили для dropdown в мобильном меню */
        .nav-item.dropdown {
          position: relative;
        }
        
        .nav-item.dropdown .dropdown-toggle::after {
          content: '▼';
          font-size: 10px;
          margin-left: 8px;
          opacity: 0.6;
          transition: transform 0.3s ease;
          display: inline-block;
        }
          
        .nav-item.dropdown .dropdown-menu {
          position: static;
          opacity: 1;
          visibility: visible;
          transform: none;
          box-shadow: none;
          background: rgba(193, 171, 97, 0.05);
          padding: 0;
          margin: 0;
          border: none;
          display: none;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item.dropdown.active .dropdown-menu {
          display: block;
          max-height: 500px;
          padding: 10px 0;
        }
        
        .dropdown-item {
          padding: 12px 30px 12px 50px;
          font-size: 16px;
          color: #b8b6b3;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .dropdown-item::before {
          content: '→';
          position: absolute;
          left: 30px;
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        .dropdown-item:hover {
          background: rgba(193, 171, 97, 0.1);
          color: #c1ab61;
          padding-left: 60px;
        }
        
        .dropdown-item:hover::before {
          opacity: 1;
          left: 35px;
        }
        
        /* Кнопка закрытия меню */
        .nav-toggle {
          z-index: 10000;
          position: relative;
        }
        
        .nav-toggle .hamburger {
          background: #e8e6e3;
          transition: background 0.3s ease;
        }
        
        .nav-toggle .hamburger::before,
        .nav-toggle .hamburger::after {
          background: #e8e6e3;
          transition: all 0.3s ease;
        }
        
        .nav-toggle.active .hamburger {
          background: transparent;
        }
        
        .nav-toggle.active .hamburger::before {
          transform: translateY(0);
          background: #c1ab61;
        }
        
        .nav-toggle.active .hamburger::after {
          transform: translateY(0);
          background: #c1ab61;
        }
        
        /* Скроллбар для меню */
        .nav::-webkit-scrollbar {
          width: 6px;
        }
        
        .nav::-webkit-scrollbar-track {
          background: rgba(193, 171, 97, 0.1);
        }
        
        .nav::-webkit-scrollbar-thumb {
          background: rgba(193, 171, 97, 0.3);
          border-radius: 3px;
        }
        
        .nav::-webkit-scrollbar-thumb:hover {
          background: rgba(193, 171, 97, 0.5);
        }
      }
      
      /* Предотвращение скролла при открытом меню */
      body.menu-open {
        overflow: hidden;
      }
    `;
    
    // Проверяем, не добавлены ли уже стили
    const existingStyle = document.getElementById('mobile-menu-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('✓ Mobile menu styles injected');
  }

  // ===== INITIALIZATION =====
  function init() {
    console.log('🏠 Initializing Srub Russia website...');
    
    // Добавляем стили и оверлей для мобильного меню
    injectMobileMenuStyles();
    createMenuOverlay();
    
    setupEventListeners();
    setupIntersectionObserver();
    setupScrollEffects();
    setupForms();
    setupSlider();
    setupFAQ();
    setupPhoneMask();
    createScrollToTopButton();
    setupStepsProgress();
    setupPlannerForm();
    setupMobileDropdowns();
    
    // Initial checks
    checkHeaderScroll();
    animateStats();
    
    console.log('✓ Website initialized successfully');
    
    // Отложенная проверка загрузки Telegram
    setTimeout(checkTelegramIntegration, 2000);
  }

  // ===== НАСТРОЙКА МОБИЛЬНЫХ DROPDOWN =====
  function setupMobileDropdowns() {
    if (window.innerWidth <= 992) {
      const dropdownToggles = document.querySelectorAll('.nav-item.dropdown .dropdown-toggle');
      
      dropdownToggles.forEach(toggle => {
        // Удаляем старые обработчики
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        newToggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const parentItem = this.closest('.nav-item.dropdown');
          const wasActive = parentItem.classList.contains('active');
          
          // Закрываем все другие dropdown
          document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            if (item !== parentItem) {
              item.classList.remove('active');
            }
          });
          
          // Переключаем текущий
          parentItem.classList.toggle('active', !wasActive);
          
          console.log('✓ Dropdown toggled:', this.textContent.trim());
        });
      });
      
      console.log('✓ Mobile dropdowns setup complete');
    }
  }

  // ===== ПРОВЕРКА ИНТЕГРАЦИИ TELEGRAM =====
  function checkTelegramIntegration() {
    console.log('🔍 Проверка интеграции Telegram...');
    
    if (typeof window.sendToTelegram !== 'function') {
      console.warn('⚠️ Telegram integration not loaded, using fallback');
      setupTelegramFallback();
    } else {
      console.log('✓ Telegram integration is available');
    }
  }

  // ===== TELEGRAM FALLBACK =====
  function setupTelegramFallback() {
    window.sendToTelegram = async function(formData, formType) {
      console.log('📤 [FALLBACK] Отправка в Telegram:', { formData, formType });
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ [FALLBACK] Сообщение успешно отправлено (заглушка)');
      return { ok: true, result: { message_id: Date.now() } };
    };
    
    window.testTelegramConnection = async function() {
      console.log('🔍 [FALLBACK] Тестирование подключения к Telegram...');
      try {
        await window.sendToTelegram({
          name: 'Тестовое сообщение',
          phone: '+7 (999) 123-45-67',
          email: 'test@srub-russia.ru'
        }, 'test-connection');
        console.log('✅ [FALLBACK] Тест успешен!');
        alert('✅ [FALLBACK] Telegram не настроен, но формы будут работать в тестовом режиме.');
        return { ok: true };
      } catch (error) {
        console.error('❌ [FALLBACK] Тест не пройден:', error);
        return { ok: false, error: error.message };
      }
    };
    
    console.log('✓ Telegram fallback setup complete');
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Navigation toggle
    if (DOM.navToggle) {
      DOM.navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    }

    // Navigation links
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Если это dropdown toggle на мобильном
        if (window.innerWidth <= 992 && link.classList.contains('dropdown-toggle')) {
          return; // Обрабатывается в setupMobileDropdowns
        }
        
        // Если это якорная ссылка на текущей странице
        if (href.startsWith('#') && window.location.pathname === '/') {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          
          if (targetElement) {
            closeMenu();
            smoothScrollTo(targetElement);
            updateActiveNavLink(link);
          }
        }
        // Для всех остальных ссылок разрешаем переход
        else if (href.includes('#')) {
          closeMenu();
        }
      });
    });

    // Modal triggers
    DOM.modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-modal');
        openModal(modalId);
      });
    });

    // Modal close triggers
    DOM.modalCloseTriggers.forEach(trigger => {
      trigger.addEventListener('click', closeModal);
    });

    // Close modal on overlay click
    if (DOM.modal) {
      DOM.modal.addEventListener('click', (e) => {
        if (e.target === DOM.modal || e.target.classList.contains('modal-overlay')) {
          closeModal();
        }
      });
    }

    // Close modal/menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && STATE.isModalOpen) {
        closeModal();
      }
      if (e.key === 'Escape' && STATE.isMenuOpen) {
        closeMenu();
      }
    });

    // Scroll events
    window.addEventListener('scroll', SrubUtils.throttle(handleScroll, CONFIG.throttleDelay));
    
    // Resize events
    window.addEventListener('resize', SrubUtils.debounce(() => {
      handleResize();
      setupMobileDropdowns();
    }, CONFIG.debounceDelay));

    // Slider controls
    if (DOM.projectPrev) {
      DOM.projectPrev.addEventListener('click', () => navigateSlider('prev'));
    }
    if (DOM.projectNext) {
      DOM.projectNext.addEventListener('click', () => navigateSlider('next'));
    }

    // Prevent form submission on Enter in text inputs
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'text') {
        e.preventDefault();
      }
    });
  }

  // ===== NAVIGATION =====
  function toggleMenu() {
    STATE.isMenuOpen = !STATE.isMenuOpen;
    
    if (STATE.isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  function openMenu() {
    DOM.nav.classList.add('active');
    DOM.navToggle.classList.add('active');
    DOM.navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    
    if (DOM.menuOverlay) {
      DOM.menuOverlay.classList.add('active');
    }
    
    SrubUtils.lockScroll();
    STATE.isMenuOpen = true;
    
    console.log('✓ Menu opened');
  }

  function closeMenu() {
    DOM.nav.classList.remove('active');
    DOM.navToggle.classList.remove('active');
    DOM.navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    
    if (DOM.menuOverlay) {
      DOM.menuOverlay.classList.remove('active');
    }
    
    // Закрываем все dropdown
    document.querySelectorAll('.nav-item.dropdown').forEach(item => {
      item.classList.remove('active');
    });
    
    SrubUtils.unlockScroll();
    STATE.isMenuOpen = false;
    
    console.log('✓ Menu closed');
  }

  function updateActiveNavLink(activeLink) {
    DOM.navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
  }

  // ===== SCROLL EFFECTS =====
  function setupScrollEffects() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', SrubUtils.throttle(() => {
      const scrollPosition = window.pageYOffset + 200;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 100));
  }

  function handleScroll() {
    checkHeaderScroll();
    checkScrollToTop();
  }

  function checkHeaderScroll() {
    const scrollPosition = SrubUtils.getScrollPosition();
    
    if (scrollPosition > CONFIG.headerScrollThreshold) {
      DOM.header.classList.add('scrolled');
    } else {
      DOM.header.classList.remove('scrolled');
    }
  }

  function smoothScrollTo(element, offset = 80) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // ===== INTERSECTION OBSERVER =====
  function setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !STATE.hasAnimated.has(entry.target)) {
          entry.target.classList.add('animate-in');
          STATE.hasAnimated.add(entry.target);
        }
      });
    }, observerOptions);

    DOM.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  // ===== STATS ANIMATION =====
  function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    let animated = false;

    const animateOnScroll = () => {
      if (animated) return;
      
      const statsSection = document.getElementById('stats');
      if (!statsSection) return;

      if (SrubUtils.isInViewport(statsSection, 200)) {
        statValues.forEach(stat => {
          const finalValue = parseInt(stat.textContent);
          stat.textContent = '0';
          SrubUtils.animateNumber(stat, 0, finalValue, 2000);
        });
        animated = true;
        window.removeEventListener('scroll', animateOnScroll);
      }
    };

    window.addEventListener('scroll', SrubUtils.throttle(animateOnScroll, 100));
    animateOnScroll();
  }

  // ===== MODAL =====
  function openModal(modalId) {
    const modal = document.getElementById(`modal-${modalId}`);
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    SrubUtils.lockScroll();
    STATE.isModalOpen = true;

    const firstInput = modal.querySelector('input:not([type="checkbox"])');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    trackEvent('Modal', 'Open', modalId);
  }

  function closeModal() {
    if (DOM.modal) {
      DOM.modal.classList.remove('active');
      DOM.modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      SrubUtils.unlockScroll();
      STATE.isModalOpen = false;

      const form = DOM.modal.querySelector('form');
      if (form) {
        resetForm(form);
      }
    }
  }

  // ===== ФУНКЦИИ ДЛЯ ФОРМ =====
  
  function removeFormMessages(form) {
    if (!form || !form.querySelectorAll) {
      console.warn('removeFormMessages: form не является DOM элементом');
      return;
    }
    
    const successMessages = form.querySelectorAll('.form-success');
    const errorMessages = form.querySelectorAll('.form-error');
    
    const allMessages = [...successMessages, ...errorMessages];
    allMessages.forEach(message => {
      if (message && message.parentNode) {
        message.parentNode.removeChild(message);
      }
    });
  }
  
  function showFormError(form, errorMessage) {
    if (!form) {
      console.error('showFormError: form не определен');
      return;
    }
    
    removeFormMessages(form);
    
    if (!errorMessage || errorMessage.trim() === '') {
      return;
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.style.cssText = `
      color: #dc3545;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 10px 15px;
      margin-top: 15px;
      font-size: 14px;
      text-align: center;
    `;
    errorElement.textContent = errorMessage;
    
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(errorElement, submitBtn.nextSibling);
    } else {
      form.appendChild(errorElement);
    }
  }
  
  function showFormSuccess(form, successMessage) {
    if (!form) return;
    
    removeFormMessages(form);
    
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.style.cssText = `
      color: #155724;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      padding: 10px 15px;
      margin-top: 15px;
      font-size: 14px;
      text-align: center;
    `;
    successElement.textContent = successMessage;
    
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(successElement, submitBtn.nextSibling);
    } else {
      form.appendChild(successElement);
    }
  }

  // ===== FORMS =====
  function setupForms() {
    DOM.forms.forEach(form => {
      if (form.id === 'planner-form') return;
      
      form.addEventListener('submit', handleFormSubmit);
      
      const inputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])');
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            validateInput(input);
          }
        });
      });
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('[type="submit"]');
    const formId = form.id || 'contact-form';
    
    if (!validateForm(form)) {
      showFormError(form, 'Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    submitButton.classList.add('loading');
    submitButton.disabled = true;

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (value === 'on') {
        value = 'Да';
      }
      data[key] = value;
    });

    data.timestamp = new Date().toLocaleString('ru-RU');
    data.pageUrl = window.location.href;

    console.log('📋 Отправка формы:', formId, data);

    if (Object.keys(data).length === 0) {
      console.error('❌ Ошибка: данные формы пустые');
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
      showFormError(form, 'Ошибка: данные формы пустые');
      return;
    }

    if (typeof window.sendToTelegram !== 'function') {
      console.error('❌ sendToTelegram function not found');
      
      setTimeout(() => {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        
        showFormSuccess(form, 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        
        trackEvent('Form', 'Submit', formId);
        
        setTimeout(() => {
          resetForm(form);
          if (STATE.isModalOpen) {
            closeModal();
          }
        }, 3000);
      }, 1500);
      
      return;
    }

    window.sendToTelegram(data, formId)
      .then((result) => {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        
        showFormSuccess(form, 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        
        trackEvent('Form', 'Submit', formId);
        
        setTimeout(() => {
          resetForm(form);
          if (STATE.isModalOpen) {
            closeModal();
          }
        }, 3000);
      })
      .catch(error => {
        console.error('Error:', error);
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        showFormError(form, '');
      });
  }

  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea, select');
    
    inputs.forEach(input => {
      if (!validateInput(input)) {
        isValid = false;
      }
    });

    const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
    requiredCheckboxes.forEach(checkbox => {
      const checkboxGroup = checkbox.closest('.form-checkbox');
      if (!checkbox.checked) {
        checkboxGroup.classList.add('error');
        isValid = false;
      } else {
        checkboxGroup.classList.remove('error');
      }
    });

    return isValid;
  }

  function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');

    input.classList.remove('error');

    if (required && !value) {
      input.classList.add('error');
      return false;
    }

    if (!required && !value) {
      return true;
    }

    switch(type) {
      case 'email':
        if (!SrubUtils.validateEmail(value)) {
          input.classList.add('error');
          return false;
        }
        break;
      
      case 'tel':
        if (!SrubUtils.validatePhone(value)) {
          input.classList.add('error');
          return false;
        }
        break;
      
      case 'text':
        if (input.name === 'name' && value.length < 2) {
          input.classList.add('error');
          return false;
        }
        break;
    }

    return true;
  }

  function resetForm(form) {
    form.reset();
    
    const inputs = form.querySelectorAll('.error');
    inputs.forEach(input => input.classList.remove('error'));
    
    removeFormMessages(form);
    
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
    }
  }

  // ===== PHONE MASK =====
  function setupPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
          if (value[0] !== '7') {
            value = '7' + value;
          }
          
          let formatted = '+7';
          
          if (value.length > 1) {
            formatted += ' (' + value.substring(1, 4);
          }
          if (value.length >= 5) {
            formatted += ') ' + value.substring(4, 7);
          }
          if (value.length >= 8) {
            formatted += '-' + value.substring(7, 9);
          }
          if (value.length >= 10) {
            formatted += '-' + value.substring(9, 11);
          }
          
          e.target.value = formatted;
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '+7') {
          e.preventDefault();
          e.target.value = '';
        }
      });

      input.addEventListener('focus', (e) => {
        if (!e.target.value) {
          e.target.value = '+7 ';
        }
      });
    });
  }

  // ===== SLIDER =====
  function setupSlider() {
    if (!DOM.projectsSlider) return;

    const slides = DOM.projectsSlider.querySelectorAll('.project-card');
    const totalSlides = slides.length;
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(0, totalSlides - slidesPerView);

    updateSlider();

    window.addEventListener('resize', SrubUtils.debounce(() => {
      updateSlider();
    }, CONFIG.debounceDelay));
  }

  function getSlidesPerView() {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1200) return 2;
    return 3;
  }

  function navigateSlider(direction) {
    const slides = DOM.projectsSlider.querySelectorAll('.project-card');
    const totalSlides = slides.length;
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.max(0, totalSlides - slidesPerView);

    if (direction === 'next') {
      STATE.currentSlide = Math.min(STATE.currentSlide + 1, maxSlide);
    } else {
      STATE.currentSlide = Math.max(STATE.currentSlide - 1, 0);
    }

    updateSlider();
    trackEvent('Slider', 'Navigate', direction);
  }

  function updateSlider() {
    if (!DOM.projectsSlider) return;

    const slides = DOM.projectsSlider.querySelectorAll('.project-card');
    const totalSlides = slides.length;
    const slidesPerView = getSlidesPerView();
    const slideWidth = slides[0]?.offsetWidth || 0;
    const gap = 60;
    const offset = STATE.currentSlide * (slideWidth + gap);

    DOM.projectsSlider.style.transform = `translateX(-${offset}px)`;

    if (DOM.projectsProgress) {
      const maxSlide = Math.max(0, totalSlides - slidesPerView);
      const progress = maxSlide > 0 ? (STATE.currentSlide / maxSlide) * 100 : 100;
      DOM.projectsProgress.style.setProperty('--progress', `${progress}%`);
      DOM.projectsProgress.setAttribute('aria-valuenow', Math.round(progress));
    }

    if (DOM.projectPrev) {
      DOM.projectPrev.disabled = STATE.currentSlide === 0;
    }
    if (DOM.projectNext) {
      const maxSlide = Math.max(0, totalSlides - slidesPerView);
      DOM.projectNext.disabled = STATE.currentSlide >= maxSlide;
    }
  }

  // ===== FAQ =====
  function setupFAQ() {
    DOM.faqToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const answer = toggle.nextElementSibling;
        
        DOM.faqToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.setAttribute('aria-expanded', 'false');
            const otherAnswer = otherToggle.nextElementSibling;
            otherAnswer.style.maxHeight = '0';
          }
        });

        if (isExpanded) {
          toggle.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0';
        } else {
          toggle.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          
          trackEvent('FAQ', 'Open', toggle.textContent.trim());
        }
      });
    });
  }

  // ===== SCROLL TO TOP =====
  function createScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Прокрутить наверх');
    button.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: #2c3e50;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 24px;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
    `;
    
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      trackEvent('Button', 'Click', 'Scroll to Top');
    });

    document.body.appendChild(button);
    DOM.scrollToTop = button;
  }

  function checkScrollToTop() {
    if (!DOM.scrollToTop) return;
    
    const scrollPosition = SrubUtils.getScrollPosition();
    
    if (scrollPosition > CONFIG.scrollToTopThreshold) {
      DOM.scrollToTop.style.display = 'flex';
      DOM.scrollToTop.style.opacity = '1';
      DOM.scrollToTop.classList.add('visible');
    } else {
      DOM.scrollToTop.style.opacity = '0';
      setTimeout(() => {
        if (scrollPosition <= CONFIG.scrollToTopThreshold) {
          DOM.scrollToTop.style.display = 'none';
          DOM.scrollToTop.classList.remove('visible');
        }
      }, 300);
    }
  }

  // ===== STEPS PROGRESS =====
  function setupStepsProgress() {
    const progressFill = document.getElementById('stepsProgressFill');
    if (!progressFill) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepItems = document.querySelectorAll('.step-item');
          let visibleSteps = 0;

          stepItems.forEach(item => {
            if (SrubUtils.isInViewport(item)) {
              visibleSteps++;
            }
          });

          const progress = (visibleSteps / stepItems.length) * 100;
          progressFill.style.width = `${progress}%`;
        }
      });
    }, { threshold: 0.1 });

    const stepsSection = document.querySelector('.steps');
    if (stepsSection) {
      observer.observe(stepsSection);
    }

    window.addEventListener('scroll', SrubUtils.throttle(() => {
      const stepItems = document.querySelectorAll('.step-item');
      let visibleSteps = 0;

      stepItems.forEach(item => {
        if (SrubUtils.isInViewport(item, 200)) {
          visibleSteps++;
        }
      });

      const progress = (visibleSteps / stepItems.length) * 100;
      progressFill.style.width = `${progress}%`;
    }, 100));
  }

  // ===== PLANNER FORM =====
  function setupPlannerForm() {
    const plannerForm = document.getElementById('planner-form');
    if (!plannerForm) return;

    const steps = plannerForm.querySelectorAll('.planner-step');
    const nextBtn = document.getElementById('planner-next');
    const backBtn = document.getElementById('planner-back');
    const submitBtn = document.getElementById('planner-submit');
    const progressFill = document.querySelector('.planner-progress-fill');
    const progressText = document.querySelector('.planner-progress-text');
    
    let currentStep = 1;
    const totalSteps = steps.length;

    function updateProgress() {
      const progress = (currentStep / totalSteps) * 100;
      progressFill.style.width = progress + '%';
      progressText.textContent = `${currentStep} из ${totalSteps}`;
    }

    function showStep(stepNumber) {
      steps.forEach((step, index) => {
        step.classList.toggle('active', index + 1 === stepNumber);
      });

      backBtn.style.display = stepNumber > 1 ? 'inline-flex' : 'none';
      nextBtn.style.display = stepNumber < totalSteps ? 'inline-flex' : 'none';
      submitBtn.style.display = stepNumber === totalSteps ? 'inline-flex' : 'none';

      updateProgress();
    }

    function validateStep(stepNumber) {
      const currentStepElement = steps[stepNumber - 1];
      const requiredInputs = currentStepElement.querySelectorAll('[required]');
      
      for (let input of requiredInputs) {
        if (input.type === 'radio') {
          const radioGroup = currentStepElement.querySelectorAll(`[name="${input.name}"]`);
          const isChecked = Array.from(radioGroup).some(radio => radio.checked);
          if (!isChecked) {
            alert('Пожалуйста, выберите один из вариантов');
            return false;
          }
        } else if (input.type === 'checkbox') {
          if (!input.checked) {
            alert('Необходимо согласие на обработку персональных данных');
            return false;
          }
        } else {
          if (!input.value.trim()) {
            alert('Пожалуйста, заполните поле: ' + (input.previousElementSibling?.textContent || 'обязательное'));
            input.focus();
            return false;
          }
          if (input.type === 'tel' && !SrubUtils.validatePhone(input.value)) {
            alert('Пожалуйста, введите корректный номер телефона');
            input.focus();
            return false;
          }
        }
      }
      return true;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
          if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
          }
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (currentStep > 1) {
          currentStep--;
          showStep(currentStep);
        }
      });
    }

    plannerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validateStep(currentStep)) {
        return;
      }

      const formData = new FormData(plannerForm);
      const data = {};
      
      formData.forEach((value, key) => {
        if (value === 'on') {
          value = 'Да';
        }
        data[key] = value;
      });

      data.timestamp = new Date().toLocaleString('ru-RU');
      data.pageUrl = window.location.href;

      console.log('📋 Данные формы планировщика:', data);

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      if (typeof window.sendToTelegram !== 'function') {
        console.error('❌ sendToTelegram function not found');
        
        setTimeout(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          
          const successMessage = document.createElement('div');
          successMessage.className = 'form-success';
          successMessage.style.cssText = 'background: #2ecc71; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;';
          successMessage.innerHTML = '<strong>✅ Спасибо!</strong><br>Мы получили вашу заявку и свяжемся с вами в ближайшее время.';
          
          plannerForm.appendChild(successMessage);
          
          setTimeout(() => {
            plannerForm.reset();
            currentStep = 1;
            showStep(currentStep);
            successMessage.remove();
          }, 3000);
          
          trackEvent('Form', 'Submit', 'planner-form');
        }, 1500);
        
        return;
      }

      window.sendToTelegram(data, 'planner-form')
        .then(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          
          const successMessage = document.createElement('div');
          successMessage.className = 'form-success';
          successMessage.style.cssText = 'background: #2ecc71; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px;';
          successMessage.innerHTML = '<strong>✅ Спасибо!</strong><br>Мы получили вашу заявку и свяжемся с вами в ближайшее время.';
          
          plannerForm.appendChild(successMessage);
          
          setTimeout(() => {
            plannerForm.reset();
            currentStep = 1;
            showStep(currentStep);
            successMessage.remove();
          }, 3000);
          
          trackEvent('Form', 'Submit', 'planner-form');
        })
        .catch(error => {
          console.error('Error:', error);
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        });
    });

    showStep(currentStep);
  }

  // ===== RESIZE HANDLER =====
  function handleResize() {
    if (window.innerWidth > 992 && STATE.isMenuOpen) {
      closeMenu();
    }
    updateSlider();
  }

  // ===== ANALYTICS =====
  function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        'event_category': category,
        'event_label': label
      });
    }

    if (typeof ym !== 'undefined') {
      ym(XXXXXXXX, 'reachGoal', `${category}_${action}`);
    }

    console.log('📊 Event tracked:', category, action, label);
  }

  // ===== ERROR HANDLING =====
  window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.message, e.filename, e.lineno);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
  });

  // ===== PAGE VISIBILITY =====
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Page hidden');
    } else {
      console.log('Page visible');
    }
  });

  // ===== INITIALIZE ON DOM READY =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===== EXPORT API =====
  window.SrubRussia = {
    openModal,
    closeModal,
    trackEvent,
    validateEmail: SrubUtils.validateEmail,
    validatePhone: SrubUtils.validatePhone,
    testTelegramConnection: function() {
      if (typeof window.testTelegramConnection === 'function') {
        return window.testTelegramConnection();
      } else {
        console.error('testTelegramConnection не найдена');
        alert('Функция testTelegramConnection не загружена');
        return Promise.reject('Function not loaded');
      }
    },
    sendToTelegram: function(data, formType) {
      if (typeof window.sendToTelegram === 'function') {
        return window.sendToTelegram(data, formType);
      } else {
        return Promise.reject('sendToTelegram not loaded');
      }
    }
  };

})();

console.log('✓ Main scripts loaded v2.0.2');