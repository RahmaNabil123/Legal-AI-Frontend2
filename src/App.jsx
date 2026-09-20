import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// 1. Authentication Module (AuthenticationController & PasswordController)
import LoginPage from "./Pages/auth/LoginPage";
import ProfilePage from "./Pages/profile/ProfilePage";

// 2. Home & Core Precedent Search (LegalOpinionController: /Ask & /Document-By-Source)
import HomePage from "./Pages/Home/HomePage";
import SearchPage from "./Pages/Search/SearchPage";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import DocumentDetailPage from "./Pages/Document/DocumentDetailPage";

// 3. Legal Opinion Workflow (LegalOpinionController: POST, /Legal-Advisor-Opinions, /Resubmit, /Unknown-Questions)
import LegalOpinionPage from "./Pages/Opinion/LegalOpinionPage";
import OpinionsListPage from "./Pages/Opinion/OpinionsListPage";
import OpinionDetailPage from "./Pages/Opinion/OpinionDetailPage";
import UnknownQuestionsPage from "./Pages/Opinion/UnknownQuestionsPage";

// 5. User Governance & Administration (PrivilegesAdmin Module: Section 10.12)
import UserManagementPage from "./Pages/Users/UserManagementPage";
import UserDetailPage from "./Pages/Users/UserDetailPage";
import AddUserPage from "./Pages/Users/AddUserPage";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Entry & Authentication */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

              {/* Core AI Precedent Search & Workspace */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Lawyer", "Legal Advisor", "Legal Manager"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute allowedRoles={["Lawyer", "Legal Advisor", "Legal Manager"]}>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:id"
                element={
                  <ProtectedRoute allowedRoles={["Lawyer", "Legal Advisor", "Legal Manager"]}>
                    <DocumentDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Profile Management */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Legal Opinion Creation (Advisor only) */}
              <Route
                path="/legal-opinion"
                element={
                  <ProtectedRoute allowedRoles={["Legal Advisor"]}>
                    <LegalOpinionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unknown-questions"
                element={
                  <ProtectedRoute allowedRoles={["Legal Advisor"]}>
                    <UnknownQuestionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opinions"
                element={
                  <ProtectedRoute allowedRoles={["Legal Advisor", "Legal Manager", "System Administrator"]}>
                    <OpinionsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opinions/:id"
                element={
                  <ProtectedRoute allowedRoles={["Legal Advisor", "Legal Manager", "System Administrator"]}>
                    <OpinionDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Aliases for backwards compatibility */}
              <Route path="/my-opinions" element={<Navigate to="/opinions" replace />} />
              <Route path="/review-queue" element={<Navigate to="/opinions" replace />} />
              <Route path="/review-opinion/:id" element={<Navigate to="/opinions/:id" replace />} />

              {/* User Governance & Privileges (Manager & Admin) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["Legal Manager", "System Administrator"]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute allowedRoles={["Legal Manager", "System Administrator"]}>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/new"
                element={
                  <ProtectedRoute allowedRoles={["Legal Manager", "System Administrator"]}>
                    <AddUserPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback & Redirects */}
              <Route path="/upload-document" element={<Navigate to="/legal-opinion" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}