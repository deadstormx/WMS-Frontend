import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Userdashboard from "./pages/Userdashboard";
import AdminDashboard from "./components/AdminDashboard/Dashboard/AdminDashboard";
import Collection from "./components/AdminDashboard/Dashboard/Collection.jsx";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import PickupManagement from "./components/AdminDashboard/Dashboard/PickupManagement";
import AdminRoutesPage from "./components/AdminDashboard/Dashboard/Routes";
import Otp from "./pages/Otp.jsx";
import ForgotPassword from "./pages/Forgotpassword.jsx";
import ForgotOtp from "./pages/ForgotOtp.jsx";
import SetNewPassword from "./pages/SetNewPassword.jsx";
import PasswordUpdated from "./pages/PasswordUpdated.jsx";

const ADMIN_EMAIL = "greenbinpvtltd@gmail.com";

// Protect routes for authenticated non-admin users
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (user.email === ADMIN_EMAIL) {
    return <Navigate to="/admindashboard" replace />;
  }

  return children;
}

// Protect routes for admin users only
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Determine redirect based on user type
  const redirectPath = token
    ? user.email === ADMIN_EMAIL
      ? "/admindashboard"
      : "/userdashboard"
    : "/signin";

  return (
    <Routes>
      {/* Public routes, but redirect if already logged in */}
      <Route path="/" element={token ? <Navigate to={redirectPath} replace /> : <SignUp />} />
      <Route path="/signin" element={token ? <Navigate to={redirectPath} replace /> : <SignIn />} />
      <Route path="/Otpverification" element={<Otp />} />
      <Route path="/forgotpassword" element={<ForgotPassword/>} />
      <Route path="/forgototp" element={<ForgotOtp/>} />
      <Route path="/setpassword" element={<SetNewPassword/>} />
      <Route path="/passwordupdate" element={<PasswordUpdated/>} />

      {/* Protected user routes */}
      <Route path="/userdashboard/*" element={<ProtectedRoute><Userdashboard /></ProtectedRoute>} />
      <Route path="/schedule/*" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Admin-only routes */}
      <Route path="/admindashboard/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/collection/*" element={<AdminRoute><Collection/></AdminRoute>} />
      <Route path="/pickupmanagement/*" element={<AdminRoute><PickupManagement /></AdminRoute>} />
      <Route path="/routes/*" element={<AdminRoute><AdminRoutesPage /></AdminRoute>} />

      {/* Catch all route - redirect to signin */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default App;