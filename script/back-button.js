/**
 * Standardized Back Button Component Script
 * Handles GSAP hover, press, and keyboard focus animations
 * as well as smart navigation and theme reactivity.
 */
(function () {
  'use strict';

  function initBackButton() {
    var btn = document.querySelector('.back-btn');
    if (!btn) return;

    // Navigation behavior:
    // If the visitor arrived from within the same domain / site,
    // history.back() preserves scroll position and previous interactive state.
    // If opened directly or from an external site, navigate to the home page (../index.html).
    btn.addEventListener('click', function (e) {
      var referrer = document.referrer;
      var isSameSite = false;

      if (referrer) {
        try {
          var refUrl = new URL(referrer);
          isSameSite = (refUrl.origin === window.location.origin) ||
                       (referrer.indexOf(window.location.host) !== -1) ||
                       (referrer.indexOf('aryaptrha.github.io') !== -1);
        } catch (err) {
          isSameSite = referrer.indexOf(window.location.host) !== -1;
        }
      }

      if (window.history.length > 1 && isSameSite) {
        e.preventDefault();
        window.history.back();
      }
    });

    // Check if GSAP is available
    if (typeof window.gsap === 'undefined') {
      return;
    }

    var gsap = window.gsap;
    btn.classList.add('has-gsap');

    var icon = btn.querySelector('.back-btn__icon');
    var text = btn.querySelector('.back-btn__text');
    var isHovered = false;

    // Helper: Determine if user prefers reduced motion
    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Helper: Get color and glow tokens according to active theme
    function getThemeTokens() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        return {
          hoverColor: '#b537f2',
          hoverBorder: 'rgba(181, 55, 242, 0.7)',
          hoverBg: 'rgba(255, 255, 255, 0.95)',
          hoverShadow: '0 6px 24px rgba(24, 12, 48, 0.16), 0 0 20px rgba(181, 55, 242, 0.4), inset 0 0 10px rgba(181, 55, 242, 0.12)',
          restColor: '#7d18c9',
          restBorder: 'rgba(125, 24, 201, 0.3)',
          restBg: 'rgba(255, 255, 255, 0.88)',
          restShadow: '0 4px 20px rgba(24, 12, 48, 0.08), 0 0 10px rgba(181, 55, 242, 0.15)'
        };
      }
      return {
        hoverColor: '#ff2e97',
        hoverBorder: 'rgba(255, 46, 151, 0.75)',
        hoverBg: 'rgba(25, 10, 30, 0.85)',
        hoverShadow: '0 6px 24px rgba(0, 0, 0, 0.5), 0 0 22px rgba(255, 46, 151, 0.55), inset 0 0 10px rgba(255, 46, 151, 0.15)',
        restColor: '#00f3ff',
        restBorder: 'rgba(0, 243, 255, 0.35)',
        restBg: 'rgba(10, 15, 25, 0.75)',
        restShadow: '0 4px 20px rgba(0, 0, 0, 0.35), 0 0 10px rgba(0, 243, 255, 0.15)'
      };
    }

    // GSAP Hover / Focus Enter Animation
    function onEnter() {
      isHovered = true;
      var tokens = getThemeTokens();

      if (prefersReducedMotion()) {
        gsap.to(btn, {
          color: tokens.hoverColor,
          borderColor: tokens.hoverBorder,
          backgroundColor: tokens.hoverBg,
          boxShadow: tokens.hoverShadow,
          duration: 0.2,
          overwrite: 'auto'
        });
        return;
      }

      // Smooth container lift, nudge, and neon shift
      gsap.to(btn, {
        scale: 1.05,
        x: -4,
        color: tokens.hoverColor,
        borderColor: tokens.hoverBorder,
        backgroundColor: tokens.hoverBg,
        boxShadow: tokens.hoverShadow,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Smooth icon glide pointing left
      if (icon) {
        gsap.to(icon, {
          x: -4,
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Text tracking expansion
      if (text) {
        gsap.to(text, {
          letterSpacing: '0.08em',
          duration: 0.32,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }

    // GSAP Hover / Focus Leave Animation
    function onLeave() {
      isHovered = false;
      var tokens = getThemeTokens();

      if (prefersReducedMotion()) {
        gsap.to(btn, {
          color: tokens.restColor,
          borderColor: tokens.restBorder,
          backgroundColor: tokens.restBg,
          boxShadow: tokens.restShadow,
          duration: 0.2,
          overwrite: 'auto',
          onComplete: function () {
            if (!isHovered) {
              gsap.set(btn, { clearProps: 'color,borderColor,backgroundColor,boxShadow' });
            }
          }
        });
        return;
      }

      // Smooth container return
      gsap.to(btn, {
        scale: 1,
        x: 0,
        color: tokens.restColor,
        borderColor: tokens.restBorder,
        backgroundColor: tokens.restBg,
        boxShadow: tokens.restShadow,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: function () {
          if (!isHovered) {
            gsap.set(btn, { clearProps: 'color,borderColor,backgroundColor,boxShadow' });
          }
        }
      });

      // Reset icon position
      if (icon) {
        gsap.to(icon, {
          x: 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Reset text tracking
      if (text) {
        gsap.to(text, {
          letterSpacing: '0.05em',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }

    // Press / Active tactile feedback
    function onDown() {
      if (prefersReducedMotion()) return;
      gsap.to(btn, {
        scale: 0.96,
        duration: 0.1,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }

    function onUp() {
      if (prefersReducedMotion()) return;
      if (isHovered) {
        gsap.to(btn, {
          scale: 1.05,
          duration: 0.15,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      } else {
        gsap.to(btn, {
          scale: 1,
          duration: 0.15,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
    }

    // Attach interaction events
    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    btn.addEventListener('focus', onEnter);
    btn.addEventListener('blur', onLeave);
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);

    // Touch devices cleanup
    btn.addEventListener('touchstart', onDown, { passive: true });
    btn.addEventListener('touchend', function () {
      setTimeout(onLeave, 300);
    }, { passive: true });
    btn.addEventListener('touchcancel', onLeave, { passive: true });

    // React immediately if the theme changes while on the page
    if (window.MutationObserver) {
      var themeObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            if (isHovered) {
              onEnter();
            } else {
              onLeave();
            }
          }
        });
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackButton);
  } else {
    initBackButton();
  }
})();
