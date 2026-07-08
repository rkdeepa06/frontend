/* ═══════════════════════════════════════════════════════════════
   CodeCrest — Auth Guard & Role-Based Navigation Utility
   
   Roles:
     ROLE_PLATFORM_ADMIN   → full admin access
     ROLE_PROBLEM_SETTER   → manage challenges & contests
     ROLE_CONTESTANT       → view profiles, rankings, submissions
   
   Usage (from entity subfolders — path prefix is "../"):
     requireAuth(["ROLE_PLATFORM_ADMIN"]);        // admin only
     requireAuth([ROLES.ADMIN, ROLES.PS]);        // admin + setter
   
   Usage (from manage/ folder — path prefix is ""):
     requireAuthDashboard(["ROLE_PLATFORM_ADMIN"]);
═══════════════════════════════════════════════════════════════ */

const ROLES = {
    ADMIN:     "ROLE_PLATFORM_ADMIN",
    PS:        "ROLE_PROBLEM_SETTER",
    CONTESTANT:"ROLE_CONTESTANT"
};

/* ── Helpers ── */
function ccNormalizeRole(role) {
    if (!role) return "";
    let r = role.trim().toUpperCase();
    if (r === "ADMIN" || r === "ROLE_ADMIN" || r === "PLATFORM_ADMIN" || r === "ROLE_PLATFORM_ADMIN") {
        return "ROLE_PLATFORM_ADMIN";
    }
    if (r === "PROBLEM_SETTER" || r === "ROLE_PROBLEM_SETTER" || r === "PS" || r === "ROLE_PS") {
        return "ROLE_PROBLEM_SETTER";
    }
    if (r === "CONTESTANT" || r === "ROLE_CONTESTANT") {
        return "ROLE_CONTESTANT";
    }
    return r;
}

function ccGetToken() { return localStorage.getItem("jwt_token") || ""; }
function ccGetRole()  { return ccNormalizeRole(localStorage.getItem("role") || ""); }
function ccGetUser()  { return localStorage.getItem("username")  || "User"; }

/* ── Dashboard URL lookup (called from entity subfolders) ── */
function ccDashboardUrl() {
    const r = ccGetRole();
    if (r === ROLES.ADMIN)      return "../manage/dashboard.html";
    if (r === ROLES.PS)         return "../manage/dashboard_problemsetter.html";
    if (r === ROLES.CONTESTANT) return "../manage/dashboard_contestant.html";
    return "../loginpage/login.html";
}

/* ── Dashboard URL lookup (called from manage/ folder) ── */
function ccDashboardUrlLocal() {
    const r = ccGetRole();
    if (r === ROLES.ADMIN)      return "dashboard.html";
    if (r === ROLES.PS)         return "dashboard_problemsetter.html";
    if (r === ROLES.CONTESTANT) return "dashboard_contestant.html";
    return "../loginpage/login.html";
}

/* ── Auth guard for entity pages (in subfolders like systemuser/, codingchallenge/) ──
   allowedRoles: array of role strings that may access this page
   Also sets the Back button href dynamically to the user's own dashboard. ── */
function requireAuth(allowedRoles) {
    if (!ccGetToken()) {
        window.location.href = "../loginpage/login.html";
        return false;
    }
    const role = ccGetRole();
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        alert("⛔ Access denied. You do not have permission to view this page.");
        window.location.href = ccDashboardUrl();
        return false;
    }
    /* Update Back-to-Dashboard button dynamically */
    const backBtn = document.querySelector(".back-btn");
    if (backBtn) backBtn.href = ccDashboardUrl();
    return true;
}

/* ── Auth guard for dashboard pages (in manage/ folder) ── */
function requireAuthDashboard(allowedRoles) {
    if (!ccGetToken()) {
        window.location.href = "../loginpage/login.html";
        return false;
    }
    const role = ccGetRole();
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        alert("⛔ Access denied. Redirecting to your dashboard.");
        window.location.href = ccDashboardUrlLocal();
        return false;
    }
    return true;
}

/* ── Shared logout (works from any folder depth) ──
   Pass "entity" for subfolder pages, "dashboard" for manage/ pages ── */
function ccLogout(fromDashboard) {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = fromDashboard
            ? "../loginpage/login.html"
            : "../loginpage/login.html";
    }
}

/* ── Greet user with their name in welcome text (optional helper) ── */
function ccGreet(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = "Welcome, " + ccGetUser() + " 👋";
}
