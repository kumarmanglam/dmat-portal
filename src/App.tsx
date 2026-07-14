import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ProgressProvider, useProgress } from "./lib/progress";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ExamDetails } from "./pages/ExamDetails";
import { TopicPage } from "./pages/TopicPage";
import { Tracker } from "./pages/Tracker";
import { MockExam } from "./pages/MockExam";

// Layout with a desktop sidebar that turns into an off-canvas
// drawer (hamburger in a sticky top bar) below 900px.
function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const { overallPct } = useProgress();
  const location = useLocation();

  // close the drawer on navigation and lock body scroll while open
  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className="shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="content-col">
        <div className="mobile-topbar">
          <button
            type="button"
            className="hamburger"
            aria-label="Open navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            ☰
          </button>
          <span className="brand-sm">dMAT Portal</span>
          <span className="pct">{overallPct}%</span>
        </div>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exam-details" element={<ExamDetails />} />
            <Route path="/learn/:topic" element={<TopicPage />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/mock-exam" element={<MockExam />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Gate() {
  const { user } = useAuth();
  if (!user) return <Login />;
  // key remounts the provider on user switch so state never bleeds
  // between kumar.m and varsha.k
  return (
    <ProgressProvider key={user} userKey={user}>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ProgressProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
