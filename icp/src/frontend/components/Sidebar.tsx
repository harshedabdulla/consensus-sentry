import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlus,
  FiList,
  FiCheckSquare,
  FiClock,
  FiBook,
  FiUser,
  FiSettings,
  FiWind,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { to: "/dashboard", icon: <FiHome size={20} />, text: "Dashboard" },
    { to: "/create-rule", icon: <FiPlus size={20} />, text: "Create Rule" },
    { to: "/classifier", icon: <FiWind size={20} />, text: "Prompt Classifier" },
    { to: "/manage-rules", icon: <FiList size={20} />, text: "Manage Rules" },
    { to: "/voting", icon: <FiCheckSquare size={20} />, text: "Voting" },
    { to: "/rule-history", icon: <FiClock size={20} />, text: "Rule History" },
    { to: "/docs", icon: <FiBook size={20} />, text: "Docs" },
    { to: "/profile", icon: <FiUser size={20} />, text: "Profile" },
    { to: "/settings", icon: <FiSettings size={20} />, text: "Settings" },
  ];

  return (
    <div className={`h-screen flex flex-col bg-white border-r-[1px] transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      {/* Header */}
      <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 border-b-[1px]`}>
        {isOpen && <span className="font-semibold">Consensus Sentry</span>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-1 p-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                isOpen ? "gap-3 justify-start" : "gap-0 justify-center"
              }`}
            >
              <span className="text-gray-700">
                {item.icon}
              </span>
              {isOpen && (
                <span className="text-sm text-gray-700">
                  {item.text}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;