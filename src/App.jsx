import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx";
import PostDetails from "./pages/PostDetails/PostDetails.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import MyPosts from "./pages/MyPosts/MyPosts.jsx";
import Community from "./pages/Community/Community.jsx";
import Saved from "./pages/Saved/Saved.jsx";

function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/posts/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/myposts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}