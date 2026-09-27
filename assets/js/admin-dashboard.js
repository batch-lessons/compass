/* ============================================================
   Batch Lessons Hub — admin-dashboard.js
   Admin content management (subjects / lessons / feedback)
   All data is DUMMY — no backend calls yet.
   ============================================================ */

// ------------------------------------------------------------
// DUMMY DATA
// TODO: supabaseClient.from("subjects").select(), .insert(), .delete()
// TODO: supabaseClient.from("lessons").select(), .insert(), .update(), .delete()
// TODO: supabaseClient.from("feedback").select().order("created_at", {ascending:false})
// ------------------------------------------------------------
let DUMMY_SUBJECTS = [];
let DUMMY_LESSONS = [];
let DUMMY_FEEDBACK = [];

// ------------------------------------------------------------
// Auth protection
// ------------------------------------------------------------
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return { session };
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function lessonsCountFor(subjectId) {
  return DUMMY_LESSONS.filter((l) => l.subject_id === subjectId).length;
}

function subjectTitle(subjectId) {
  const subject = DUMMY_SUBJECTS.find((s) => s.id === subjectId);
  return subject ? subject.title : "—";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

// ------------------------------------------------------------
// Toast (auto-dismiss ~2.5s)
// ------------------------------------------------------------
const toast = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  document.getElementById("toast-text").textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2500);
}

// ------------------------------------------------------------
// Tabs — same .view / .view-enter / .view-exit pattern as index.html
// ------------------------------------------------------------
const panels = {
  subjects: document.getElementById("panel-subjects"),
  lessons:  document.getElementById("panel-lessons"),
  feedback: document.getElementById("panel-feedback"),
};
let currentTab = "subjects";
let tabSwitching = false;
const TAB_TRANSITION_MS = 500; // matches --view-transition in style.css

document.querySelectorAll(".dash-tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

function switchTab(name) {
  if (name === currentTab || tabSwitching || !panels[name]) return;
  tabSwitching = true;

  document.querySelectorAll(".dash-tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === name)
  );

  const oldPanel = panels[currentTab];
  const newPanel = panels[name];

  oldPanel.classList.add("view-exit");
  setTimeout(() => {
    oldPanel.classList.add("is-hidden");
    oldPanel.classList.remove("view-exit");
    newPanel.classList.remove("is-hidden");
    newPanel.classList.add("view-enter");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => newPanel.classList.remove("view-enter"))
    );
    currentTab = name;
    tabSwitching = false;
  }, TAB_TRANSITION_MS);
}

// ------------------------------------------------------------
// SUBJECTS — render / add / delete
// ------------------------------------------------------------
const subjectsTbody = document.getElementById("subjects-tbody");

function renderSubjects() {
  subjectsTbody.innerHTML = DUMMY_SUBJECTS.map((subject) => `
    <tr>
      <td class="font-bold text-ink">${subject.title}</td>
      <td class="text-2xl">${subject.icon || "📘"}</td>
      <td><span class="text-xs font-bold text-primary bg-primary-soft px-3 py-1.5 rounded-full">${lessonsCountFor(subject.id)} درس</span></td>
      <td>
        <button class="dash-btn-danger" data-delete-subject="${subject.id}">حذف</button>
      </td>
    </tr>`).join("");

  document.getElementById("subjects-empty").classList.toggle("hidden", DUMMY_SUBJECTS.length > 0);
  document.getElementById("subjects-empty").classList.toggle("flex", DUMMY_SUBJECTS.length === 0);
  populateSubjectSelect();
}

document.getElementById("subject-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("subject-title-input");
  const iconInput  = document.getElementById("subject-icon-input");

  const { error } = await supabaseClient.from("subjects").insert({
    title: titleInput.value.trim(),
    icon_name: iconInput.value.trim() || null,
  });
  if (error) { showToast("حدث خطأ أثناء الإضافة ❌"); return; }

  titleInput.value = "";
  iconInput.value = "";
  await loadAllData();
  renderSubjects();
  showToast("تمت إضافة المادة بنجاح ✅");
});

subjectsTbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-subject]");
  if (!btn) return;
  const id = btn.dataset.deleteSubject; // UUID string, no Number()
  const subject = DUMMY_SUBJECTS.find((s) => s.id === id);

  if (!confirm(`هل أنت متأكد من حذف مادة «${subject.title}»؟`)) return;

  const { error } = await supabaseClient.from("subjects").delete().eq("id", id);
  if (error) { showToast("حدث خطأ أثناء الحذف ❌"); return; }

  await loadAllData();
  renderSubjects();
  renderLessons();
  showToast("تم حذف المادة 🗑️");
});

// ------------------------------------------------------------
// LESSONS — render / upload / edit-inline / delete
// ------------------------------------------------------------
const lessonsTbody = document.getElementById("lessons-tbody");
let editingLessonId = null;

function renderLessons() {
  const sorted = [...DUMMY_LESSONS].sort((a, b) => a.lesson_number - b.lesson_number);
  lessonsTbody.innerHTML = sorted.map(lessonItemRow).join("");

  document.getElementById("lessons-empty").classList.toggle("hidden", DUMMY_LESSONS.length > 0);
  document.getElementById("lessons-empty").classList.toggle("flex", DUMMY_LESSONS.length === 0);
}

// Normal row, or editable row when it's the one being edited
function lessonItemRow(lesson) {
  if (lesson.id === editingLessonId) {
    return `
    <tr class="editing">
      <td class="text-muted text-sm">${subjectTitle(lesson.subject_id)}</td>
      <td><input type="number" min="1" id="edit-lesson-number" value="${lesson.lesson_number}" class="edit-input w-20" /></td>
      <td><input type="text" id="edit-lesson-title" value="${lesson.title}" class="edit-input w-full min-w-[200px]" /></td>
      <td>
        <div class="flex items-center gap-1.5">
          <button class="dash-btn-primary" data-save-lesson="${lesson.id}">حفظ</button>
          <button class="dash-btn-ghost" data-cancel-edit>إلغاء</button>
        </div>
      </td>
    </tr>`;
  }
  return `
    <tr>
      <td class="font-bold text-ink">${subjectTitle(lesson.subject_id)}</td>
      <td><span class="text-xs font-extrabold text-primary bg-primary-soft px-3 py-1.5 rounded-full">الدرس ${lesson.lesson_number}</span></td>
      <td class="text-muted">${lesson.title}</td>
      <td>
        <div class="flex items-center gap-1.5">
          <button class="dash-btn-ghost" data-edit-lesson="${lesson.id}">تعديل</button>
          <button class="dash-btn-danger" data-delete-lesson="${lesson.id}">حذف</button>
        </div>
      </td>
    </tr>`;
}

function populateSubjectSelect() {
  document.getElementById("lesson-subject-select").innerHTML = DUMMY_SUBJECTS.map((s) =>
    `<option value="${s.id}">${s.title}</option>`
  ).join("");
}

// Upload loading state
function setUploadLoading(isLoading) {
  const btn = document.getElementById("lesson-upload-btn");
  btn.disabled = isLoading;
  document.getElementById("upload-label").textContent = isLoading ? "جارٍ الرفع…" : "رفع الدرس";
  document.getElementById("upload-spinner").classList.toggle("hidden", !isLoading);
}

// ------------------------------------------------------------
// Slugify: original Arabic filenames are NOT storage-safe.
// Generates a unique, URL/storage-safe name: <timestamp>-<random>.pdf
// TODO: upload via supabaseClient.storage.from("lessons").upload(safeFileName, file)
// then supabaseClient.storage.from("lessons").getPublicUrl(safeFileName)
// then supabaseClient.from("lessons").insert({ subject_id, lesson_number, title, pdf_url })
// ------------------------------------------------------------
function slugifyFileName(originalName) {
  const ext = (originalName.includes(".") ? originalName.split(".").pop() : "pdf").toLowerCase();
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${rand}.${ext}`;
}

document.getElementById("lesson-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const subjectId = document.getElementById("lesson-subject-select").value; // UUID
  const title = document.getElementById("lesson-title-input").value.trim();
  const lessonNumber = Number(document.getElementById("lesson-number-input").value);
  const file = document.getElementById("lesson-file-input").files[0];
  const videoUrl = document.getElementById("lesson-video-input").value.trim();

  if (!file) { showToast("يرجى اختيار ملف PDF أولًا"); return; }

  setUploadLoading(true);

  const safeFileName = slugifyFileName(file.name);

  const { error: uploadError } = await supabaseClient.storage
    .from("lessons").upload(safeFileName, file);

  if (uploadError) {
    setUploadLoading(false);
    showToast("فشل رفع الملف ❌");
    return;
  }

  const { data: urlData } = supabaseClient.storage.from("lessons").getPublicUrl(safeFileName);

const { error: insertError } = await supabaseClient.from("lessons").insert({
  subject_id: subjectId,
  lesson_number: lessonNumber,
  title,
  pdf_url: urlData.publicUrl,
  video_url: videoUrl || null,
});

  if (insertError) {
    setUploadLoading(false);
    showToast("فشل حفظ بيانات الدرس ❌");
    return;
  }

  e.target.reset();
  setUploadLoading(false);
  await loadAllData();
  renderLessons();
  renderSubjects();
  showToast("تم رفع الدرس بنجاح ✅");
});

lessonsTbody.addEventListener("click", async (e) => {
  const editBtn   = e.target.closest("[data-edit-lesson]");
  const saveBtn   = e.target.closest("[data-save-lesson]");
  const cancelBtn = e.target.closest("[data-cancel-edit]");
  const delBtn    = e.target.closest("[data-delete-lesson]");

if (editBtn) {
  editingLessonId = editBtn.dataset.editLesson;
  renderLessons();
  return;
}

  if (cancelBtn) {
    editingLessonId = null;
    renderLessons();
    return;
  }

if (saveBtn) {
  const id = saveBtn.dataset.saveLesson; // UUID
  const newTitle = document.getElementById("edit-lesson-title").value.trim();
  const newNumber = Number(document.getElementById("edit-lesson-number").value);
  if (!newTitle || !newNumber) { showToast("يرجى تعبئة الحقول بشكل صحيح"); return; }

  const { error } = await supabaseClient.from("lessons")
    .update({ title: newTitle, lesson_number: newNumber }).eq("id", id);
  if (error) { showToast("حدث خطأ أثناء التحديث ❌"); return; }

  editingLessonId = null;
  await loadAllData();
  renderLessons();
  showToast("تم تحديث الدرس ✅");
  return;
}

if (delBtn) {
  const id = delBtn.dataset.deleteLesson; // UUID
  const lesson = DUMMY_LESSONS.find((l) => l.id === id);
  if (!confirm(`هل أنت متأكد من حذف «${lesson.title}»؟`)) return;

  const { error } = await supabaseClient.from("lessons").delete().eq("id", id);
  if (error) { showToast("حدث خطأ أثناء الحذف ❌"); return; }

  await loadAllData();
  renderLessons();
  renderSubjects();
  showToast("تم حذف الدرس 🗑️");
}

});

// ------------------------------------------------------------
// FEEDBACK — render / delete (read-only, newest first)
// ------------------------------------------------------------
const feedbackTbody = document.getElementById("feedback-tbody");

function renderFeedback() {
  const sorted = [...DUMMY_FEEDBACK].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  feedbackTbody.innerHTML = sorted.map((item) => `
    <tr>
      <td class="text-muted leading-relaxed">${item.message}</td>
      <td class="text-sm text-muted whitespace-nowrap">${formatDate(item.created_at)}</td>
      <td>
        <button class="dash-btn-danger" data-delete-feedback="${item.id}">حذف</button>
      </td>
    </tr>`).join("");

  document.getElementById("feedback-empty").classList.toggle("hidden", DUMMY_FEEDBACK.length > 0);
  document.getElementById("feedback-empty").classList.toggle("flex", DUMMY_FEEDBACK.length === 0);
}

feedbackTbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-feedback]");
  if (!btn) return;
  if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

  const id = btn.dataset.deleteFeedback; // UUID
  const { error } = await supabaseClient.from("feedback").delete().eq("id", id);
  if (error) { showToast("حدث خطأ أثناء الحذف ❌"); return; }

  await loadAllData();
  renderFeedback();
  showToast("تم حذف الرسالة 🗑️");
});

// ------------------------------------------------------------
// Loading states (skeletons) — consistent with the rest of the site
// ------------------------------------------------------------
function setSkeletonLoading(key, isLoading) {
  const skeleton = document.getElementById(`${key}-skeleton`);
  const tbody = document.getElementById(`${key}-tbody`);
  if (!skeleton || !tbody) return;
  skeleton.classList.toggle("hidden", !isLoading);
  skeleton.classList.toggle("flex", isLoading);
  tbody.classList.toggle("hidden", isLoading);
}

// ------------------------------------------------------------
// Logout
// ------------------------------------------------------------
document.getElementById("logout-btn").addEventListener("click", logout);

async function loadAllData() {
  const { data: subjects } = await supabaseClient
    .from("subjects").select("id, title, icon_name").order("created_at", { ascending: false });
  DUMMY_SUBJECTS = (subjects || []).map(s => ({ id: s.id, title: s.title, icon: s.icon_name || "📘" }));

  const { data: lessons } = await supabaseClient
    .from("lessons").select("id, subject_id, lesson_number, title, pdf_url, created_at");
  DUMMY_LESSONS = lessons || [];

  const { data: feedback } = await supabaseClient
    .from("feedback").select("id, message, created_at").order("created_at", { ascending: false });
  DUMMY_FEEDBACK = feedback || [];
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  setSkeletonLoading("subjects", true);
  setSkeletonLoading("lessons", true);
  setSkeletonLoading("feedback", true);

  const { session } = await checkAuth();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("auth-loading").remove();
  const topbar = document.getElementById("topbar");
  const main = document.getElementById("dashboard-main");
  topbar.classList.add("anim-init");
  main.classList.add("anim-init");
  main.style.animationDelay = "120ms";

  await loadAllData();

  setSkeletonLoading("subjects", false);
  setSkeletonLoading("lessons", false);
  setSkeletonLoading("feedback", false);
  renderSubjects();
  renderLessons();
  renderFeedback();
});