import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateRule from "./pages/CreateRule";
// import ManageRules from "./pages/ManageRules";
// import Voting from "./pages/Voting";
// import RuleHistory from "./pages/RuleHistory";
// import Docs from "./pages/Docs";
// import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";
// import NotFound from "./pages/NotFound";
import Classifier from "./pages/Classifier";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classifier" element={<Classifier />} />
            <Route path="/create-rule" element={<CreateRule />} />
            {/* <Route path="/manage-rules" element={<ManageRules />} />
            <Route path="/voting" element={<Voting />} />
            <Route path="/rule-history" element={<RuleHistory />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
