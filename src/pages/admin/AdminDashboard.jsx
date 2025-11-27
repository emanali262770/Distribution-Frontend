import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  Package,
  UserCheck,
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
} from "lucide-react";
import CommanHeader from "../admin/Components/CommanHeader";

import HeaderSkeleton from "./HeaderSkeleton";
import SummaryCardSkeleton from "./SummaryCardSkeleton";
import ChartSkeleton from "./ChartSkeleton";
import DasboardTableSkelton from "./DasboardTableSkelton";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const [customers, setCustomers] = useState(0);
  const [items, setItems] = useState(0);
  const [booking, setBooking] = useState(0);
  const [users, setUsers] = useState(0);
  const [sales, setSales] = useState(0);
  const [bookingCompleted, setBookingCompleted] = useState(0);
  const [bookingPending, setBookingPending] = useState(0);
  const [bookingRejected, setBookingRejected] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saleschartData, setSalesChartData] = useState([]);
  const [recentCustomer, setRecentCustomer] = useState([]);
  const [activePeriod, setActivePeriod] = useState("weekly");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");
  const [customerCount, setCustomerCount] = useState([]);
  const [totalProducts, setTotalProducts] = useState([]);
  const [totalStaff, setTotalStaff] = useState([]);
  const [totalSales, setTotalSales] = useState([]);
  const [totalBooking, setTotalBooking] = useState([]);
  const data = [
    { name: "Jan", uv: 4000, pv: 2400 },
    { name: "Feb", uv: 3000, pv: 1398 },
    { name: "Mar", uv: 2000, pv: 9800 },
    { name: "Apr", uv: 2780, pv: 3908 },
    { name: "May", uv: 1890, pv: 4800 },
    { name: "Jun", uv: 2390, pv: 3800 },
    { name: "Jul", uv: 3490, pv: 4300 },
    { name: "Aug", uv: 4200, pv: 3600 },
    { name: "Sep", uv: 3100, pv: 4100 },

  ];
  const pieData1 = [
    { name: "Active", value: 60 },
    { name: "Inactive", value: 25 },
    { name: "Pending", value: 15 },
  ];

  const pieData2 = [
    { name: "Completed", value: 75 },
    { name: "In Progress", value: 20 },
    { name: "Delayed", value: 5 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];

  const dummyBookings = [
    {
      id: 1,
      customerName: "John Doe",
      mobileNo: "123-456-7890",
      address: "123 Main St, New York",
      items: ["Pizza", "Burger"],
      total: 1200,
      paymentMethod: "Credit Card",
      status: "Approved",
    },
    {
      id: 2,
      customerName: "Alexander Pierce",
      mobileNo: "555-111-2222",
      address: "456 Elm St, Los Angeles",
      items: ["Pasta", "Salad"],
      total: 800,
      paymentMethod: "Cash",
      status: "Pending",
    },
    {
      id: 3,
      customerName: "Bob Doe",
      mobileNo: "987-654-3210",
      address: "789 Oak St, Chicago",
      items: ["Sushi", "Noodles"],
      total: 1500,
      paymentMethod: "PayPal",
      status: "Approved",
    },
    {
      id: 4,
      customerName: "Mike Doe",
      mobileNo: "444-222-3333",
      address: "321 Pine St, Houston",
      items: ["Sandwich", "Juice"],
      total: 600,
      paymentMethod: "Debit Card",
      status: "Denied",
    },
    {
      id: 5,
      customerName: "Mike Doe",
      mobileNo: "444-222-3333",
      address: "321 Pine St, Houston",
      items: ["Sandwich", "Juice"],
      total: 600,
      paymentMethod: "Debit Card",
      status: "Denied",
    },
    {
      id: 6,
      customerName: "Mike Doe",
      mobileNo: "444-222-3333",
      address: "321 Pine St, Houston",
      items: ["Sandwich", "Juice"],
      total: 600,
      paymentMethod: "Debit Card",
      status: "Denied",
    },
    {
      id: 7,
      customerName: "Mike Doe",
      mobileNo: "444-222-3333",
      address: "321 Pine St, Houston",
      items: ["Sandwich", "Juice"],
      total: 600,
      paymentMethod: "Debit Card",
      status: "Denied",
    },
  ];
  const filteredData =
    dashboardData?.recentBookings.filter(
      (b) =>
        b.customerId.customerName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        b.customerId.phoneNumber
          .toLowerCase()
          .includes(search.toLowerCase())
    ) || [];

  const abortRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const base = import.meta.env.VITE_API_BASE_URL;
  const statusColor = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-amber-100 text-amber-800",
    Denied: "bg-rose-100 text-rose-800",
  };

  // fetch Customer Count
  const fetchCustomerCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base}/dashboard/customers-count`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setCustomerCount(response.data);
      // console.log("Customers:", response.data);
    } catch (error) {
      console.error("Failed to fetch customer list", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, [userInfo.token, base]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${base}/dashboard/summary`);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);



  useEffect(() => {
    fetchCustomerCount();
  }, [fetchCustomerCount]);
  // console.log({ customerCount });

  // fetch Total Products
  const fetchTotalProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base}/dashboard/product-count`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setTotalProducts(response.data);
      // console.log("Products:", response.data);
    } catch (error) {
      console.error("Failed to fetch customer list", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchTotalProducts();
  }, [fetchTotalProducts]);

  // fetch Total Staff
  const fetchTotalStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base}/dashboard/staff-count`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setTotalStaff(response.data);
      // console.log("Staff:", response.data);
    } catch (error) {
      console.error("Failed to fetch customer list", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchTotalStaff();
  }, [fetchTotalStaff]);

  // fetch Total Sales
  const fetchTotalSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base}/dashboard/sales-count`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setTotalSales(response.data);
      // console.log("Sales:", response.data);
    } catch (error) {
      console.error("Failed to fetch Total Sales", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchTotalSales();
  }, [fetchTotalSales]);

  // fetch Total Sales
  const fetchTotalBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base}/dashboard/order-count`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setTotalBooking(response.data);
      // console.log("Booking:", response.data);
    } catch (error) {
      console.error("Failed to fetch Total Bookings", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchTotalBookings();
  }, [fetchTotalBookings]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${base}/customers/count`, {
          signal: controller.signal,
        });
        setCustomers(res.data?.totalCustomers ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Customer fetch failed:", err);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${base}/item-details/count`, {
          signal: controller.signal,
        });
        setItems(res.data?.count ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Items fetch failed:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${base}/company-users/count`, {
          signal: controller.signal,
        });
        setUsers(res.data?.len ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Users fetch failed:", err);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${base}/bookings/count`, {
          signal: controller.signal,
        });
        setBooking(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };
    const fetchNotifcations = async () => {
      try {
        const res = await axios.get(`${base}/notifications`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          signal: controller.signal,
        });
        setNotifications(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchBookingRecent = async () => {
      try {
        const res = await axios.get(`${base}/bookings/recent`, {
          signal: controller.signal,
        });
        setRecentCustomer(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchBookingCompleted = async () => {
      try {
        const res = await axios.get(`${base}/bookings/completed`, {
          signal: controller.signal,
        });
        setBookingCompleted(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchBookingPending = async () => {
      try {
        const res = await axios.get(`${base}/bookings/pending`, {
          signal: controller.signal,
        });
        setBookingPending(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchBookingRejected = async () => {
      try {
        const res = await axios.get(`${base}/bookings/rejected`, {
          signal: controller.signal,
        });
        setBookingRejected(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Bookings fetch failed:", err);
      }
    };

    const fetchSales = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/count`, {
          signal: controller.signal,
        });
        setSales(res.data?.total ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Sales fetch failed:", err);
      }
    };

    const fetchRevenue = async () => {
      try {
        const res = await axios.get(`${base}/saleInvoices/total-revenue`, {
          signal: controller.signal,
        });
        setRevenue(res.data?.totalRevenue ?? 0);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Revenue fetch failed:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchCustomers(),
        fetchItems(),
        fetchUsers(),
        fetchBookings(),
        fetchBookingCompleted(),
        fetchBookingPending(),
        fetchSales(),
        fetchRevenue(),
        fetchNotifcations(),
        fetchBookingRejected(),
        fetchBookingRecent(),
      ]);
      // Add a slight delay to show loading animation
      setTimeout(() => setLoading(false), 1000);
    };

    fetchAll();

    return () => {
      controller.abort();
    };
  }, []);

  const fetchSalesChart = async (period = "weekly") => {
    try {
      const res = await axios.get(
        `${base}/dashboard/sales-overview?type=${period}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      const transformedData = (res.data.data || res.data).map((item) => {
        const date = new Date(item._id);
        let label;
        if (period === "weekly") {
          label = `${date.getDate()}th`;
        } else if (period === "monthly") {
          label = date.toLocaleString("default", { month: "short" });
        } else if (period === "yearly") {
          label = date.getFullYear();
        }
        return {
          day: label,
          thisWeek: item.total,
          lastWeek: Math.floor(item.total * 0.6),
        };
      });

      setSalesChartData([]);
      setTimeout(() => setSalesChartData(transformedData), 0);
    } catch (err) {
      console.error("Sales chart fetch failed:", err);
    }
  };

  // console.log(saleschartData);

  useEffect(() => {
    fetchSalesChart("weekly");
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Mark single notification as read

  // ✅ Mark all notifications as read

  const summaryData = dashboardData
    ? [
      {
        name: "Total Customers",
        value: dashboardData.stats.totalCustomers,
        icon: <Users size={24} />,
        change: "+12%",
        color: "bg-blue-100 text-blue-600",
        border: "border-l-4 border-blue-700",
      },
      {
        name: "Total Products",
        value: dashboardData.stats.totalProducts,
        icon: <Package size={24} />,
        change: "+5%",
        color: "bg-green-100 text-green-600",
        border: "border-l-4 border-green-400",
      },
      {
        name: "Total Staff",
        value: dashboardData.stats.totalStaff,
        icon: <UserCheck size={24} />,
        change: "+2%",
        color: "bg-purple-100 text-purple-600",
        border: "border-l-4 border-purple-400",
      },
      {
        name: "Total Sales",
        value: dashboardData.stats.totalSales,
        icon: <CreditCard size={24} />,
        change: "+18%",
        color: "bg-amber-100 text-amber-600",
        border: "border-l-4 border-amber-500",
      },
      {
        name: "Bookings",
        value: dashboardData.stats.totalBookings,
        icon: <Calendar size={24} />,
        change: "-3%",
        color: "bg-rose-100 text-rose-600",
        border: "border-l-4 border-rose-400",
      },
    ]
    : [];

  const pieData = [
    { month: "JUN", thisYear: 1000, lastYear: 600 },
    { month: "JUL", thisYear: 2000, lastYear: 1800 },
    { month: "AUG", thisYear: 3000, lastYear: 2800 },
    { month: "SEP", thisYear: 2500, lastYear: 2000 },
    { month: "OCT", thisYear: 2700, lastYear: 1900 },
    { month: "NOV", thisYear: 2600, lastYear: 1500 },
    { month: "DEC", thisYear: 3000, lastYear: 2000 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow rounded text-sm">
          <p className="font-semibold">{label}</p>
          <p style={{ color: "#2563eb" }}>High - 2023: {payload[0]?.value}</p>
          <p style={{ color: "#6b7280" }}>Low - 2023: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 w-full bg-gray-50 min-h-screen">
      {/* Updated Header - Replaced Search Bar */}
      {loading ? <HeaderSkeleton /> : <CommanHeader />}
      {/* Summary Cards Grid */}
      {loading ? (
        <SummaryCardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {summaryData.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${item.border}`}
              style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {item.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-800">
                  {item.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <>
            <ChartSkeleton className="h-[250px] w-full" />
            <ChartSkeleton className="h-[250px] w-full" />
            <ChartSkeleton className="h-[250px] w-full" />
          </>
        ) : (
          <>
            {/* Sales Chart */}
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold mb-4">Customer Orders</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={dashboardData?.charts.customerOrders.map((item) => ({
                      name: new Date(2025, item._id - 1).toLocaleString("default", { month: "short" }),
                      pv: item.totalOrders,
                      uv: Math.floor(item.totalOrders * 0.8),
                    })) || []}
                  >

                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pv" barSize={20} fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="uv" stroke="#EC4899" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 ">
                Sales Profit
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.charts.salesProfit.map((item) => ({
                        name: item.label,
                        value: item.value,
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      dataKey="value"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Color Legend */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600 ">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500 block"></span>
                  <span>Net Profit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 block"></span>
                  <span>Total Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-500 block"></span>
                  <span>Total Expenses</span>
                </div>
              </div>
            </div>

            {/* Project Completion Chart */}
            <div className="bg-white  rounded-2xl p-6 shadow hover:shadow-lg transition-all">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 ">
                Customer Balance
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.charts.customerBalance.map((item) => ({
                        name: item.label,
                        value: item.value,
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      dataKey="value"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell2-${index}`} fill={color} />
                      ))}
                    </Pie>


                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Color Legend */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500 block"></span>
                  <span>Paid In Full</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 block"></span>
                  <span>Pending Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-500 block"></span>
                  <span>Overdue Balance</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        {/* Header with Search */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h2 className="text-md font-semibold text-gray-700">
            Recent Booking Customers
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2 top-2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Scrollable Table with Fixed Header */}
        <div className="overflow-y-auto max-h-72">
          <div className="min-w-[1000px] text-sm">
            {/* Table Header */}
            <div className="grid grid-cols-7 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b border-gray-200 sticky top-0 z-10">
              <div>Customer Name</div>
              <div>Mobile No.</div>
              <div>Address</div>
              <div>Items</div>
              <div>Total</div>
              <div>Payment Method</div>
              <div>Status</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col divide-y divide-gray-200">
              {loading ? (
                <DasboardTableSkelton rows={filteredData.length} cols={7} />
              ) : (
                filteredData.map((booking) => (
                  <div
                    key={booking._id}
                    className="grid grid-cols-7 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-gray-700">
                      {booking.customerId.customerName}
                    </div>
                    <div className="text-gray-600">{booking.customerId.phoneNumber}</div>
                    <div className="text-gray-600 truncate">
                      {booking.customerId.address}
                    </div>
                    <div className="text-gray-600 truncate">
                      {booking.products.map((p) => p.itemName).join(", ")}
                    </div>
                    <div className="text-gray-600">
                      Rs.
                      {booking.products.reduce((sum, p) => sum + (p.totalAmount || 0), 0)}
                    </div>
                    <div className="text-gray-600">—</div>
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${booking.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))

              )}
            </div>
          </div>
        </div>

        {/* No Data State */}
        {filteredData.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500">
            No recent transactions found.
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
