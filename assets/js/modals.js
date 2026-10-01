(function () {
  "use strict";

  // ---------- Editable data ----------
  const OWNER_LINKS = [
  { label: "واتساب", icon: "💬", url: "https://wa.me/249128604782" },
  { label: "البريد الإلكتروني", icon: "📧", url: "mailto:althoughs980@gmail.com" },
  { label: "إنستغرام", icon: "📷", url: "https://www.instagram.com/bo_ox.9?stkn=MXNleGlwcDFncnZrMg==" },
  ];

  const CONTACT_LINKS = [
  { label: "واتساب", icon: "💬", url: "https://wa.me/249120723907" },
  { label: "البريد الإلكتروني", icon: "📧", url: "mailto:hamedhagalzen2009@gmail.com" },
  { label: "GitHub", icon: "💻", url: "https://github.com/hamedhagalzen2009-hub" },
  { label: "تيك توك", icon: "🎵", url: "https://www.tiktok.com/@insann_say" },
  { label: "إنستغرام", icon: "📷", url: "https://www.instagram.com/midorya_61/" },
  ];

  const TECH_STACK = [
    { label: "HTML5", icon: "🧱" },
    { label: "CSS3", icon: "🎨" },
    { label: "JavaScript", icon: "⚡" },
    { label: "Tailwind CSS", icon: "🌊" },
    { label: "Supabase", icon: "🗄️" },
  ];

  const HOW_STEPS = [
    { icon: "📚", title: "١. تصفح المواد", text: "كل موادك الدراسية مرتبة في مكان واحد، وتقدر تلاقي أي مادة بسرعة من خلال البحث." },
    { icon: "🎯", title: "٢. اختر درسك", text: "افتح المادة وشوف قائمة الدروس مرتبة، ورتّبها حسب الأحدث أو الأقدم حسب ما يناسبك." },
    { icon: "👀", title: "٣. عاين أو حمّل", text: "اعرض ملف الدرس مباشرة داخل المتصفح، أو حمّله على جهازك للمذاكرة بدون إنترنت." },
    { icon: "🚀", title: "٤. تابع تقدمك", text: "ارجع لموادك في أي وقت وكمّل من حيث توقفت — المنصة سريعة وبسيطة عشان تركز على المذاكرة بس." },
  ];

  

  // ---------- Helpers ----------
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtTime = (ts) =>
    new Date(ts).toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  const closeBtn = (id) => `
    <button type="button" data-close-modal="${id}" aria-label="إغلاق"
      class="icon-btn grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-gray-100 hover:text-ink">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
    </button>`;

  const header = (id, title) => `
    <div class="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <h2 class="truncate text-lg font-extrabold text-ink">${title}</h2>
      ${closeBtn(id)}
    </div>`;

const shell = (id, title, body, extraPanel = "") => `
    <div id="${id}" class="modal-shell fixed inset-0 z-50 hidden items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div class="modal-backdrop absolute inset-0 bg-gray-900/40 opacity-0 transition-opacity duration-300" data-close-modal="${id}"></div>
      <div class="modal-panel relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-card opacity-0 translate-y-full sm:translate-y-10 scale-100 sm:scale-95 transition-all duration-350 ease-out sm:rounded-2xl ${extraPanel}"
        style="max-height:90vh;max-height:90dvh">
        ${header(id, title)}
        ${body}
      </div>
    </div>`;

  const sectionTitle = (t) => `
    <h3 class="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink">
      <span class="h-4 w-1 rounded-full bg-primary"></span>${t}
    </h3>`;

  // ---------- Markup ----------
  const supportHTML = shell(
    "modal-support",
    "الدعم الفني والآراء",
    `
    <div id="fb-list" class="flex-1 overflow-y-auto overscroll-contain bg-page px-4 py-4" style="min-height:40vh"></div>
    <form id="fb-form" class="fb-inputbar flex shrink-0 items-end gap-2 border-t border-gray-100 bg-white px-3 py-3">
      <textarea id="fb-input" rows="1" placeholder="اكتب تعليقك أو استفسارك..."
        class="search-input max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[15px] leading-6 outline-none"></textarea>
      <button type="submit" id="fb-send" aria-label="إرسال"
        class="btn-primary grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-50">
        <svg class="h-5 w-5 -scale-x-100" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </form>`,
    "fb-panel"
  );

  const developerHTML = shell(
    "modal-developer",
    "تواصل مع المطور",
    `
    <div class="flex-1 space-y-8 overflow-y-auto px-5 py-6">
      <div class="flex items-center gap-4">
        <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-3xl">👑</div>
        <div class="min-w-0">
          <p class="text-xs font-bold text-primary">المالك</p>
          <p class="text-lg font-extrabold text-ink">أحمد ياسر</p>
          <p class="text-sm font-semibold text-muted" dir="ltr">bi5tm.9</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-3xl">📚</div>
        <div class="min-w-0">
          <p class="text-xs font-bold text-primary">المطور</p>
          <p class="text-lg font-extrabold text-ink">محمد</p>
          <p class="text-sm font-semibold text-muted">Midorya / ميدوريا</p>
        </div>
      </div>

      <section>
        ${sectionTitle("عن المشروع")}
        <p class="text-[15px] leading-7 text-muted">
          <strong class="text-ink">Lessons Hub</strong> (Batch Lessons Hub) منصة بسيطة للمواد الدراسية، طوّرها محمد (ميدوريا)
          لمساعدة الطلاب على تنظيم ملفات دروسهم والوصول إليها في مكان واحد نظيف وسريع.
          الدروس مرتبة حسب المادة، مع بحث سريع وإمكانية المعاينة والتحميل بسهولة.
        </p>
      </section>

      <section>
        ${sectionTitle("التقنيات المستخدمة")}
        <div class="flex flex-wrap gap-2">
          ${TECH_STACK.map((t) => `<span dir="ltr" class="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary"><span>${t.icon}</span>${esc(t.label)}</span>`).join("")}
        </div>
      </section>

      <section>
        ${sectionTitle("تواصل مع المالك")}
        <div class="flex flex-col gap-2.5">
          ${OWNER_LINKS.map((c) => `
            <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"
              class="btn-outline group flex items-center gap-3 rounded-card border border-gray-200 bg-white px-4 py-3 hover:border-primary hover:bg-primary-soft">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-50 text-xl group-hover:bg-white">${c.icon}</span>
              <span class="flex-1 font-bold text-ink">${esc(c.label)}</span>
              <svg class="h-4 w-4 text-muted group-hover:text-primary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg>
            </a>`).join("")}
        </div>
      </section>

      <section>
        ${sectionTitle("تواصل مع المطور")}
        <div class="flex flex-col gap-2.5">
          ${CONTACT_LINKS.map((c) => `
            <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"
              class="btn-outline group flex items-center gap-3 rounded-card border border-gray-200 bg-white px-4 py-3 hover:border-primary hover:bg-primary-soft">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-50 text-xl group-hover:bg-white">${c.icon}</span>
              <span class="flex-1 font-bold text-ink">${esc(c.label)}</span>
              <svg class="h-4 w-4 text-muted group-hover:text-primary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/></svg>
            </a>`).join("")}
        </div>
      </section>
    </div>`
  );

  const howHTML = shell(
    "modal-how-it-works",
    "كيف تعمل المنصة؟",
    `
    <div class="flex-1 overflow-y-auto px-5 py-6">
      <p class="mb-6 text-[15px] leading-7 text-muted">أهلًا بيك في Lessons Hub 👋 صممنا المنصة عشان توصل لدروسك بأسرع وأسهل طريقة. إليك الخطوات:</p>
      <ol class="space-y-4">
        ${HOW_STEPS.map((s) => `
          <li class="flex gap-4 rounded-card bg-page p-4">
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-2xl">${s.icon}</span>
            <div class="min-w-0">
              <h3 class="mb-1 font-extrabold text-ink">${s.title}</h3>
              <p class="text-sm leading-6 text-muted">${s.text}</p>
            </div>
          </li>`).join("")}
      </ol>
    </div>`
  );

  // ---------- Inject (replace placeholders if present) ----------
  function inject(id, html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    const node = tpl.content.firstElementChild;
    const old = document.getElementById(id);
    if (old) old.replaceWith(node);
    else document.body.appendChild(node);
  }
  inject("modal-support", supportHTML);
  inject("modal-developer", developerHTML);
  inject("modal-how-it-works", howHTML);

  // ---------- Open / close (reuse home.js if present) ----------
  const fallbackOpen = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("hidden");
    m.style.display = "flex";
    requestAnimationFrame(() => m.classList.add("open"));
    document.body.style.overflow = "hidden";
  };
  const resetViewportStyles = (m) => {
    const p = m.querySelector(".modal-panel");
    m.style.top = m.style.height = m.style.bottom = "";
    if (p) p.style.maxHeight = p.style.height = p.style.borderRadius = "";
  };

  const fallbackClose = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("open");
    setTimeout(() => {
      m.style.display = "";
      m.classList.add("hidden");
      resetViewportStyles(m);
    }, 300);
    document.body.style.overflow = "";
  };

  const open = (id) => { (typeof window.openModal === "function" ? window.openModal : fallbackOpen)(id); onOpened(id); };
  const close = (id) => {
    (typeof window.closeModal === "function" ? window.closeModal : fallbackClose)(id);
    const m = document.getElementById(id);
    if (m) setTimeout(() => resetViewportStyles(m), 320);
  };

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-close-modal]");
    if (c) { e.preventDefault(); close(c.getAttribute("data-close-modal")); return; }
    const o = e.target.closest("[data-open-modal]");
    if (o) { e.preventDefault(); e.stopImmediatePropagation(); open(o.getAttribute("data-open-modal")); }
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal-shell.open").forEach((m) => close(m.id));
  });

  // Fix: "كيف تعمل المنصة؟" button must open the new modal (not modal-support)
  document.querySelectorAll("button, a").forEach((el) => {
    if (el.textContent.trim().includes("كيف تعمل المنصة")) {
      el.setAttribute("data-open-modal", "modal-how-it-works");
      el.removeAttribute("onclick");
    }
  });

  // ---------- Feedback chat ----------
  const list = document.getElementById("fb-list");
  const form = document.getElementById("fb-form");
  const input = document.getElementById("fb-input");
  let feedback = [];
  let loaded = false;

  const scrollBottom = () => requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });

  const bubble = (f) => `
    <div class="mb-3 flex justify-end">
      <div class="fb-bubble max-w-[85%] rounded-2xl rounded-bl-md bg-gray-50 px-4 py-2.5 shadow-card ring-1 ring-gray-100">
        <p class="whitespace-pre-wrap break-words text-[15px] leading-6 text-ink">${esc(f.message)}</p>
        <p class="mt-1 text-left text-[11px] font-medium text-muted">${fmtTime(f.created_at)}${f.pending ? " · جارٍ الإرسال" : ""}</p>
      </div>
    </div>`;

  function render() {
    if (!feedback.length) {
      list.innerHTML = `<div class="grid h-full min-h-[30vh] place-items-center text-center">
        <div><div class="mb-2 text-4xl">💬</div><p class="font-bold text-muted">لا توجد تعليقات بعد، كن أول من يعلق</p></div></div>`;
      return;
    }
    list.innerHTML = feedback.map(bubble).join("");
    scrollBottom();
  }

  function renderSkeleton() {
    const w = ["w-3/4", "w-1/2", "w-2/3", "w-2/5"];
    list.innerHTML = w.map((c) => `
      <div class="mb-3 flex justify-end"><div class="${c} rounded-2xl rounded-bl-md bg-white p-3 shadow-card">
        <div class="skeleton mb-2 h-3 w-full"></div><div class="skeleton mb-2 h-3 w-4/5"></div><div class="skeleton h-2 w-16"></div>
      </div></div>`).join("");
  }

async function loadFeedback() {
  renderSkeleton();
  const { data, error } = await supabaseClient
    .from("feedback")
    .select("id, message, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("خطأ في تحميل الآراء:", error);
    feedback = [];
  } else {
    feedback = data.map(f => ({
      id: f.id,
      message: f.message,
      created_at: new Date(f.created_at).getTime(),
    }));
  }
  loaded = true;
  render();
}

  function onOpened(id) {
    if (id !== "modal-support") return;
    if (!loaded) loadFeedback(); else scrollBottom();
  }

  // Auto-grow textarea 1–4 lines
  function autoGrow() {
    input.style.height = "auto";
    const lh = 24, pad = 20;
    input.style.height = Math.min(input.scrollHeight, lh * 4 + pad) + "px";
    input.style.overflowY = input.scrollHeight > lh * 4 + pad ? "auto" : "hidden";
  }
  input.addEventListener("input", autoGrow);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(min-width: 768px)").matches) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  const item = { message, created_at: Date.now(), pending: true };
  feedback.push(item);
  render();
  input.value = "";
  autoGrow();
  input.focus();

  const { data, error } = await supabaseClient
    .from("feedback")
    .insert({ message })
    .select()
    .single();

  if (error) {
    console.error("خطأ في إرسال التعليق:", error);
    item.pending = false;
    item.failed = true;
    render();
    return;
  }

  item.pending = false;
  item.id = data.id;
  item.created_at = new Date(data.created_at).getTime();
  render();
});

  // ---------- Mobile keyboard handling (visualViewport) ----------
  // Resize the support panel to the visible viewport so the input bar
  // stays right above the on-screen keyboard.
  const supportModal = document.getElementById("modal-support");
  const panel = supportModal.querySelector(".modal-panel");
  const vv = window.visualViewport;

  function fitToViewport() {
    if (!vv || !supportModal.classList.contains("open")) return;
    const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    if (keyboard > 80) {
      supportModal.style.top = vv.offsetTop + "px";
      supportModal.style.height = vv.height + "px";
      supportModal.style.bottom = "auto";
      panel.style.maxHeight = vv.height + "px";
      panel.style.height = vv.height + "px";
      panel.style.borderRadius = "0";
    } else {
      supportModal.style.top = supportModal.style.height = supportModal.style.bottom = "";
      panel.style.maxHeight = panel.style.height = panel.style.borderRadius = "";
    }
    if (document.activeElement === input) scrollBottom();
  }
  if (vv) {
    vv.addEventListener("resize", fitToViewport);
    vv.addEventListener("scroll", fitToViewport);
  }
  input.addEventListener("focus", () => setTimeout(fitToViewport, 250));
  input.addEventListener("blur", () => setTimeout(fitToViewport, 250));

  // Expose for other scripts if needed
  window.BLHModals = { open, close, CONTACT_LINKS };
})();

// ---------- Fullscreen toggle ----------
(function () {
  const btn = document.getElementById("fullscreen-btn");
  if (!btn) return;
  const expandIcon = document.getElementById("fullscreen-icon-expand");
  const collapseIcon = document.getElementById("fullscreen-icon-collapse");

  function updateIcon() {
    const isFs = !!document.fullscreenElement;
    expandIcon.classList.toggle("hidden", isFs);
    collapseIcon.classList.toggle("hidden", !isFs);
  }

  btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  document.addEventListener("fullscreenchange", updateIcon);
})();
