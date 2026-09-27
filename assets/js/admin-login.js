/* ============================================================
   Batch Lessons Hub — admin-login.js
   Admin login (placeholder auth — no backend yet)
   ============================================================ */

// ------------------------------------------------------------
// DOM refs
// ------------------------------------------------------------
const loginForm    = document.getElementById("login-form");
const emailInput   = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const submitBtn    = document.getElementById("login-submit");
const submitLabel  = document.getElementById("submit-label");
const submitSpinner = document.getElementById("submit-spinner");
const errorBox     = document.getElementById("login-error");
const errorText    = document.getElementById("login-error-text");

// ------------------------------------------------------------
// Submit-button loading state
// ------------------------------------------------------------
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitLabel.textContent = isLoading ? "جارٍ الدخول…" : "تسجيل الدخول";
  submitSpinner.classList.toggle("hidden", !isLoading);
}

// ------------------------------------------------------------
// Error area
// ------------------------------------------------------------
function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

// ------------------------------------------------------------
// Placeholder authentication.
// TODO: supabaseClient.auth.signInWithPassword({ email, password })
// on success -> redirect to dashboard.html
// on failure -> show error message in the error area
//
// The fake async delay below simulates a network round-trip so the
// loading state can be tested; remove it when wiring up Supabase.
// ------------------------------------------------------------
async function signInWithPassword(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  return data;
}

// ------------------------------------------------------------
// Form handling
// ------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Minimal client-side validation (browser `required` also covers this)
  if (!email || !password) {
    showError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
    return;
  }

  setLoading(true);
  try {
    await signInWithPassword(email, password);
    // Success → go to dashboard (adjust path if dashboard.html lives elsewhere)
    window.location.href = "dashboard.html";
  } catch (err) {
    showError(err.message || "حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى");
    setLoading(false);
  }
});

// Clear the error as soon as the user starts fixing their input
[emailInput, passwordInput].forEach((input) => {
  input.addEventListener("input", hideError);
});
