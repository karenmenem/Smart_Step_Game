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
      </Routes>
    </Router>
  );
}

export default AppRoutes;
