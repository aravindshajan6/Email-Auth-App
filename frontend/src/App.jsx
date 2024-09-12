import { Routes, Route, Navigate } from "react-router-dom";
import FloatingShapes from "./components/FloatingShapes";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";

import EmailVerification from "./pages/EmailVerification";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

//protect routes that require authentication
const ProtectedRoutes = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

//redirect authenticated users to homepage
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // console.log("RedirectAuthenticatedUser : ", true);
    return <Navigate to="/" replace />; //replace prop ensures that the redirection replaces the current entry in the history stack
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center overflow-hidden relative">
        <FloatingShapes
          color="bg-gray-700"
          size="w-64 h-64"
          top="-5%"
          left="10%"
          delay={0}
          className="animate-float shadow-xl"
        />
        <FloatingShapes
          color="bg-gray-600"
          size="w-48 h-48"
          top="70%"
          left="80%"
          delay={5}
          className="animate-float shadow-xl"
        />
        <FloatingShapes
          color="bg-gray-500"
          size="w-32 h-32"
          top="40%"
          left="-10%"
          delay={2}
          className="animate-float shadow-xl"
        />
        <FloatingShapes
          color="bg-gray-500"
          size="w-32 h-32"
          top="30%"
          left="70%"
          delay={2}
          className="animate-float shadow-xl"
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <DashboardPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignupPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
