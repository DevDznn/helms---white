(() => {
  const setCurrentYear = () => {
    const year = document.getElementById("current-year");
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  };

  const initHeader = () => {
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-button");
    const navigation = document.querySelector(".main-nav");

    if (header) {
      const updateHeader = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 28);
      };

      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (!menuButton || !navigation) {
      return;
    }

    const navigationLinks = Array.from(navigation.querySelectorAll("a"));

    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    const toggleMenu = () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      const nextState = !isOpen;

      menuButton.setAttribute("aria-expanded", String(nextState));
      navigation.classList.toggle("is-open", nextState);
      document.body.classList.toggle("menu-open", nextState);
    };

    menuButton.addEventListener("click", toggleMenu);
    navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  };

  const initHeroVideo = () => {
    const video = document.getElementById("hero-video");
    const heroMedia = document.querySelector(".hero__media");

    if (!video || !heroMedia) {
      return;
    }

    const showPosterFallback = () => heroMedia.classList.add("video-unavailable");
    const showVideo = () => heroMedia.classList.add("video-ready");

    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadeddata", showVideo, { once: true });
    video.addEventListener("canplay", showVideo, { once: true });
    video.addEventListener("error", showPosterFallback);

    video.querySelectorAll("source").forEach((source) => {
      source.addEventListener("error", showPosterFallback);
    });

    video.play().catch(() => {
      // The poster stays visible if autoplay is blocked.
    });
  };

  const initForm = () => {
    const form = document.getElementById("enquiry-form");
    const formNote = document.getElementById("form-note");

    if (!form || !formNote) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      formNote.textContent =
        "Demo only: connect this form to your website or CRM before launch.";
      formNote.classList.add("is-success");
    });
  };

  const initServicesCarousel = () => {
    const viewport = document.querySelector("[data-services-carousel]");
    const track = document.querySelector("[data-services-track]");
    const previousButton = document.querySelector("[data-services-prev]");
    const nextButton = document.querySelector("[data-services-next]");

    if (!viewport || !track || !previousButton || !nextButton) {
      return;
    }

    const slides = Array.from(track.children).filter((child) =>
      child.classList.contains("service-slide"),
    );

    if (slides.length < 2) {
      previousButton.hidden = true;
      nextButton.hidden = true;
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let currentIndex = 0;
    let autoplayTimer = null;

    const getGap = () => {
      const styles = window.getComputedStyle(track);
      return Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    };

    const getSlideWidth = () => {
      const firstSlide = slides[0];
      if (!firstSlide) {
        return 0;
      }

      return firstSlide.getBoundingClientRect().width + getGap();
    };

    const scrollToIndex = (index, animate = true) => {
      const safeIndex = (index + slides.length) % slides.length;
      const targetLeft = safeIndex * getSlideWidth();

      viewport.scrollTo({
        left: targetLeft,
        behavior: animate && !reduceMotion ? "smooth" : "auto",
      });

      currentIndex = safeIndex;
    };

    const stopAutoScroll = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoScroll = () => {
      stopAutoScroll();

      if (reduceMotion) {
        return;
      }

      autoplayTimer = window.setInterval(() => {
        scrollToIndex(currentIndex + 1);
      }, 4000);
    };

    previousButton.addEventListener("click", () => {
      scrollToIndex(currentIndex - 1);
      startAutoScroll();
    });

    nextButton.addEventListener("click", () => {
      scrollToIndex(currentIndex + 1);
      startAutoScroll();
    });

    viewport.addEventListener("mouseenter", stopAutoScroll);
    viewport.addEventListener("mouseleave", startAutoScroll);
    viewport.addEventListener("focusin", stopAutoScroll);
    viewport.addEventListener("focusout", startAutoScroll);
    viewport.addEventListener("touchstart", stopAutoScroll, { passive: true });
    viewport.addEventListener("touchend", startAutoScroll, { passive: true });

    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToIndex(currentIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    });

    window.addEventListener("resize", () => {
      scrollToIndex(currentIndex, false);
    });

    scrollToIndex(0, false);
    startAutoScroll();
  };

  const init = () => {
    setCurrentYear();
    initHeader();
    initHeroVideo();
    initForm();
    initServicesCarousel();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

function initialiseWhyUsStory() {
  const slider = document.querySelector("[data-story-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(
    slider.querySelectorAll("[data-story-slide]")
  );

  const dots = Array.from(
    slider.querySelectorAll("[data-story-dot]")
  );

  if (slides.length < 2) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let currentIndex = 0;
  let timer;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;

      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  const stopSlider = () => {
    window.clearInterval(timer);
  };

  const startSlider = () => {
    if (reduceMotion) {
      return;
    }

    stopSlider();

    timer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 4000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startSlider();
    });
  });

  slider.addEventListener("mouseenter", stopSlider);
  slider.addEventListener("mouseleave", startSlider);
  slider.addEventListener("focusin", stopSlider);
  slider.addEventListener("focusout", startSlider);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSlider();
    } else {
      startSlider();
    }
  });

  showSlide(0);
  startSlider();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initialiseWhyUsStory
  );
} else {
  initialiseWhyUsStory();
}
