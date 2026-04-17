const DATA_PATH = "assets/data/content.json";

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatHeroSummary(summaryText) {
  const escaped = escapeHtml(summaryText);
  return escaped
    .replace(
      /generative models for personalized and consistent visual generation and editing/g,
      "<strong>generative models for personalized and consistent visual generation and editing</strong>"
    )
    .replace(/vision-language models/g, "<strong>vision-language models</strong>");
}

function createLink(href, label, icon) {
  const a = document.createElement("a");
  a.href = href;
  if (!href.startsWith("mailto:")) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  const iconValue = safeText(icon);
  if (iconValue) {
    if (iconValue.startsWith("emoji:")) {
      const emoji = document.createElement("span");
      emoji.className = "social-emoji";
      emoji.textContent = iconValue.replace("emoji:", "");
      a.appendChild(emoji);
    } else {
      const img = document.createElement("img");
      img.src = iconValue;
      img.alt = "";
      img.loading = "lazy";
      a.appendChild(img);
    }
  }

  const span = document.createElement("span");
  span.textContent = label;
  a.appendChild(span);
  return a;
}

function getOrgAndPeriod(item = {}) {
  const org = safeText(item.org);
  const period = safeText(item.period);
  if (org || period) {
    return { org, period };
  }

  const meta = safeText(item.meta);
  if (!meta.includes(" · ")) {
    return { org: meta, period: "" };
  }

  const parts = meta.split(" · ");
  const right = parts.pop() || "";
  const left = parts.join(" · ");
  return { org: left, period: right };
}

function renderHero(data) {
  document.title = `${safeText(data.name, "Your Name")} | Personal Page`;
  document.getElementById("hero-name").textContent = safeText(data.name, "Your Name");
  document.getElementById("hero-role").textContent = safeText(data.role, "Role");
  document.getElementById("hero-location").textContent = safeText(data.location, "Location");
  const heroSummary = document.getElementById("hero-summary");
  heroSummary.innerHTML = formatHeroSummary(
    safeText(data.summary, "Short professional summary goes here.")
  );

  const heroImage = document.getElementById("hero-image");
  if (safeText(data.image)) {
    heroImage.src = data.image;
  }
  heroImage.alt = safeText(data.imageAlt, "Profile photo");

  const socials = document.getElementById("social-links");
  socials.innerHTML = "";
  safeArray(data.socialLinks).forEach((item) => {
    if (!safeText(item.url) || !safeText(item.label)) return;
    socials.appendChild(createLink(item.url, item.label, item.icon));
  });
}

function renderExperience(items) {
  const root = document.getElementById("experience-list");
  root.innerHTML = "";

  safeArray(items).forEach((item) => {
    const article = document.createElement("article");
    article.className = "timeline-item";

    const head = document.createElement("div");
    head.className = "timeline-head";

    const titleWrap = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = safeText(item.role, "Role");
    const company = document.createElement("p");
    company.className = "meta";
    company.textContent = [safeText(item.org, "Organization"), safeText(item.team)]
      .filter(Boolean)
      .join(" · ");

    const period = document.createElement("p");
    period.className = "meta";
    period.textContent = safeText(item.period, "Period");

    const side = document.createElement("div");
    side.className = "timeline-side";

    const logoSlot = document.createElement("div");
    logoSlot.className = "experience-logo-slot";
    if (safeText(item.logo)) {
      const img = document.createElement("img");
      img.src = item.logo;
      img.alt = safeText(item.logoAlt, `${safeText(item.org, "Organization")} logo`);
      logoSlot.appendChild(img);
    } else {
      const fallback = document.createElement("span");
      fallback.className = "experience-logo-fallback";
      fallback.textContent = "Logo";
      logoSlot.appendChild(fallback);
    }

    titleWrap.appendChild(h3);
    titleWrap.appendChild(company);
    head.appendChild(titleWrap);
    side.appendChild(period);
    side.appendChild(logoSlot);
    head.appendChild(side);

    const desc = document.createElement("p");
    desc.textContent = safeText(item.description, "Describe your impact and scope here.");

    article.appendChild(head);
    if (safeText(item.location)) {
      const location = document.createElement("p");
      location.className = "meta";
      location.textContent = item.location;
      article.appendChild(location);
    }
    article.appendChild(desc);
    root.appendChild(article);
  });
}

function renderEducation(items) {
  const root = document.getElementById("education-list");
  root.innerHTML = "";

  const groups = new Map();
  safeArray(items).forEach((item) => {
    const school = safeText(item.school, "Institution");
    if (!groups.has(school)) {
      groups.set(school, {
        school,
        logo: safeText(item.logo),
        logoAlt: safeText(item.logoAlt, `${school} logo`),
        entries: [],
      });
    }
    groups.get(school).entries.push(item);
  });

  groups.forEach((group) => {
    const article = document.createElement("article");
    article.className = "education-item";

    const media = document.createElement("div");
    media.className = "education-logo";
    if (safeText(group.logo)) {
      const img = document.createElement("img");
      img.src = group.logo;
      img.alt = safeText(group.logoAlt, `${group.school} logo`);
      media.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "education-logo-fallback";
      fallback.textContent = group.school
        .split(/[ ,]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((part) => part[0].toUpperCase())
        .join("");
      media.appendChild(fallback);
    }

    const body = document.createElement("div");
    body.className = "education-body";

    const org = document.createElement("h3");
    org.className = "education-school";
    org.textContent = group.school;
    body.appendChild(org);

    const entryList = document.createElement("ul");
    entryList.className = "education-entries";

    group.entries.forEach((item) => {
      const entry = document.createElement("li");
      entry.className = "education-entry";

      const head = document.createElement("div");
      head.className = "timeline-head";

      const degree = document.createElement("p");
      degree.className = "education-degree";
      degree.textContent = safeText(item.degree, "Degree");

      const period = document.createElement("p");
      period.className = "meta";
      period.textContent = safeText(item.period, "Period");

      head.appendChild(degree);
      head.appendChild(period);
      entry.appendChild(head);

      if (safeText(item.advisor)) {
        const advisor = document.createElement("p");
        advisor.className = "meta";
        advisor.textContent = `Advisor: ${item.advisor}`;
        entry.appendChild(advisor);
      }

      if (safeText(item.description)) {
        const desc = document.createElement("p");
        desc.className = "meta";
        desc.textContent = item.description;
        entry.appendChild(desc);
      }

      entryList.appendChild(entry);
    });

    body.appendChild(entryList);

    article.appendChild(media);
    article.appendChild(body);
    root.appendChild(article);
  });
}

function renderProjects(items) {
  const root = document.getElementById("projects-list");
  if (!root) return;
  root.innerHTML = "";

  safeArray(items).forEach((item) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const head = document.createElement("div");
    head.className = "timeline-head";

    const titleWrap = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = safeText(item.title, "Project title");
    titleWrap.appendChild(h3);

    const { org, period } = getOrgAndPeriod(item);
    if (org) {
      const orgLine = document.createElement("p");
      orgLine.className = "meta";
      orgLine.textContent = org;
      titleWrap.appendChild(orgLine);
    }

    head.appendChild(titleWrap);

    if (period) {
      const periodLine = document.createElement("p");
      periodLine.className = "meta";
      periodLine.textContent = period;
      head.appendChild(periodLine);
    }

    card.appendChild(head);

    const desc = document.createElement("p");
    desc.textContent = safeText(item.description, "Project summary.");

    card.appendChild(desc);
    root.appendChild(card);
  });
}

function renderPublications(items) {
  const root = document.getElementById("publications-list");
  root.innerHTML = "";

  const stack = document.createElement("div");
  stack.className = "publication-stack";

  safeArray(items).forEach((item) => {
    const card = document.createElement("article");
    card.className = "publication-card";

    const body = document.createElement("div");
    body.className = "publication-body";

    const title = document.createElement("h4");
    title.textContent = safeText(item.title, "Publication title");

    const authors = document.createElement("p");
    authors.className = "authors";
    const authorText = safeText(item.authors, "Authors");
    authors.innerHTML = authorText
      .replace(/Kyoungmin Lee\*/g, "<strong>Kyoungmin Lee*</strong>")
      .replace(/Kyoungmin Lee(?!\*)/g, "<strong>Kyoungmin Lee</strong>");

    const venue = document.createElement("p");
    venue.className = "venue";
    venue.textContent = safeText(item.venue, "Venue");

    const links = document.createElement("div");
    links.className = "pub-links";
    safeArray(item.links).forEach((link) => {
      if (!safeText(link.url) || !safeText(link.label)) return;
      links.appendChild(createLink(link.url, link.label));
    });

    body.appendChild(title);
    body.appendChild(authors);
    body.appendChild(venue);
    if (links.childElementCount > 0) {
      body.appendChild(links);
    }

    const media = document.createElement("div");
    media.className = "publication-media";
    if (safeText(item.image)) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = safeText(item.imageAlt, `${safeText(item.title, "Publication")} preview`);
      img.dataset.caption = safeText(item.title, "Publication");
      media.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "publication-media-fallback";
      fallback.textContent = safeText(item.mediaLabel, safeText(item.year, ""));
      media.appendChild(fallback);
    }

    card.appendChild(body);
    card.appendChild(media);
    stack.appendChild(card);
  });

  root.appendChild(stack);
}

function renderSimpleCards(containerId, items) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.innerHTML = "";

  safeArray(items).forEach((item) => {
    const card = document.createElement("article");
    card.className = "talk-card";

    const title = document.createElement("h3");
    title.textContent = safeText(item.title, "Title");
    card.appendChild(title);

    if (safeText(item.meta)) {
      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = item.meta;
      card.appendChild(meta);
    }

    if (safeText(item.description)) {
      const summary = document.createElement("p");
      summary.textContent = item.description;
      card.appendChild(summary);
    }

    if (safeText(item.url)) {
      const links = document.createElement("div");
      links.className = "pub-links";
      links.appendChild(createLink(item.url, safeText(item.urlLabel, "View")));
      card.appendChild(links);
    }

    root.appendChild(card);
  });
}

function renderAcademicOneLine(containerId, items) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.innerHTML = "";

  const list = document.createElement("ul");
  list.className = "academic-list";

  safeArray(items).forEach((item) => {
    const line = document.createElement("li");
    line.className = "academic-line";

    const metaText = safeText(item.meta).replace(/\s*·\s*/g, ", ");
    const parts = [safeText(item.title), metaText].filter(Boolean);

    if (parts.length === 0) {
      const fallback = [safeText(item.org), safeText(item.period)].filter(Boolean).join(", ");
      if (!fallback) return;
      line.textContent = fallback;
    } else {
      line.textContent = parts.join(", ");
    }

    const validLinks = safeArray(item.links).filter(
      (link) => safeText(link.url) && safeText(link.label)
    );
    if (validLinks.length > 0) {
      line.appendChild(document.createTextNode(" "));
      validLinks.forEach((link, index) => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = `[${link.label}]`;
        line.appendChild(a);
        if (index < validLinks.length - 1) {
          line.appendChild(document.createTextNode(" "));
        }
      });
    }

    list.appendChild(line);
  });

  root.appendChild(list);
}

function renderNews(items) {
  const root = document.getElementById("news-list");
  if (!root) return;

  root.innerHTML = "";
  const newsItems = safeArray(items);
  if (newsItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "Updates will be posted here.";
    root.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "academic-list";

  newsItems.forEach((item) => {
    const line = document.createElement("li");
    line.className = "academic-line";

    const normalizedTitle = safeText(item.title).replace(/\s*·\s*/g, ", ");
    const normalizedMeta = safeText(item.meta).replace(/\s*·\s*/g, ", ");
    const bracketMatch = normalizedTitle.match(/^\[[^\]]+\]\s*/);

    if (bracketMatch) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "news-date";
      dateSpan.textContent = bracketMatch[0].trim();
      line.appendChild(dateSpan);

      const rest = normalizedTitle.slice(bracketMatch[0].length).trim();
      if (rest) {
        line.appendChild(document.createTextNode(` ${rest}`));
      }
    } else {
      line.textContent = normalizedTitle;
    }

    if (normalizedMeta) {
      if (line.textContent.trim().length > 0) {
        line.appendChild(document.createTextNode(`, ${normalizedMeta}`));
      } else {
        line.textContent = normalizedMeta;
      }
    }

    const validLinks = safeArray(item.links).filter(
      (link) => safeText(link.url) && safeText(link.label)
    );
    if (validLinks.length > 0) {
      line.appendChild(document.createTextNode(" "));
      validLinks.forEach((link, index) => {
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = `[${link.label}]`;
        line.appendChild(a);
        if (index < validLinks.length - 1) {
          line.appendChild(document.createTextNode(" "));
        }
      });
    }

    list.appendChild(line);
  });

  root.appendChild(list);
}

function renderContact(contact) {
  document.getElementById("contact-text").textContent = safeText(
    contact.text,
    "For collaborations, consulting, or speaking invitations, reach out via email."
  );

  const list = document.getElementById("contact-list");
  list.innerHTML = "";

  const rows = [
    ["Email", contact.email, `mailto:${contact.email || ""}`],
    ["Location", contact.location, null],
    ["CV", contact.cvLabel || "Download CV", contact.cvUrl || null],
  ];

  rows.forEach(([label, value, href]) => {
    if (!safeText(value)) return;
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = `${label}:`;
    li.appendChild(strong);

    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = value;
      if (!href.startsWith("mailto:")) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      li.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.textContent = value;
      li.appendChild(span);
    }

    list.appendChild(li);
  });
}

function setupActiveSectionNav() {
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const ratioById = new Map();

  function applyActive(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === id);
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = `#${entry.target.id}`;
        ratioById.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let activeId = "";
      let bestRatio = 0;
      ratioById.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          activeId = id;
        }
      });

      if (activeId) {
        applyActive(activeId);
      }
    },
    {
      threshold: [0.2, 0.4, 0.6, 0.8],
    }
  );

  sections.forEach((section) => {
    ratioById.set(`#${section.id}`, 0);
    io.observe(section);
  });

  // Ensure a stable initial state before observer callbacks settle.
  const initialId = sections[0] ? `#${sections[0].id}` : "";
  if (initialId) {
    applyActive(initialId);
  }
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  elements.forEach((element) => io.observe(element));
}

function setupPublicationImageLightbox() {
  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.setAttribute("aria-hidden", "true");

  const frame = document.createElement("div");
  frame.className = "image-lightbox-frame";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "image-lightbox-close";
  closeButton.setAttribute("aria-label", "Close image preview");
  closeButton.textContent = "X";

  const image = document.createElement("img");
  image.className = "image-lightbox-image";
  image.alt = "";

  const caption = document.createElement("p");
  caption.className = "image-lightbox-caption";

  frame.appendChild(closeButton);
  frame.appendChild(image);
  frame.appendChild(caption);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);

  function closeLightbox() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    image.src = "";
    caption.textContent = "";
  }

  function openLightbox(src, alt, titleText) {
    image.src = src;
    image.alt = alt || "Publication image";
    caption.textContent = safeText(titleText);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickedImage = target.closest("#publications .publication-media img");
    if (clickedImage instanceof HTMLImageElement) {
      openLightbox(clickedImage.src, clickedImage.alt, clickedImage.dataset.caption || "");
      return;
    }

    if (target === overlay || target.closest(".image-lightbox-close")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("open")) {
      closeLightbox();
    }
  });
}

function cleanupLegacyServiceWorkerAndCaches() {
  if (typeof window === "undefined") return;

  const marker = "sw-cleanup-v1";
  try {
    if (window.sessionStorage.getItem(marker) === "done") return;
  } catch (_) {
    return;
  }

  const tasks = [];
  let touched = false;

  if ("serviceWorker" in navigator) {
    tasks.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) =>
              registration.unregister().then((ok) => {
                if (ok) touched = true;
              })
            )
          )
        )
        .catch(() => {})
    );
  }

  if ("caches" in window) {
    tasks.push(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames.map((cacheName) =>
              caches.delete(cacheName).then((ok) => {
                if (ok) touched = true;
              })
            )
          )
        )
        .catch(() => {})
    );
  }

  Promise.all(tasks).finally(() => {
    try {
      window.sessionStorage.setItem(marker, "done");
    } catch (_) {
      return;
    }

    if (touched) {
      window.location.reload();
    }
  });
}

async function loadContent() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load ${DATA_PATH} (status ${response.status})`);
    }

    const data = await response.json();

    renderHero(data.profile || {});
    renderNews(data.news || []);
    renderEducation(data.education || []);
    renderExperience(data.experience || []);
    renderProjects(data.projects || []);
    renderPublications(data.publications || []);
    renderAcademicOneLine("awards-list", data.awards || []);
    renderAcademicOneLine("other-experience-list", data.exhibitions || []);
    renderAcademicOneLine("reviewer-list", data.reviewer || []);

  } catch (error) {
    console.error(error);
    const fallback = document.querySelector("#education .section-head");
    if (fallback) {
      fallback.insertAdjacentHTML(
        "afterend",
        '<p class="meta">Content could not be loaded. Make sure you are running the page from a local server.</p>'
      );
    }
  }
}

function setupMisc() {
  cleanupLegacyServiceWorkerAndCaches();
  setupActiveSectionNav();
  setupRevealAnimations();
  setupPublicationImageLightbox();
}

loadContent();
setupMisc();
