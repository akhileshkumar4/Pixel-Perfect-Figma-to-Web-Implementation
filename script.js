(() => {
  // DOM Helper Functions
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  // Video Player
  window.playVideo = () => {
    const thumbnail = $('#thumbnail');
    const videoContainer = $('#videoContainer');
    
    if (thumbnail && videoContainer) {
      thumbnail.classList.add('hidden');
      videoContainer.classList.remove('hidden');
    }
  };

  // Modal Handler
  const modalHandler = {
    init() {
      this.openers = $$('[data-open-modal]');
      this.closeSelectors = '[data-close-modal], .modal-backdrop';
      this.lastActive = null;
      this.bindEvents();
    },

    setAriaHidden(modal, hidden) {
      modal?.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    },

    trapFocus(modal) {
      const focusables = $$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])', modal)
        .filter(el => !el.hasAttribute('disabled'));
      
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      const onKey = (e) => {
        if (e.key === 'Escape') {
          this.closeModal(modal);
        }
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      modal.addEventListener('keydown', onKey);
      modal._releaseFocus = () => modal.removeEventListener('keydown', onKey);
    },

    openModal(id) {
      const modal = $(id);
      if (!modal) return;

      this.lastActive = document.activeElement;
      this.setAriaHidden(modal, false);
      
      const autofocus = modal.querySelector('[autofocus]') || 
                       modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      
      if (autofocus) autofocus.focus();
      this.trapFocus(modal);
    },

    closeModal(modal) {
      if (!modal) return;
      
      this.setAriaHidden(modal, true);
      if (modal._releaseFocus) modal._releaseFocus();
      if (this.lastActive?.focus) this.lastActive.focus();
    },

    bindEvents() {
      this.openers.forEach(btn => {
        btn.addEventListener('click', () => 
          this.openModal(btn.getAttribute('data-open-modal'))
        );
      });

      $$('.modal').forEach(modal => {
        $$(this.closeSelectors, modal).forEach(el => 
          el.addEventListener('click', () => this.closeModal(modal))
        );
      });
    }
  };

  // Carousel Handler
  const carouselHandler = {
    init() {
      $$('[data-carousel]').forEach(carousel => {
        this.setupCarousel(carousel);
      });
    },

    setupCarousel(carousel) {
      const track = $('[data-carousel-track]', carousel);
      const prev = $('[data-carousel-prev]', carousel);
      const next = $('[data-carousel-next]', carousel);
      const dots = $('[data-carousel-dots]', carousel);
      
      if (!track || !dots) return;

      const slides = Array.from(track.children);
      let currentIndex = 0;

      const updateSlide = () => {
        requestAnimationFrame(() => {
          track.scrollTo({ 
            left: track.clientWidth * currentIndex, 
            behavior: 'smooth' 
          });
          
          Array.from(dots.children).forEach((dot, i) => 
            dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false')
          );
        });
      };

      const goToSlide = (index) => {
        currentIndex = Math.max(0, Math.min(slides.length - 1, index));
        updateSlide();
      };

      // Create navigation dots
      slides.forEach((_, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        button.addEventListener('click', () => goToSlide(i));
        dots.appendChild(button);
      });

      // Add navigation listeners (optional buttons)
      if (prev) {
        prev.addEventListener('click', () => goToSlide(currentIndex - 1));
      }
      if (next) {
        next.addEventListener('click', () => goToSlide(currentIndex + 1));
      }

      // Handle window resize
      window.addEventListener('resize', debounce(updateSlide, 250));

      // Initialize
      updateSlide();
    }
  };

  // Initialize all components
  modalHandler.init();
  carouselHandler.init();
})();