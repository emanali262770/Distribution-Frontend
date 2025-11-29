import { NavLink } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaThList,
  FaUsers,
  FaBox,
  FaIndustry,
  FaWarehouse,
  FaBoxOpen,
  FaBook,
  FaCalendarAlt,
  FaUserTie,
  FaTruck,
} from "react-icons/fa";
import {
  BadgeEuro,
  DollarSign,
  FileSpreadsheet,
  Scale,
  BarChart2,
} from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";

// 🔹 Functionalities
const purchaseFunctionalities = [
  {
    to: "/admin/purchase/grn",
    label: "GRN",
    icon: <BadgeEuro strokeWidth={3} size={40} />,
  },
  // {
  //   to: "/admin/purchase/payment-to-supplier",
  //   label: "Payment To Supplier",
  //   icon: <DollarSign strokeWidth={3} size={40} />,
  // },
];

// 🔹 Reports
const purchaseReports = [
  {
    to: "/admin/purchase/amount-payable",
    label: "Amount Payable",
    icon: <FaMoneyBillWave className="text-4xl" />,
  },
  {
    to: "/admin/purchase/datewise-purchase",
    label: "Datewise Purchase",
    icon: <FaCalendarAlt className="text-4xl" />,
  },
  {
    to: "/admin/purchase/itemwise-purchases",
    label: "Itemwise Purchases",
    icon: <FaBoxOpen className="text-4xl" />,
  },
  {
    to: "/admin/purchase/supplier-ledger",
    label: "Supplier Ledger",
    icon: <FaBook className="text-4xl" />,
  },
  {
    to: "/admin/purchase/supplierwise-purchase",
    label: "Supplierwise Purchase",
    icon: <FaUserTie className="text-4xl" />,
  },
  {
    to: "/admin/purchase/supplier-aging",
    label: "Supplier Aging",
    icon: <FaBook className="text-4xl" />,
  },
    {
    to: "/admin/report/opening-stock-supplierwise",
    label: "Stock Position",
    icon: <Scale strokeWidth={3} size={40} />,
  },
  //   {
  //   to: "/admin/report/stock-price",
  //   label: "Stock Price",
  //   icon: <BarChart2 strokeWidth={3} size={40} />,
  // }
];

// 🔹 Setup
const purchaseSetup = [
  {
    to: "/admin/purchase/define-supplier",
    label: "Define Supplier",
    icon: <FaTruck className="text-4xl" />,
  },
];

const PurchaseSideBar = () => {
  return (
    <div>
      <CommanHeader />

      <div
        className="p-6 relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/sales-invoice1.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Functionalities Section */}
          <h1 className="text-2xl text-white font-bold mb-6">Functionalities</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseFunctionalities.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Reports Section */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Reports</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseReports.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Setup Section */}
          <h1 className="mt-2 text-2xl text-white font-bold mb-6">Setup</h1>
          <div className="bg-gray-400 opacity-80 rounded-xl px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {purchaseSetup.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center text-white hover:text-green-600 group transition-all duration-300 hover:bg-emerald-100 h-32 w-60 rounded-2xl"
                >
                  <div className="text-4xl mb-2 text-white group-hover:text-green-700 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-center">{item.label}</h2>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSideBar;
