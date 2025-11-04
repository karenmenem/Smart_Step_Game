import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Math from "../pages/Math";
import English from "../pages/English";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Achievements from "../pages/Achievements";
import Subjects from "../pages/Subjects";
import MathLevels from "../pages/MathLevels";
import MathQuiz from "../pages/MathQuiz";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminQuestionForm from "../pages/AdminQuestionForm";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/math" element={<Math />} />
        <Route path="/english" element={<English />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/math/:operation" element={<MathLevels />} />
        <Route path="/math/:operation/quiz/:level/:sublevel" element={<MathQuiz />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/questions/add" element={<AdminQuestionForm />} />
        <Route path="/admin/questions/edit/:id" element={<AdminQuestionForm />} />
        <Route path="/admin/subjects/*" element={<AdminDashboard />} />
        <Route path="/admin/sections/*" element={<AdminDashboard />} />
        <Route path="/admin/activities/*" element={<AdminDashboard />} />
        <Route path="/admin/achievements/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
