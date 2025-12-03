import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Math from "../pages/Math";
import English from "../pages/English";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Achievements from "../pages/Achievements";
import Subjects from "../pages/Subjects";
import SubjectDetail from "../pages/SubjectDetail";
import MathLevels from "../pages/MathLevels";
import MathQuiz from "../pages/MathQuiz";
import EnglishLevels from "../pages/EnglishLevels";
import EnglishQuiz from "../pages/EnglishQuiz";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminQuestionForm from "../pages/AdminQuestionForm";
import AdminSubjectForm from "../pages/AdminSubjectForm";
import AdminSectionForm from "../pages/AdminSectionForm";
import AdminActivityForm from "../pages/AdminActivityForm";
import ASLManager from "../pages/ASLManager";
import HomepageCustomizer from "../pages/HomepageCustomizer";
import TeacherLogin from "../pages/TeacherLogin";
import TeacherRegister from "../pages/TeacherRegister";
import TeacherDashboard from "../pages/TeacherDashboard";
import AdminApprovals from "../pages/AdminApprovals";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<Math />} />
        <Route path="/english" element={<English />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subject/:subjectId" element={<SubjectDetail />} />
        <Route path="/math/:operation" element={<MathLevels />} />
        <Route path="/math/:operation/quiz/:level/:sublevel" element={<MathQuiz />} />
        <Route path="/english/:topic" element={<EnglishLevels />} />
        <Route path="/english/:topic/quiz/:level/:sublevel" element={<EnglishQuiz />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/homepage-customizer" element={<HomepageCustomizer />} />
        <Route path="/admin/questions/add" element={<AdminQuestionForm />} />
        <Route path="/admin/questions/edit/:id" element={<AdminQuestionForm />} />
        <Route path="/admin/subjects/add" element={<AdminSubjectForm />} />
        <Route path="/admin/subjects/edit/:id" element={<AdminSubjectForm />} />
        <Route path="/admin/sections/add" element={<AdminSectionForm />} />
        <Route path="/admin/sections/edit/:id" element={<AdminSectionForm />} />
        <Route path="/admin/activities/add" element={<AdminActivityForm />} />
        <Route path="/admin/activities/edit/:id" element={<AdminActivityForm />} />
        <Route path="/admin/asl" element={<ASLManager />} />
        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
