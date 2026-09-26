/* ============================================================
   Batch Lessons Hub — home.js
   Dummy data + rendering + animations + views + search/filter
   ============================================================ */

// ------------------------------------------------------------
// TODO: replace with Supabase fetch — see loadSubjects()
// ------------------------------------------------------------
let SUBJECTS = []; // will be filled from Supabase

// ------------------------------------------------------------
// DOM refs
// ------------------------------------------------------------
const grid           = document.getElementById("subjects-grid");
const skeletonGrid   = document.getElementById("skeleton-grid");
const emptyState     = document.getElementById("empty-state");
const searchInput    = document.getElementById("search-input");
const subjectsCount  = document.getElementById("subjects-count");
const skeletonToggle = document.getElementById("skeleton-toggle");
const searchWrap     = document.getElementById("header-search-wrap");

// View containers
const views = {
  landing:  document.getElementById("view-landing"),
  subjects: document.getElementById("view-subjects"),
};

// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------
function subjectCardHTML(subject) {
  return `
    <article class="subject-card bg-surface rounded-card shadow-card p-6 flex flex-col gap-4"
             data-title="${subject.title}">
      <div class="flex items-start justify-between">
        <span class="card-icon w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-3xl select-none">${subject.icon}</span>
        <span class="text-xs font-bold text-primary bg-primary-soft px-3 py-1.5 rounded-full">${subject.lessonsCount} درس</span>
      </div>
      <h3 class="text-lg font-extrabold text-ink">${subject.title}</h3>
      <a href="subject.html?id=${subject.id}" class="card-cta mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover">
        عرض المادة
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </article>`;
}

function renderSubjects(list) {
  grid.innerHTML = list.map(subjectCardHTML).join("");
  subjectsCount.textContent = list.length
    ? `${list.length} ${list.length > 2 ? "مواد متاحة" : "مادة متاحة"}`
    : "";
}

// Staggered entrance for freshly rendered cards (re-runnable).
// Restart-safe: strips .card-in, forces reflow, then re-staggers at 90ms intervals.
function animateCardsIn() {
  const cards = [...grid.querySelectorAll(".subject-card")];
  cards.forEach((card) => card.classList.remove("card-in"));
  void grid.offsetWidth; // flush styles so the restart actually animates
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add("card-in"), 90 * i);
  });
}

// ------------------------------------------------------------
// Loading / skeleton state
// setSkeletonLoading(true)  → show pulsing placeholder cards
// setSkeletonLoading(false) → show real cards
// ------------------------------------------------------------
function skeletonCardHTML() {
  return `
    <div class="skeleton-card flex flex-col gap-4" aria-hidden="true">
      <div class="flex items-start justify-between">
        <div class="skeleton w-14 h-14 rounded-2xl"></div>
        <div class="skeleton w-16 h-7 rounded-full"></div>
      </div>
      <div class="skeleton h-5 w-2/3"></div>
      <div class="skeleton h-4 w-1/3"></div>
    </div>`;
}

function setSkeletonLoading(isLoading, skeletonCount = 6) {
  if (isLoading) {
    skeletonGrid.innerHTML = Array.from({ length: skeletonCount }, skeletonCardHTML).join("");
    skeletonGrid.classList.remove("hidden");
    grid.classList.add("hidden");
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");
    subjectsCount.textContent = "جارٍ التحميل…";
  } else {
    skeletonGrid.classList.add("hidden");
    skeletonGrid.innerHTML = "";
    grid.classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Search / filter + empty state
// ------------------------------------------------------------
let currentQuery = "";

function applyFilter() {
  const q = currentQuery.trim();
  const filtered = q
    ? SUBJECTS.filter((s) => s.title.includes(q))
    : SUBJECTS;

  renderSubjects(filtered);

  const isEmpty = filtered.length === 0;
  emptyState.classList.toggle("hidden", !isEmpty);
  emptyState.classList.toggle("flex", isEmpty);

  animateCardsIn();
}

function clearSearch() {
  currentQuery = "";
  searchInput.value = "";
}

let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentQuery = e.target.value;
    applyFilter();
  }, 160); // small debounce for smoothness
});

// ------------------------------------------------------------
// VIEW SWITCHING (single-page, no reload, no URL change)
// switchView("subjects") | switchView("landing")
// ------------------------------------------------------------
let currentView = "landing";
let viewSwitching = false;
const VIEW_TRANSITION_MS = 500; // matches --view-transition in style.css

// Search bar visibility with a soft fade (visible only in Subjects View)
function setSearchVisible(visible) {
  if (visible) {
    searchWrap.classList.remove("hidden");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => searchWrap.classList.remove("search-fade"))
    );
  } else {
    searchWrap.classList.add("search-fade");
    setTimeout(() => searchWrap.classList.add("hidden"), 350);
  }
}

function switchView(name) {
  if (name === currentView || viewSwitching || !views[name]) return;
  viewSwitching = true;

  const oldView = views[currentView];
  const newView = views[name];

  // 1) Fade/slide the current view out
  oldView.classList.add("view-exit");

  setTimeout(() => {
    // 2) Hide old view completely, prep new one below the fold
    oldView.classList.add("is-hidden");
    oldView.classList.remove("view-exit");
    newView.classList.remove("is-hidden");
    newView.classList.add("view-enter");

    // 3) Toggle header search bar
    setSearchVisible(name === "subjects");

    // 4) Per-view extras
    if (name === "subjects") {
      // Re-trigger the staggered card entrance every time this view appears
      requestAnimationFrame(() =>
        requestAnimationFrame(() => animateCardsIn())
      );
    } else {
      // Landing: clear search so returning is fresh
      clearSearch();
    }

    // 5) Double rAF → let the browser paint the hidden state first,
    //    then remove .view-enter to transition to natural state
    requestAnimationFrame(() =>
      requestAnimationFrame(() => newView.classList.remove("view-enter"))
    );

    currentView = name;
    window.scrollTo({ top: 0, behavior: "smooth" });
    viewSwitching = false;
  }, VIEW_TRANSITION_MS);
}

// CTA: "تصفح المواد" → Subjects View
document.getElementById("cta-browse").addEventListener("click", () => switchView("subjects"));

// Back button: "→ الرئيسية" → Landing View
document.getElementById("btn-back-home").addEventListener("click", () => switchView("landing"));

// Logo click returns home too (nice touch, consistent with nav expectations)
document.getElementById("logo-home").addEventListener("click", (e) => {
  e.preventDefault();
  switchView("landing");
});

// ------------------------------------------------------------
// Page-load staged entrance (Landing View on load):
// header → hero text
// ------------------------------------------------------------
function entranceTimeline() {
  const header = document.getElementById("site-header");
  header.classList.add("anim-init");

  document.querySelectorAll("#view-landing .reveal").forEach((el, i) => {
    setTimeout(() => el.classList.add("revealed"), 220 + i * 110);
  });
}

// ------------------------------------------------------------
// Scroll reveal (Intersection Observer, no libraries)
// ------------------------------------------------------------
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.closest("#view-landing")) observer.observe(el);
  });
}

// ------------------------------------------------------------
// Modals (placeholder shells)
// ------------------------------------------------------------
function initModals() {
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = (modal) => {
    modal.classList.remove("open");
    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300); // match CSS transition
  };

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeMobileMenu();
      openModal(btn.dataset.modal);
    });
  });

  document.querySelectorAll(".modal-shell").forEach((modal) => {
    modal.querySelector(".modal-backdrop").addEventListener("click", () => closeModal(modal));
    modal.querySelector(".modal-close").addEventListener("click", () => closeModal(modal));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-shell.open").forEach(closeModal);
    }
  });
}

// ------------------------------------------------------------
// Mobile menu
// ------------------------------------------------------------
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu    = document.getElementById("mobile-menu");

function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
}

mobileMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// ------------------------------------------------------------
// Skeleton toggle (demo/test button in the section header)
// ------------------------------------------------------------
let demoLoading = false;
skeletonToggle.addEventListener("click", () => {
  demoLoading = !demoLoading;
  if (demoLoading) {
    setSkeletonLoading(true, 6);
    skeletonToggle.textContent = "✅ عرض المواد";
    // Auto-restore after a short demo delay
    setTimeout(() => {
      demoLoading = false;
      setSkeletonLoading(false);
      applyFilter();
      skeletonToggle.textContent = "⏳ عرض الهيكل";
    }, 1800);
  } else {
    setSkeletonLoading(false);
    applyFilter();
    skeletonToggle.textContent = "⏳ عرض الهيكل";
  }
});

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
async function loadSubjects() {
  setSkeletonLoading(true, 6);

  const { data, error } = await supabaseClient
    .from("subjects")
    .select("id, title, icon_name, lessons(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("خطأ في جلب المواد:", error);
    setSkeletonLoading(false);
    SUBJECTS = [];
    applyFilter();
    return;
  }

  // تحويل شكل بيانات Supabase لنفس شكل الكروت المتوقع في subjectCardHTML
  SUBJECTS = data.map((s) => ({
    id: s.id,
    title: s.title,
    icon: s.icon_name || "📘", // أيقونة افتراضية لو مفيش icon_name
    lessonsCount: s.lessons[0]?.count ?? 0,
  }));

  setSkeletonLoading(false);
  applyFilter();
}

document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();          // renders dummy data + counts (subjects view, hidden)
  entranceTimeline();      // staged load-in animation (landing view)
  initScrollReveal();      // below-the-fold reveals
  initModals();            // modal shells
});