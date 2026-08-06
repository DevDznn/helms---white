(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initHeroVideo = () => {
    const video = document.querySelector('[data-js="hero-video"]');
    const media = document.querySelector('[data-js="hero-media"]');

    if (!video || !media) {
      return;
    }

    const showFallback = () => media.classList.add("video-unavailable");
    const showVideo = () => media.classList.add("video-ready");

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
      // The poster remains visible when autoplay is unavailable.
    });
  };

  const initEnquiryForm = () => {
    const form = document.querySelector('[data-js="enquiry-form"]');
    const status = document.querySelector('[data-js="form-status"]');

    if (!form || !status) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      status.textContent = "Demo only: connect this form to your website or CRM before launch.";
      status.classList.add("is-success");
    });
  };

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
    let autoplayTimer;

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

    const stopAutoplay = () => window.clearInterval(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (!prefersReducedMotion) {
        autoplayTimer = window.setInterval(() => scrollToIndex(currentIndex + 1), 4000);
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
      viewport.addEventListener(eventName, stopAutoplay, { passive: eventName === "touchstart" });
    });
    ["mouseleave", "focusout", "touchend"].forEach((eventName) => {
      viewport.addEventListener(eventName, startAutoplay, { passive: eventName === "touchend" });
    });

    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
      }
    });

    window.addEventListener("resize", () => scrollToIndex(currentIndex, false));
    document.addEventListener("visibilitychange", () => document.hidden ? stopAutoplay() : startAutoplay());

    scrollToIndex(0, false);
    startAutoplay();
  };

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
    let timer;

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

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!prefersReducedMotion) {
        timer = window.setInterval(() => showSlide(currentIndex + 1), 4000);
      }
    };

    dots.forEach((dot, index) => dot.addEventListener("click", () => {
      showSlide(index);
      start();
    }));
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

    showSlide(0);
    start();
  };

  const init = () => {
    initHeroVideo();
    initEnquiryForm();
    initServicesCarousel();
    initStorySlider();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
