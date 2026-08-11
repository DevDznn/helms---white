(() => {
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const prefersReducedMotion = reducedMotionQuery.matches;

  /* =========================================================
     Hero video
     ========================================================= */

  const initHeroVideo = () => {
    const video = document.querySelector('[data-js="hero-video"]');
    const media = document.querySelector('[data-js="hero-media"]');

    if (!video || !media) {
      return;
    }

    const showFallback = () => {
      media.classList.add("video-unavailable");
      media.classList.remove("video-ready");
    };

    const showVideo = () => {
      media.classList.add("video-ready");
      media.classList.remove("video-unavailable");
    };

    video.addEventListener("loadeddata", showVideo, { once: true });
    video.addEventListener("canplay", showVideo, { once: true });
    video.addEventListener("error", showFallback, { once: true });

    video.querySelectorAll("source").forEach((source) => {
      source.addEventListener("error", showFallback, { once: true });
    });

    if (prefersReducedMotion) {
      video.pause();
      showFallback();
      return;
    }

    video.play().catch(() => {
      // Poster remains visible if autoplay is unavailable.
    });
  };

  /* =========================================================
     Enquiry form
     ========================================================= */

  const initEnquiryForm = () => {
    const form = document.querySelector('[data-js="enquiry-form"]');
    const status = document.querySelector('[data-js="form-status"]');

    if (!form || !status) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      status.textContent =
        "Demo only: connect this form to your website or CRM before launch.";

      status.classList.add("is-success");
    });
  };

  /* =========================================================
     Services carousel
     ========================================================= */

  const initServicesCarousel = () => {
    const viewport = document.querySelector('[data-js="services-carousel"]');

    const track = document.querySelector('[data-js="services-track"]');

    const previousButton = document.querySelector('[data-js="services-prev"]');

    const nextButton = document.querySelector('[data-js="services-next"]');

    if (!viewport || !track || !previousButton || !nextButton) {
      return;
    }

    const slides = Array.from(track.querySelectorAll(".service-slide"));

    if (slides.length < 2) {
      previousButton.hidden = true;
      nextButton.hidden = true;
      return;
    }

    let currentIndex = 0;
    let autoplayTimer = null;

    const getStep = () => {
      const styles = window.getComputedStyle(track);

      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;

      return slides[0].getBoundingClientRect().width + gap;
    };

    const scrollToIndex = (index, animate = true) => {
      currentIndex = (index + slides.length) % slides.length;

      viewport.scrollTo({
        left: currentIndex * getStep(),
        behavior: animate && !prefersReducedMotion ? "smooth" : "auto",
      });
    };

    const stopAutoplay = () => {
      if (autoplayTimer !== null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();

      if (!prefersReducedMotion) {
        autoplayTimer = window.setInterval(() => {
          scrollToIndex(currentIndex + 1);
        }, 4000);
      }
    };

    previousButton.addEventListener("click", () => {
      scrollToIndex(currentIndex - 1);
      startAutoplay();
    });

    nextButton.addEventListener("click", () => {
      scrollToIndex(currentIndex + 1);
      startAutoplay();
    });

    ["mouseenter", "focusin", "touchstart"].forEach((eventName) => {
      viewport.addEventListener(eventName, stopAutoplay, {
        passive: eventName === "touchstart",
      });
    });

    ["mouseleave", "focusout", "touchend"].forEach((eventName) => {
      viewport.addEventListener(eventName, startAutoplay, {
        passive: eventName === "touchend",
      });
    });

    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();

        scrollToIndex(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
      }
    });

    window.addEventListener("resize", () => {
      scrollToIndex(currentIndex, false);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    scrollToIndex(0, false);
    startAutoplay();
  };

  /* =========================================================
     Story slider
     ========================================================= */

  const initStorySlider = () => {
    const slider = document.querySelector('[data-js="story-slider"]');

    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-story-slide]"));

    const dots = Array.from(slider.querySelectorAll("[data-story-dot]"));

    if (slides.length < 2) {
      return;
    }

    let currentIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentIndex;

        slide.classList.toggle("is-active", active);

        slide.setAttribute("aria-hidden", String(!active));
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === currentIndex;

        dot.classList.toggle("is-active", active);

        dot.setAttribute("aria-current", String(active));
      });
    };

    const stop = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();

      if (!prefersReducedMotion) {
        timer = window.setInterval(() => {
          showSlide(currentIndex + 1);
        }, 4000);
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    showSlide(0);
    start();
  };

  /* =========================================================
     Mobile trust strip
     Infinite continuous autoplay carousel
     ========================================================= */

  const initTrustCarousel = () => {
    const viewport = document.querySelector(".trust-strip__viewport");

    const track = document.querySelector(".trust-strip__track");

    if (!viewport || !track) {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 680px)");

    const items = Array.from(track.querySelectorAll(".trust-strip__item"));

    if (items.length < 2) {
      return;
    }

    let animationFrame = null;
    let resizeTimer = null;
    let resumeTimer = null;

    let position = 0;
    let loopWidth = 0;
    let lastTime = null;
    let isPaused = false;

    /*
     * Movement speed in pixels per second.
     *
     * 18 = slower
     * 24 = recommended
     * 30 = slightly faster
     * 36 = faster
     */
    const speed = 24;

    /* =========================================================
       Remove duplicated items
       ========================================================= */

    const removeClones = () => {
      track.querySelectorAll("[data-trust-clone]").forEach((clone) => {
        clone.remove();
      });
    };

    /* =========================================================
       Duplicate original items
       ========================================================= */

    const createClones = () => {
      removeClones();

      items.forEach((item) => {
        const clone = item.cloneNode(true);

        clone.setAttribute("data-trust-clone", "");

        clone.setAttribute("aria-hidden", "true");

        track.appendChild(clone);
      });
    };

    /* =========================================================
       Calculate distance of original group
       ========================================================= */

    const calculateLoopWidth = () => {
      const firstItem = items[0];

      const firstClone = track.querySelector("[data-trust-clone]");

      if (!firstItem || !firstClone) {
        loopWidth = 0;
        return;
      }

      loopWidth = firstClone.offsetLeft - firstItem.offsetLeft;
    };

    /* =========================================================
       Move track
       ========================================================= */

    const render = () => {
      track.style.transform = `translate3d(${-position}px, 0, 0)`;
    };

    /* =========================================================
       Continuous animation
       ========================================================= */

    const animate = (time) => {
      if (lastTime === null) {
        lastTime = time;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.05);

      lastTime = time;

      if (
        mobileQuery.matches &&
        !reducedMotionQuery.matches &&
        !isPaused &&
        loopWidth > 0
      ) {
        position += speed * delta;

        /*
         * Once the original group has passed,
         * move back to the equivalent position.
         *
         * Since the duplicate group is identical,
         * this reset should not be visible.
         */
        if (position >= loopWidth) {
          position -= loopWidth;
        }

        render();
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    /* =========================================================
       Stop animation
       ========================================================= */

    const stopAnimation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);

        animationFrame = null;
      }

      lastTime = null;
    };

    /* =========================================================
       Start animation
       ========================================================= */

    const startAnimation = () => {
      stopAnimation();

      if (mobileQuery.matches && !reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    /* =========================================================
       Build / rebuild carousel
       ========================================================= */

    const setupCarousel = () => {
      stopAnimation();

      removeClones();

      position = 0;
      loopWidth = 0;
      lastTime = null;
      isPaused = false;

      track.style.transform = "";

      /*
       * Desktop/tablet:
       * use normal static grid.
       */
      if (!mobileQuery.matches) {
        return;
      }

      /*
       * Mobile:
       * duplicate cards for infinite loop.
       */
      createClones();

      /*
       * Wait until layout has recalculated.
       */
      window.requestAnimationFrame(() => {
        calculateLoopWidth();
        render();
        startAnimation();
      });
    };

    /* =========================================================
       Pause on user interaction
       ========================================================= */

    const pauseCarousel = () => {
      isPaused = true;

      window.clearTimeout(resumeTimer);
    };

    const resumeCarousel = () => {
      window.clearTimeout(resumeTimer);

      resumeTimer = window.setTimeout(() => {
        isPaused = false;
      }, 1000);
    };

    viewport.addEventListener("touchstart", pauseCarousel, {
      passive: true,
    });

    viewport.addEventListener("touchend", resumeCarousel, {
      passive: true,
    });

    viewport.addEventListener("touchcancel", resumeCarousel, {
      passive: true,
    });

    viewport.addEventListener("mouseenter", pauseCarousel);

    viewport.addEventListener("mouseleave", () => {
      isPaused = false;
    });

    /* =========================================================
       Stop when browser tab is hidden
       ========================================================= */

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    });

    /* =========================================================
       Rebuild after resize / rotation
       ========================================================= */

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        setupCarousel();
      }, 150);
    });

    /* =========================================================
       React to breakpoint change
       ========================================================= */

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", setupCarousel);
    }

    /* =========================================================
       Start trust carousel
       ========================================================= */

    setupCarousel();
  };

  /* =========================================================
   New patient promotion popup
   Opens after hero has been visible for 5 seconds
   ========================================================= */

  const initPromoModal = () => {
    const modal = document.querySelector('[data-js="promo-modal"]');

    if (!modal) {
      return;
    }

    const dialog = modal.querySelector(".promo-modal__dialog");

    const closeButtons = Array.from(
      modal.querySelectorAll('[data-js="promo-close"]'),
    );

    const detailsButton = modal.querySelector('[data-js="promo-details"]');

    if (!dialog) {
      return;
    }

    let showTimer = null;
    let previousFocus = null;

    /*
     * Show only once during this page load.
     *
     * Refreshing the page resets this to false
     * and starts a new 5-second countdown.
     */
    let hasShown = false;

    /*
     * 5000ms = 5 seconds
     */
    const popupDelay = 5000;

    /* =========================================================
     Clear popup timer
     ========================================================= */

    const clearShowTimer = () => {
      if (showTimer !== null) {
        window.clearTimeout(showTimer);

        showTimer = null;
      }
    };

    /* =========================================================
     Open popup
     ========================================================= */

    const openModal = () => {
      if (hasShown) {
        return;
      }

      hasShown = true;

      clearShowTimer();

      previousFocus = document.activeElement;

      /*
       * Make popup available in DOM.
       */
      modal.hidden = false;

      /*
       * Stop the page behind the popup
       * from scrolling.
       */
      document.body.classList.add("promo-modal-open");

      /*
       * Wait one frame before adding
       * is-open so CSS animation works.
       */
      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");

        const closeButton = modal.querySelector(".promo-modal__close");

        if (closeButton) {
          closeButton.focus({
            preventScroll: true,
          });
        }
      });
    };

    /* =========================================================
     Close popup
     ========================================================= */

    const closeModal = (restoreFocus = true) => {
      modal.classList.remove("is-open");

      document.body.classList.remove("promo-modal-open");

      const finishClose = () => {
        modal.hidden = true;

        if (
          restoreFocus &&
          previousFocus &&
          typeof previousFocus.focus === "function"
        ) {
          previousFocus.focus({
            preventScroll: true,
          });
        }
      };

      /*
       * No transition delay when
       * reduced motion is enabled.
       */
      if (reducedMotionQuery.matches) {
        finishClose();
        return;
      }

      /*
       * Must match popup CSS transition.
       */
      window.setTimeout(finishClose, 430);
    };

    /* =========================================================
     Start the 5-second countdown
     ========================================================= */

    const startCountdown = () => {
      /*
       * Don't create duplicate timers.
       */
      if (hasShown || showTimer !== null) {
        return;
      }

      showTimer = window.setTimeout(() => {
        showTimer = null;

        openModal();
      }, popupDelay);
    };

    /* =========================================================
     Close buttons
     ========================================================= */

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        closeModal();
      });
    });

    /* =========================================================
     More offer details
     ========================================================= */

    if (detailsButton) {
      detailsButton.addEventListener("click", (event) => {
        event.preventDefault();

        const target = document.querySelector("#new-patient-offer");

        /*
         * Close popup first.
         */
        closeModal(false);

        /*
         * Then scroll to permanent
         * offer section.
         */
        window.setTimeout(
          () => {
            if (!target) {
              return;
            }

            target.scrollIntoView({
              behavior: reducedMotionQuery.matches ? "auto" : "smooth",

              block: "start",
            });
          },

          reducedMotionQuery.matches ? 0 : 430,
        );
      });
    }

    /* =========================================================
     Escape key closes popup
     ========================================================= */

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });

    /* =========================================================
     Keep keyboard focus inside popup
     ========================================================= */

    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab" || modal.hidden) {
        return;
      }

      const focusable = Array.from(
        modal.querySelectorAll(
          `
              a[href],
              button:not([disabled]),
              [tabindex]:not([tabindex="-1"])
            `,
        ),
      ).filter((element) => !element.hasAttribute("hidden"));

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      /*
       * Shift + Tab from first element
       * goes to last element.
       */
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();

        last.focus();

        return;
      }

      /*
       * Tab from last element
       * goes back to first.
       */
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();

        first.focus();
      }
    });

    /* =========================================================
     START COUNTDOWN IMMEDIATELY
     ========================================================= */

    /*
     * This is the important change.
     *
     * As soon as the homepage JavaScript
     * initializes, the five-second timer begins.
     *
     * Scrolling away from the hero DOES NOT:
     *
     * - stop the timer
     * - reset the timer
     * - restart the timer
     *
     * After five seconds the popup appears,
     * regardless of which section the visitor
     * has scrolled to.
     */
    startCountdown();
  };
  /* =========================================================
     Initialise entire home page
     ========================================================= */

  const init = () => {
    initHeroVideo();
    initEnquiryForm();
    initPromoModal();
    initServicesCarousel();
    initStorySlider();
    initTrustCarousel();
  };

  /* =========================================================
     Wait until HTML is ready
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true,
    });
  } else {
    init();
  }
})();
