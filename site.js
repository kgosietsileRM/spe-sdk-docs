(() => {
  const search = document.getElementById("docs-search");
  const content = document.getElementById("docs-content");
  const status = document.getElementById("docs-search-status");
  const outline = document.getElementById("page-outline");
  if (!content) return;

  const sections = [...content.querySelectorAll(".manual-section, .search-item")];
  const headings = [...content.querySelectorAll(".manual-section-head h1, .markdown-body h2, .markdown-body h3")];

  if (outline && headings.length) {
    for (const heading of headings) {
      if (!heading.id) continue;
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      if (heading.tagName === "H3") link.classList.add("sub");
      link.dataset.outlineTarget = heading.id;
      outline.appendChild(link);
    }
  }

  function filterContent() {
    const query = (search?.value || "").trim().toLowerCase();
    let matches = 0;
    for (const section of sections) {
      const found = !query || section.textContent.toLowerCase().includes(query);
      section.hidden = !found;
      if (found) matches += 1;
    }
    if (status) {
      status.hidden = !query;
      status.textContent = query
        ? `${matches} matching section${matches === 1 ? "" : "s"} on this page`
        : "";
    }
    for (const link of outline?.querySelectorAll("[data-outline-target]") || []) {
      const heading = document.getElementById(link.dataset.outlineTarget);
      const parent = heading?.closest(".manual-section") || heading?.closest(".search-item");
      link.hidden = Boolean(parent?.hidden);
    }
  }

  search?.addEventListener("input", filterContent);
  document.addEventListener("keydown", (event) => {
    const tag = event.target?.tagName?.toLowerCase();
    if (event.key === "/" && !["input", "textarea", "select"].includes(tag)) {
      event.preventDefault();
      search?.focus();
    } else if (event.key === "Escape" && document.activeElement === search) {
      search.value = "";
      filterContent();
      search.blur();
    }
  });

  for (const pre of content.querySelectorAll("pre")) {
    pre.classList.add("copyable-code");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code example");
    button.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.innerText || pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = "Copy"; }, 1200);
      } catch {
        button.textContent = "Select code";
      }
    });
    pre.appendChild(button);
  }

  const tocLinks = [...(outline?.querySelectorAll("a") || [])];
  if ("IntersectionObserver" in window && tocLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of tocLinks) link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      }
    }, { root: document.querySelector(".docs-reading-layout"), rootMargin: "-12% 0px -76% 0px" });
    for (const heading of headings) if (heading.id) observer.observe(heading);
  }

  filterContent();
})();
