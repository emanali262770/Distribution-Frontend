import React, { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaBox,
  FaReceipt,
  FaUsers,
  FaBarcode,
  FaChartBar,
  FaUserShield,
  FaCogs,
  FaTags,
  FaIndustry,
  FaTruck,
  FaWarehouse,
  FaUsersCog,
  FaBalanceScale,
  FaUserCog,
  FaShoppingCart,
} from "react-icons/fa";
import { TrendingUpDown } from "lucide-react";

import { FaUserGroup } from "react-icons/fa6";
import { BsBank2 } from "react-icons/bs";
import { FaBook } from "react-icons/fa";

import {
  MdOutlineAccountBalanceWallet,
  MdOutlineIntegrationInstructions,
  MdOutlineSecurity,
} from "react-icons/md";
import { BsCash } from "react-icons/bs";

import { FcSalesPerformance } from "react-icons/fc";
import { RiLogoutBoxRLine, RiDashboardFill } from "react-icons/ri";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BiPurchaseTag, BiPurchaseTagAlt } from "react-icons/bi";
import { IoBagCheckSharp } from "react-icons/io5";
import { TbFileInvoice } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { RiBankCard2Line, RiBankCardLine  } from "react-icons/ri";
// 🔹 Link definitions with permission keys
const links = [
  { to: "/admin", label: "Dashboard", icon: <RiDashboardFill /> },

  {
    to: "/admin/purchase",
    label: "Purchase ",
    icon: <IoBagCheckSharp />,
  },
  {
    to: "/admin/sales",
    label: "Sales ",
    icon: <BiPurchaseTagAlt />,
  },
  {
    to: "/admin/accounts",
    label: "Accounts",
    icon: <MdOutlineManageAccounts />,
    children: [
      {
        to: "/admin/expense",
        label: "Expense",
        icon: <RiBankCard2Line />,
      },
       {
        to: "/admin/bank",
        label: "Bank",
        icon: <BsBank2 />,
      },
      {
        to: "/admin/cash-deposite",
        label: "Cash Deposite",
        icon: <BsCash />,
      },
      {
        to: "/admin/day-book",
        label: "Day Book",
        icon: <FaBook />,
      },
    ],
  },

  {
    to: "/admin/all-orders-invoice",
    label: "All Orders / Invoice",
    icon: <TbFileInvoice size={20} />,
  },
  {
    to: "/admin/profit-loss",
    label: "Profit & Loss",
    icon: <TrendingUpDown size={20} />,
  },
  {
    to: "/admin/security",
    label: "Security",
    icon: <MdOutlineSecurity />,
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  // 🔹 Get logged-in user info from localStorage with fallback
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("lastTokenCheck");
    navigate("/");
  };

  useEffect(() => {
    links.forEach((link) => {
      if (link.children) {
        const isChildActive = link.children.some((child) =>
          location.pathname.startsWith(child.to)
        );
        if (isChildActive) {
          setOpenMenu(link.label);
        }
      }
    });
  }, [location.pathname]);

  // 🔹 Permission filter logic with safer property access
  const filterWithPermissions = (link) => {
    if (userInfo.isAdmin === true) return true; // Admin sees everything
    if (!link.key) return true; // Links without key always show
    return userInfo[link.key] === true; // Check permission key
  };

  const filteredLinks = links.filter(filterWithPermissions).map((link) =>
    link.children
      ? {
          ...link,
          children: link.children.filter(filterWithPermissions),
        }
      : link
  );

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <aside className="bg-white shadow min-h-screen w-16 sm:w-20 md:w-60 flex flex-col py-8 px-2 sm:px-4 justify-between transition-all">
      <div>
        {/* Logo + Title */}
        <div className="flex items-center justify-center sm:justify-start mb-12 space-x-2 sm:space-x-4">
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-newPrimary to-primaryDark bg-clip-text text-transparent">
            Distribution System. 
          </h1>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col gap-2">
          {filteredLinks.map((link) =>
            link.children && link.children.length > 0 ? (
              <div key={link.label}>
                <button
                  onClick={() => toggleMenu(link.label)}
                  className={`w-full flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30 ${
                    openMenu === link.label ? "bg-newPrimary/20" : ""
                  }`}
                >
                  {link.icon}
                  <span className="hidden sm:inline">{link.label}</span>
                  {openMenu === link.label ? (
                    <FaChevronUp className="ml-auto w-4 h-4 hidden sm:block" />
                  ) : (
                    <FaChevronDown className="ml-auto w-4 h-4 hidden sm:block" />
                  )}
                </button>

                {openMenu === link.label && (
                  <div className="ml-2 sm:ml-4 mt-1 flex flex-col gap-1">
                    {link.children.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${
                            isActive
                              ? "bg-newPrimary/80 text-white"
                              : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                          }`
                        }
                      >
                        {sub.icon && (
                          <span className="text-lg">{sub.icon}</span>
                        )}
                        <span className="hidden sm:inline">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? "bg-newPrimary/80 text-white"
                      : "text-gray-700 hover:text-gray-600 hover:bg-newPrimary/30"
                  }`
                }
                end={link.to === "/admin"}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </NavLink>
            )
          )}
        </nav>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center w-full gap-2 px-2 sm:px-4 py-2 mt-2 rounded font-semibold text-gray-700 hover:bg-red-600 hover:text-white transition"
        >
          <RiLogoutBoxRLine size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
