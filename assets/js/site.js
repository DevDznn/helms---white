(() => {
  const header = document.querySelector('[data-js="site-header"]');
  const menuToggle = document.querySelector('[data-js="menu-toggle"]');
  const navigation = document.querySelector('[data-js="site-nav"]');
  const year = document.querySelector('[data-js="current-year"]');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 28);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (!menuToggle || !navigation) {
    return;
  }

  const closeMenu = ({ restoreFocus = false } = {}) => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("has-open-menu");

    if (restoreFocus) {
      menuToggle.focus();
    }
  };

  const openMenu = () => {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");
    navigation.classList.add("is-open");
    document.body.classList.add("has-open-menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("is-open")) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
})();
