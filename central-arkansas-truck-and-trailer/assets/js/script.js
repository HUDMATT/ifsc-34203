/*------------------------ DROPDOWN LOGIC -----------------------*/
/* AI did help with this, wanted a similar idea to the bootstrap dropdowns*/
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const dropdownItems = document.querySelectorAll(".has-dropdown");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  function closeAllDropdowns(except = null) {
    dropdownItems.forEach((item) => {
      if (item !== except) {
        item.classList.remove("open");
        const button = item.querySelector(".dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function closeMainNav() {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();

      const parent = toggle.closest(".has-dropdown");
      const isOpen = parent.classList.contains("open");

      closeAllDropdowns(parent);

      parent.classList.toggle("open", !isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.addEventListener("click", (e) => {
    const clickedInsideDropdown = e.target.closest(".has-dropdown");
    const clickedMenuToggle = e.target.closest(".menu-toggle");
    const clickedInsideNav = e.target.closest(".main-nav");

    if (!clickedInsideDropdown) {
      closeAllDropdowns();
    }

    if (!clickedInsideNav && !clickedMenuToggle && window.innerWidth <= 991) {
      closeMainNav();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
      closeMainNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 991) {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});