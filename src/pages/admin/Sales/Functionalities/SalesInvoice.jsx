import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, Printer, SquarePen } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { InvoiceTemplate } from "../../../../helper/InvoiceTemplate";
import axios from "axios";
import { use } from "react";
import { api } from "../../../../context/ApiService";
import { handleSaleInvoicePrint } from "../../../../helper/SalesPrintView";
import ViewInvoiceModal from "../../../../helper/ViewInvoiceModal";

const SalesInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  const [date, setDate] = useState(today);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [salesman, setSalesman] = useState("");
  const [salesmanList, setSalesmanList] = useState([]);
  const [previousBalance, setPreviousBalance] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState("");
  const [receivable, setReceivable] = useState("");
  const [received, setReceived] = useState("");
  const [balance, setBalance] = useState("");
  const [receivingDate, setReceivingDate] = useState("");
  const [isView, setIsView] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "invoices"
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
  };

  // ✅ Fetch all or filtered pending orders
  async function fetchSalesInvoiceList() {
    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_API_BASE_URL}/order-taker/pending`;
      let params = {}; // ✅ declare params first

      // If salesman is selected, apply filter query
      if (selectedSalesman) {
        params = {
          date: date,
          salesmanId: selectedSalesman,
        };
      }

      // ✅ include params only if needed
      const res = await axios.get(url, { params });

      // ✅ Handle response
      setInvoices(res.data?.data || []);
      // console.log("✅ Pending Orders Response:", res.data);
    } catch (error) {
      console.error("❌ Failed to fetch SalesInvoice:", error);
      setTimeout(() => {
        toast.error("Failed to fetch pending orders");
      }, 2000);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  // 🔹 Load all data initially
  // useEffect(() => {
  //   fetchSalesInvoiceList();
  // }, []);

  // 🔹 Re-fetch when date or salesman changes
  useEffect(() => {
    if (selectedSalesman || date) {
      fetchSalesInvoiceList();
    }
  }, [selectedSalesman, date]);

  // salesmanList
  const fetchSaleman = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/reports`);
      console.log(response);
      

      setSalesmanList(response);
    } catch (error) {
      console.error(" Failed to fetch customers by salesman:", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };
  useEffect(() => {
    fetchSaleman();
  }, []);

  // ✅ Fetch all sales invoices
  async function fetchAllSalesInvoices() {
    try {
      setLoading(true);

      const url = `${import.meta.env.VITE_API_BASE_URL}/sales-invoice`;
      const res = await axios.get(url);
      console.log("Data of sales", res.data);

      // Set state with fetched invoices
      setSalesInvoices(res.data?.data || []);
      // console.log("✅ All Sales Invoices:", res.data);
    } catch (error) {
      console.error("❌ Failed to fetch all sales invoices:", error);
      setTimeout(() => {
        toast.error("Failed to fetch sales invoices");
      }, 2000);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  // 🔹 Load all sales invoices initially
  useEffect(() => {
    if (activeTab === "pending") fetchSalesInvoiceList();
    else if (activeTab === "invoices") fetchAllSalesInvoices();
  }, [activeTab]);

  // ✅ Format date
  const formDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Edit handler
  // ✅ Edit handler (safe version)
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceId(invoice.orderId || "");
    setInvoiceDate(invoice.date || "");

    // Safely access nested data
    setCustomer(invoice.customerId?.customerName || "N/A");
    setSalesman(invoice.salesmanId?.employeeName || "N/A");
    setPreviousBalance(invoice.customerId?.salesBalance || 0);
    setDeliveryDate(new Date().toISOString().split("T")[0]); // current date

    // map products correctly
    const mappedItems = (invoice.products || []).map((p) => ({
      item: p.itemName || "",
      rate: p.rate || 0,
      qty: p.qty || 0,
      total: p.totalAmount || 0,
    }));
    setItems(mappedItems);

    setTotalPrice(invoice.totalAmount || 0);
    setDiscountAmount("");
    setReceivable(invoice.totalAmount || 0);
    setReceived("");
    setBalance(invoice.totalAmount || 0);

    // ✅ handle missing agingDate
    let agingDate = invoice.customerId?.timeLimit;
    if (!agingDate) {
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 30); // add 30 days
      agingDate = delivery.toISOString().split("T")[0];
    } else {
      agingDate = agingDate.split("T")[0];
    }

    setReceivingDate(agingDate);
    setIsSliderOpen(true);
  };

  // ✅ Total recalculation
  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    setTotalPrice(total);
    const discount = parseFloat(discountAmount) || 0;
    const receivableAmt = total - discount;
    setReceivable(receivableAmt);
    const bal = receivableAmt - (parseFloat(received) || 0);
    setBalance(bal);
  }, [items, discountAmount, received]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const payload = {
        invoiceNo: invoiceId,
        invoiceDate: new Date().toISOString().split("T")[0],
        customerId: editingInvoice.customerId._id,
        salesmanId: editingInvoice.salesmanId._id,
        orderTakingId: editingInvoice._id,
        products: items.map((item) => ({
          itemName: item.item,
          rate: item.rate,
          qty: item.qty,
          totalAmount: item.total,
        })),
        totalAmount: receivable,
        receivable: receivable,
        received: parseFloat(received) || 0,
        deliveryDate: deliveryDate,
        agingDate: receivingDate,
        discount: Number(discountAmount),
        status: "Pending", // default
      };
      // console.log("🧾 Payload to send:", payload);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/sales-invoice`,
        payload,
        headers
      );

      Swal.fire({
        icon: "success",
        title: "Invoice Created!",
        text: "Invoice posted successfully to server.",
        confirmButtonColor: "#3085d6",
      });

      setIsSliderOpen(false);
      fetchSalesInvoiceList();
    } catch (error) {
      console.error(" Invoice post error:", error);
      toast.error(error.response?.data?.message || "Failed to post invoice");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const orderId = invoice.orderId?.toLowerCase() || "";
    const customerName = invoice.customerId?.customerName?.toLowerCase() || "";
    const salesmanName = invoice.salesmanId?.employeeName?.toLowerCase() || "";

    return (
      orderId.includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      salesmanName.includes(searchTerm.toLowerCase())
    );
  });

  // 🔹 Filtered Records based on active tab
  const filteredRecords = (
    activeTab === "pending" ? invoices : salesInvoices
  ).filter((invoice) => {
    const orderId = (
      activeTab === "pending" ? invoice.orderId : invoice.invoiceNo || ""
    ).toLowerCase();
    const customerName = (invoice.customerId?.customerName || "").toLowerCase();
    const salesmanName = (invoice.salesmanId?.employeeName || "").toLowerCase();

    return (
      orderId.includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      salesmanName.includes(searchTerm.toLowerCase())
    );
  });

  const recordsPerPage = 10;
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [currentPageInvoices, setCurrentPageInvoices] = useState(1);

  // 🔢 Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredInvoices.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredInvoices.length / recordsPerPage);
  // console.log({currentRecords});

  // For Pending & Invoices (filtered by searchTerm)
  const indexOfLastPending = currentPagePending * recordsPerPage;
  const indexOfFirstPending = indexOfLastPending - recordsPerPage;
  const currentPendingRecords = filteredRecords.slice(
    indexOfFirstPending,
    indexOfLastPending
  );
  const totalPendingPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const indexOfLastInvoice = currentPageInvoices * recordsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - recordsPerPage;
  const currentInvoiceRecords = filteredRecords.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );
  const totalInvoicePages = Math.ceil(filteredRecords.length / recordsPerPage);

  const gridColumns =
    activeTab === "pending"
      ? "0.2fr 1fr 1fr 1fr 1fr 1fr 1fr" // 7 columns
      : "0.2fr 1fr 1fr 1fr 1fr 1fr 1fr"; // 7 columns for invoices too
  console.log({ currentInvoiceRecords });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {loading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-newPrimary">
              Pending Orders
            </h1>
          </div>

          {/* 🔹 Filter Fields */}
          <div className="flex flex-wrap justify-between items-start gap-8 w-full mt-4 mb-1">
            {/* Date + Invoice in left column */}
            <div className="flex flex-wrap justify-between items-center gap-8 w-full mt-4 mb-5">
              {/* Left: Date + Salesman */}
              {activeTab === "pending" && (
                <div className="flex gap-8 flex-wrap">
                  <div className="flex items-center gap-6">
                    <label className="text-gray-700 font-medium w-24">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      max={today}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="text-gray-700 font-medium w-24">
                      Sales Officer
                    </label>
                    <select
                      value={selectedSalesman}
                      onChange={(e) => setSelectedSalesman(e.target.value)}
                      className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value="">Select Sales Officer</option>
                      {salesmanList.map((cust) => (
                        <option key={cust._id} value={cust._id}>
                          {cust.employeeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Right: Search Bar */}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by Customer, Sales Officer ..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset to first page on search
                  }}
                  className="w-64 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                />

                {/* Print Button */}
                {activeTab === "invoices" && (
                  <button
                    onClick={() =>
                      handleSaleInvoicePrint(
                        activeTab === "pending"
                          ? currentPendingRecords
                          : currentInvoiceRecords
                      )
                    }
                    className="p-2 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition-colors flex items-center"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === "pending"
                  ? "bg-newPrimary text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab("pending");
                setCurrentPagePending(1); // reset pending page
              }}
            >
              All Pending
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === "invoices"
                  ? "bg-newPrimary text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab("invoices");
                setCurrentPageInvoices(1); // reset invoices page
              }}
            >
              All Invoices
            </button>
          </div>

          {/* ✅ Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[800px]">
              <div className="min-w-[1000px]">
                <div
                  className="hidden lg:grid gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200"
                  style={{ gridTemplateColumns: gridColumns }}
                >
                  <div>SR</div>
                  <div>
                    {activeTab === "pending" ? "Order ID" : "Invoice No."}
                  </div>
                  <div>
                    {activeTab === "pending" ? "Order Date" : "Invoice Date"}
                  </div>
                  <div>Salesman</div>
                  <div>Customer</div>
                  <div>Amount</div>

                  {activeTab === "invoices" && <div>Action</div>}

                  {activeTab === "pending" && <div>Action</div>}
                </div>

                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={10}
                      cols={activeTab === "pending" ? 7 : 6}
                      className={
                        activeTab === "pending"
                          ? "lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                          : "lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr]"
                      }
                    />
                  ) : (activeTab === "pending"
                      ? currentPendingRecords
                      : currentInvoiceRecords
                    ).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No{" "}
                      {activeTab === "pending"
                        ? "Pending Orders"
                        : "Sales Invoices"}{" "}
                      Found
                    </div>
                  ) : (
                    (activeTab === "pending"
                      ? currentPendingRecords
                      : currentInvoiceRecords
                    ).map((invoice, index) => (
                      <div
                        key={invoice._id || invoice.invoiceNo}
                        className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                        style={{ gridTemplateColumns: gridColumns }}
                      >
                        <div>{indexOfFirstRecord + index + 1}</div>
                        <div>
                          {activeTab === "pending"
                            ? invoice.orderId
                            : invoice.invoiceNo || "-"}
                        </div>
                        <div>
                          {formDate(
                            activeTab === "pending"
                              ? invoice.date
                              : invoice.invoiceDate
                          )}
                        </div>
                        <div>{invoice.salesmanId?.employeeName || "-"}</div>
                        <div>{invoice.customerId?.customerName || "-"}</div>
                        <div>{invoice.totalAmount ?? "-"}</div>
                        {activeTab === "pending" && (
                          <div className="flex gap-3 justify-start">
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                              title="Edit"
                            >
                              <SquarePen size={18} />
                            </button>
                          </div>
                        )}

                        {activeTab === "invoices" && (
                          <div className="flex gap-3 justify-start">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsView(true);
                              }}
                              className="text-amber-600 hover:bg-green-50 rounded p-1 transition-colors"
                              title="View Invoice"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => handleSaleInvoicePrint([invoice])}
                              className="text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                              title="Print Invoice"
                            >
                              <Printer size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {activeTab === "pending" && totalPendingPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstPending + 1} to{" "}
                      {Math.min(indexOfLastPending, filteredInvoices.length)} of{" "}
                      {filteredInvoices.length} invoices
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPagePending((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPagePending === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPagePending === 1
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPagePending((prev) =>
                            Math.min(prev + 1, totalPendingPages)
                          )
                        }
                        disabled={currentPagePending === totalPendingPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPagePending === totalPendingPages
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "invoices" && totalInvoicePages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstInvoice + 1} to{" "}
                      {Math.min(indexOfLastInvoice, salesInvoices.length)} of{" "}
                      {salesInvoices.length} invoices
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPageInvoices((prev) =>
                            Math.max(prev - 1, 1)
                          )
                        }
                        disabled={currentPageInvoices === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPageInvoices === 1
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPageInvoices((prev) =>
                            Math.min(prev + 1, totalInvoicePages)
                          )
                        }
                        disabled={currentPageInvoices === totalInvoicePages}
                        className={`px-3 py-1 rounded-md ${
                          currentPageInvoices === totalInvoicePages
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Form slider */}
          {isSliderOpen && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] md:max-h-[90vh]">
                {isSaving && (
                  <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                  <h2 className="text-xl font-bold text-newPrimary">
                    Edit Pending Orders
                  </h2>
                  <button
                    className="text-2xl text-gray-500 hover:text-gray-700"
                    onClick={() => setIsSliderOpen(false)}
                  >
                    ×
                  </button>
                </div>

                {/* ✅ Form (same styling preserved) */}
                <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 border p-4 rounded-lg">
                    <div className="flex gap-3">
                      <label className="block text-gray-700 font-medium">
                        Order No. :
                      </label>
                      <p>{invoiceId}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Order Date :
                      </label>
                      <p>{formDate(invoiceDate)}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer :
                      </label>
                      <p>{customer}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Salesman :
                      </label>
                      <p>{salesman}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Previous Balance :
                      </label>
                      <p>{previousBalance}</p>
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Delivery Date :
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>

                  {/* ✅ Items table */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Items
                    </h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[60px_2fr_1fr_1fr_1fr] bg-gray-200 text-gray-600 text-sm font-semibold uppercase border-b border-gray-300">
                        <div className="px-4 py-2 border-r border-gray-300">
                          SR#
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Item
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Rate
                        </div>
                        <div className="px-4 py-2 border-r border-gray-300">
                          Qty
                        </div>
                        <div className="px-4 py-2">Total</div>
                      </div>

                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[60px_2fr_1fr_1fr_1fr] text-sm text-gray-700 bg-gray-100 even:bg-white border-t border-gray-300"
                        >
                          <div className="px-4 py-2 border-r border-gray-300">
                            {i + 1}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            {item.item}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                setItems((prev) =>
                                  prev.map((it, idx) =>
                                    idx === i
                                      ? { ...it, rate, total: rate * it.qty }
                                      : it
                                  )
                                );
                              }}
                              className="w-20 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            />
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => {
                                const newQty = parseFloat(e.target.value) || 1;

                                setItems((prev) =>
                                  prev.map((it, idx) => {
                                    if (idx === i) {
                                      // 🧠 Store original qty (first time only)
                                      if (!it.originalQty)
                                        it.originalQty = it.qty;

                                      // 🧩 Allow only between 1 and originalQty
                                      const updatedQty = Math.min(
                                        Math.max(newQty, 1),
                                        it.originalQty
                                      );

                                      return {
                                        ...it,
                                        qty: updatedQty,
                                        total: updatedQty * it.rate,
                                      };
                                    }
                                    return it;
                                  })
                                );
                              }}
                              className="w-20 p-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-newPrimary"
                            />
                          </div>
                          <div className="px-4 py-2">{item.total}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Totals */}
                  <div className="flex flex-col w-full items-end gap-4 mt-4">
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total Price :
                      </label>
                      <input
                        type="number"
                        value={totalPrice}
                        disabled
                        readOnly
                        className="w-[150px] cursor-not-allowed bg-gray-100  h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Discount :
                      </label>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-[150px]  h-[40px] p-3 border border-gray-300 rounded-md"
                        placeholder="Enter Discount"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Receivable :
                      </label>
                      <input
                        type="number"
                        value={receivable}
                        disabled
                        readOnly
                        className="w-[150px] cursor-not-allowed bg-gray-100  h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Received :
                      </label>
                      <input
                        type="number"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                        className="w-[150px]  h-[40px] p-3 border border-gray-300 rounded-md"
                        placeholder="Enter Recived"
                      />
                    </div>

                    <div className="flex w-full  ">
                      <div className="flex-1 gap-2 flex min-w-0">
                        <label className="block text-gray-700 font-medium mb-1">
                          Aging Date :
                        </label>
                        <input
                          type="date"
                          value={receivingDate}
                          onChange={(e) => setReceivingDate(e.target.value)}
                          className="w-[150px]  h-[40px] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        />
                      </div>

                      <div className="flex gap-2">
                        <label className="block text-gray-700 font-medium mb-2">
                          Balance :
                        </label>
                        <input
                          type="number"
                          value={balance}
                          disabled
                          readOnly
                          className="w-[150px] cursor-not-allowed  h-[40px] bg-gray-100 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          placeholder="Balance amount"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors"
                  >
                    Update Pending Orders
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      {isView && selectedInvoice && (
        <ViewInvoiceModal
          data={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null);
            setIsView(false);
          }}
        />
      )}
    </div>
  );
};

export default SalesInvoice;
