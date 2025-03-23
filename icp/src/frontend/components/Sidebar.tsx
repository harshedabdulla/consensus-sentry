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
  FiPlay,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { to: "/dashboard", icon: <FiHome size={20} />, text: "Dashboard" },
    { to: "/create-gaurd", icon: <FiPlus size={20} />, text: "New Guard Rail" },
    { to: "/classifier", icon: <FiWind size={20} />, text: "Prompt ICP Classifier" },
    { to: "/manage-rules", icon: <FiList size={20} />, text: "Manage Rules" },
    { to: "/voting", icon: <FiCheckSquare size={20} />, text: "Propose New Rule" },
    { to: "/rule-history", icon: <FiClock size={20} />, text: "Rule History" },
    { to: "/docs", icon: <FiBook size={20} />, text: "Docs" },
    { to: "/playground", icon: <FiPlay size={20} />, text: "Playground" },
    { to: "/profile", icon: <FiUser size={20} />, text: "Profile" },
    { to: "/settings", icon: <FiSettings size={20} />, text: "Settings" },
  ];

  return (
    <div className={`h-screen sticky top-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      {/* Header */}
      <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-4 border-b border-gray-200`}>
        {isOpen && <span className="font-semibold text-gray-900">Consensus Sentry</span>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900"
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
              className={`flex items-center p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                isOpen ? "gap-3 justify-start" : "gap-0 justify-center"
              }`}
            >
              <span className="text-gray-600">
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