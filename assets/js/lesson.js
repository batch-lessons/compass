/* ============================================================
   Batch Lessons Hub — lesson.js
   Full-screen PDF viewer (lesson.html?id=xxx)
   ============================================================ */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var lessonId = params.get("id");

  var titleEl = document.getElementById("lesson-title");
  var frameEl = document.getElementById("pdf-frame");
  var loadingEl = document.getElementById("loading-state");
  var errorEl = document.getElementById("error-state");
  var downloadBtn = document.getElementById("download-btn");
  var backBtn = document.getElementById("back-btn");
  var errorBackBtn = document.getElementById("error-back-btn");

  /* ---------- Back navigation ---------- */
  function goBack() {
    if (document.referrer && history.length > 1) {
      history.back();
    } else {
      window.location.href = "subject.html";
    }
  }
  backBtn.addEventListener("click", goBack);
  errorBackBtn.addEventListener("click", goBack);

  /* ---------- Data ---------- */
  // TODO: replace with Supabase fetch — select title, pdf_url from lessons where id = lessonId
function fetchLesson(id) {
  return supabaseClient
    .from("lessons")
    .select("id, title, pdf_url, subject_id")
    .eq("id", id)
    .single()
    .then(function (res) {
      if (res.error) {
        console.error("خطأ في جلب الدرس:", res.error);
        return null;
      }
      return res.data;
    });
}

  /* ---------- States ---------- */
  function showError() {
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
    errorEl.classList.add("flex");
    frameEl.classList.remove("frame-in");
    downloadBtn.classList.add("hidden");
  }

  function showViewer() {
    loadingEl.classList.add("hidden");
    frameEl.classList.add("frame-in");
  }

  /* ---------- Init ---------- */
  fetchLesson(lessonId)
    .then(function (lesson) {
      if (!lesson || !lesson.pdf_url) {
        titleEl.textContent = "الدرس غير متاح";
        showError();
        return;
      }

      document.title = "Lessons Hub — " + lesson.title;
      titleEl.textContent = lesson.title;
      downloadBtn.href = lesson.pdf_url;

      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) {
          settled = true;
          showError();
        }
      }, 15000);

      frameEl.addEventListener("load", function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        showViewer();
      });

      frameEl.addEventListener("error", function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        showError();
      });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
frameEl.src = isMobile
  ? `https://docs.google.com/viewer?url=${encodeURIComponent(lesson.pdf_url)}&embedded=true`
  : lesson.pdf_url;
    })
    .catch(function () {
      titleEl.textContent = "الدرس غير متاح";
      showError();
    });
})();
