import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// import ManageRules from "./pages/ManageRules";
// import Voting from "./pages/Voting";
// import RuleHistory from "./pages/RuleHistory";
// import Docs from "./pages/Docs";
// import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";
// import NotFound from "./pages/NotFound";
import Classifier from "./pages/Classifier";
import Sidebar from "./components/Sidebar";
import CreateGaurd from "./pages/CreateGaurd";
import MyGuardrails from "./pages/MyGaurdRails";
import GuardrailsList from "./pages/GaurdRailsList";
import PlayGround from "./pages/PlayGround";

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
            <Route path="/create-gaurd" element={<CreateGaurd />} />
            <Route path="/manage-rules" element={<MyGuardrails />} />
            <Route path="/rule-history" element={<GuardrailsList />} />
            <Route path="/playground" element={<PlayGround />} />
            {/* <Route path="/voting" element={<Voting />} />
            
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
