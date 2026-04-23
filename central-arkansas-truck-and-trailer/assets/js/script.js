
document.addEventListener("DOMContentLoaded", async () => {
  const XLINK_NS = "http://www.w3.org/1999/xlink";
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const dropdownItems = document.querySelectorAll(".has-dropdown");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  /*---------------------------- SPRITE LOADING LOGIC --------------------------------------*/
  /*copies svg code onto actual HTML if necessary */
  function getUseHref(useElement) {
    return (
      useElement.getAttribute("href") ||
      useElement.getAttributeNS(XLINK_NS, "href") ||
      ""
    );
  }

  function setUseHref(useElement, href) {
    useElement.setAttribute("href", href);
    useElement.setAttributeNS(XLINK_NS, "xlink:href", href);
  }

  function inlineSymbolIntoSvg(svgElement, symbolElement) {
    Array.from(symbolElement.attributes).forEach((attribute) => {
      if (attribute.name === "id") {
        return;
      }

      svgElement.setAttribute(attribute.name, attribute.value);
    });

    svgElement.innerHTML = "";

    Array.from(symbolElement.childNodes).forEach((childNode) => {
      svgElement.appendChild(document.importNode(childNode, true));
    });

    if (svgElement.classList.contains("repair-icon")) {
      svgElement.style.fill = "currentColor";

      svgElement
        .querySelectorAll(
          "path, circle, ellipse, rect, polygon, polyline, line, g",
        )
        .forEach((shapeElement) => {
          if (!shapeElement.hasAttribute("fill")) {
            shapeElement.setAttribute("fill", "currentColor");
          }
        });
    }
  }

  async function inlineExternalSvgSprites() {
    const useElements = Array.from(document.querySelectorAll("use"));
    const externalUses = useElements.filter((useElement) => {
      const href = getUseHref(useElement);
      return href.includes(".svg#");
    });

    if (!externalUses.length) {
      return;
    }

    const spriteCache = new Map();

    await Promise.all(
      externalUses.map(async (useElement) => {
        const href = getUseHref(useElement);
        const [spritePath, symbolId] = href.split("#");

        if (!spritePath || !symbolId) {
          return;
        }

        if (!spriteCache.has(spritePath)) {
          const spriteMarkupPromise = fetch(spritePath)
            .then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Failed to load SVG sprite: ${spritePath} (${response.status})`,
                );
              }

              return response.text();
            })
            .then((markup) => {
              const parser = new DOMParser();
              const parsedDocument = parser.parseFromString(
                markup,
                "image/svg+xml",
              );
              const parsedSvg = parsedDocument.documentElement;

              if (!parsedSvg || parsedSvg.nodeName.toLowerCase() !== "svg") {
                throw new Error(`Invalid SVG sprite markup: ${spritePath}`);
              }

              return parsedDocument;
            })
            .catch((error) => {
              console.error(error);
              return null;
            });

          spriteCache.set(spritePath, spriteMarkupPromise);
        }

        const parsedDocument = await spriteCache.get(spritePath);

        if (!parsedDocument) {
          return;
        }

        const symbolElement = parsedDocument.getElementById(symbolId);
        const svgElement = useElement.closest("svg");

        if (!symbolElement || !svgElement) {
          return;
        }

        inlineSymbolIntoSvg(svgElement, symbolElement);
      }),
    );
  }

  await inlineExternalSvgSprites();

  /*------------------------ DROPDOWN LOGIC -----------------------*/
  /* AI did help with this, wanted a similar idea to the bootstrap dropdowns*/
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
