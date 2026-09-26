/* ============================================================
   Batch Lessons Hub — subject.js
   Lessons list for one subject (subject.html?id=xxx)
   Dummy data + rendering + sort + search + animations
   ============================================================ */

// Read the subject id from ?id=xxx — used later for the Supabase query.
// For now the data is dummy, so this is only parsed and stored.
const urlParams  = new URLSearchParams(window.location.search);
const subjectId  = urlParams.get("id");
// TODO: use subjectId when fetching the real subject + lessons from Supabase

// ------------------------------------------------------------
// TODO: replace with Supabase fetch — see loadLessons()
// Fields shaped like the future DB columns:
//   id, subject_id, lesson_number, title, pdf_url, created_at
// ------------------------------------------------------------
let LESSONS = [];

// ------------------------------------------------------------
// DOM refs
// ------------------------------------------------------------
const list           = document.getElementById("lessons-list");
const skeletonList   = document.getElementById("skeleton-list");
const emptyState     = document.getElementById("empty-state");
const searchInput    = document.getElementById("search-input");
const sortSelect     = document.getElementById("sort-select");
const lessonsCount   = document.getElementById("lessons-count");
const skeletonToggle = document.getElementById("skeleton-toggle");

// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------
function lessonItemHTML(lesson) {
  return `
    <article class="lesson-item bg-surface rounded-card shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
             data-title="${lesson.title}">
      <span class="lesson-number-badge shrink-0 text-xs font-extrabold text-primary bg-primary-soft px-3.5 py-2 rounded-full">الدرس ${lesson.lesson_number}</span>
      <h3 class="flex-1 text-base sm:text-lg font-bold text-ink leading-relaxed">${lesson.title}</h3>
      <div class="flex items-center gap-2 shrink-0">
        <a href="lesson.html?id=${lesson.id}"
           class="btn-primary inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-card">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
            <path d="M14 3v5h5M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          معاينة PDF
        </a>
        <a href="${lesson.pdf_url}" download
           class="btn-outline inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-ink text-sm font-bold px-4 py-2.5 rounded-xl transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          تحميل
        </a>
      </div>
    </article>`;
}

function renderLessons(lessons) {
  list.innerHTML = lessons.map(lessonItemHTML).join("");
  lessonsCount.textContent = lessons.length
    ? `${lessons.length} ${lessons.length > 2 ? "دروس متاحة" : "دروس متاحة"}`
    : "";
}

// Staggered entrance for freshly rendered items (re-runnable).
// Restart-safe: strips .lesson-in, forces reflow, then re-staggers at 90ms intervals.
function animateLessonsIn() {
  const items = [...list.querySelectorAll(".lesson-item")];
  items.forEach((item) => item.classList.remove("lesson-in"));
  void list.offsetWidth; // flush styles so the restart actually animates
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add("lesson-in"), 90 * i);
  });
}

// ------------------------------------------------------------
// Loading / skeleton state
// setSkeletonLoading(true)  → show list-shaped pulsing placeholders
// setSkeletonLoading(false) → show real lessons
// ------------------------------------------------------------
function skeletonItemHTML() {
  return `
    <div class="skeleton-card lesson-skeleton flex items-center gap-4" aria-hidden="true">
      <div class="skeleton w-20 h-9 rounded-full shrink-0"></div>
      <div class="flex-1 flex flex-col gap-2">
        <div class="skeleton h-5 w-3/4"></div>
        <div class="skeleton h-3 w-1/3 sm:hidden"></div>
      </div>
      <div class="skeleton w-28 h-10 rounded-xl shrink-0 hidden sm:block"></div>
      <div class="skeleton w-24 h-10 rounded-xl shrink-0 hidden sm:block"></div>
    </div>`;
}

function setSkeletonLoading(isLoading, skeletonCount = 6) {
  if (isLoading) {
    skeletonList.innerHTML = Array.from({ length: skeletonCount }, skeletonItemHTML).join("");
    skeletonList.classList.remove("hidden");
    list.classList.add("hidden");
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");
    lessonsCount.textContent = "جارٍ التحميل…";
  } else {
    skeletonList.classList.add("hidden");
    skeletonList.innerHTML = "";
    list.classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Search + sort + empty state
// ------------------------------------------------------------
let currentQuery = "";
let currentSort  = "default"; // "default" (lesson_number asc) | "newest" (created_at desc)

function sortLessons(lessons) {
  const sorted = [...lessons];
  if (currentSort === "newest") {
    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    sorted.sort((a, b) => a.lesson_number - b.lesson_number);
  }
  return sorted;
}

function applyFilter() {
  const q = currentQuery.trim();
  const filtered = q
    ? LESSONS.filter((l) => l.title.includes(q))
    : LESSONS;

  renderLessons(sortLessons(filtered));

  const isEmpty = filtered.length === 0;
  emptyState.classList.toggle("hidden", !isEmpty);
  emptyState.classList.toggle("flex", isEmpty);

  animateLessonsIn();
}

let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentQuery = e.target.value;
    applyFilter();
  }, 160); // small debounce — same pattern as home.js
});

sortSelect.addEventListener("change", (e) => {
  currentSort = e.target.value;
  applyFilter();
});

// ------------------------------------------------------------
// Page-load staged entrance: header → heading row → lessons
// ------------------------------------------------------------
function entranceTimeline() {
  const header = document.getElementById("site-header");
  header.classList.add("anim-init");

  document.querySelectorAll("#lessons .reveal").forEach((el, i) => {
    setTimeout(() => el.classList.add("revealed"), 220 + i * 110);
  });

  setTimeout(() => animateLessonsIn(), 450);
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
    if (!el.closest("#lessons")) observer.observe(el);
  });
}

// ------------------------------------------------------------
// Modals (placeholder shells — same behavior as home.js)
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
// Skeleton toggle (demo/test button in the heading row)
// ------------------------------------------------------------
let demoLoading = false;
skeletonToggle.addEventListener("click", () => {
  demoLoading = !demoLoading;
  if (demoLoading) {
    setSkeletonLoading(true, 6);
    skeletonToggle.textContent = "✅ عرض الدروس";
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
async function loadLessons() {
  setSkeletonLoading(true, 6);

  // جلب اسم المادة الحقيقي
  const { data: subjectData } = await supabaseClient
    .from("subjects")
    .select("title")
    .eq("id", subjectId)
    .single();

  if (subjectData) {
    document.getElementById("subject-title").textContent = subjectData.title;
  }

  // جلب الدروس
  const { data, error } = await supabaseClient
    .from("lessons")
    .select("id, subject_id, lesson_number, title, pdf_url, created_at")
    .eq("subject_id", subjectId);

  if (error) {
    console.error("خطأ في جلب الدروس:", error);
    LESSONS = [];
  } else {
    LESSONS = data;
  }

  setSkeletonLoading(false);
  applyFilter();
}

document.addEventListener("DOMContentLoaded", () => {
  loadLessons();           // renders dummy lessons (sorted by lesson_number)
  entranceTimeline();      // staged load-in animation
  initScrollReveal();      // below-the-fold reveals
  initModals();            // modal shells
});
