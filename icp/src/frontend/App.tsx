import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// import ManageRules from "./pages/ManageRules";
// import Voting from "./pages/Voting";
// import RuleHistory from "./pages/RuleHistory";
// import Docs from "./pages/Docs";
// import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Classifier from "./pages/Classifier";
import Sidebar from "./components/Sidebar";
import CreateGaurd from "./pages/CreateGaurd";
import MyGuardrails from "./pages/MyGaurdRails";
import GuardrailsList from "./pages/GaurdRailsList";
import PlayGround from "./pages/PlayGround";
import ProposeVote from "./pages/ProposeVote";
import Docs from "./pages/Documentation";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/classifier" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Classifier />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/create-gaurd" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <CreateGaurd />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/manage-rules" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <MyGuardrails />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/rule-history" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <GuardrailsList />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/playground" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <PlayGround />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/voting" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <ProposeVote />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/docs" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Docs />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Profile />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4">
                  <Settings />
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
