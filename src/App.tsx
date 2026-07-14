import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./lib/progress";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ExamDetails } from "./pages/ExamDetails";
import { TopicPage } from "./pages/TopicPage";
import { Tracker } from "./pages/Tracker";
import { MockExam } from "./pages/MockExam";

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <div className="shell">
          <Sidebar />
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
      </BrowserRouter>
    </ProgressProvider>
  );
}
