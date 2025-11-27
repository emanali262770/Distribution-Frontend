import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import CommanHeader from "../Components/CommanHeader";
import TableSkeleton from "../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const AllorderInvoice = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search
  const [searchTermOrders, setSearchTermOrders] = useState("");
  const [searchTermInvoices, setSearchTermInvoices] = useState("");

  // Pagination
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [currentPageInvoices, setCurrentPageInvoices] = useState(1);
  const recordsPerPage = 10;

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    headers: { Authorization: `Bearer ${userInfo?.token}` },
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/order-taker`,
        headers
      );
      setOrders(res.data.data || []);
    } catch (error) {
      // console.log("Error fetching orders", error);
    }
    setLoading(false);
  };

  // Fetch Invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/sales-invoice`,
        headers
      );
      setInvoices(res.data.data || []);
    } catch (error) {
      // console.log("Error fetching invoices", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchInvoices();
  }, []);

  // DELETE ORDER
  const handleDeleteOrder = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the order.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/order-taker/${id}`,
          headers
        );

        setOrders((prev) => prev.filter((o) => o._id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Order deleted successfully.",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("Order delete error:", error);
        toast.error(error.response?.data?.message || "Failed to delete order");
      }
    }
  };

  // DELETE INVOICE
  const handleDeleteInvoice = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the invoice.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/sales-invoice/${id}`,
          headers
        );

        setInvoices((prev) => prev.filter((inv) => inv._id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Invoice deleted successfully.",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("Invoice delete error:", error);
        toast.error(error.response?.data?.message || "Failed to delete invoice");
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // -------------------- ORDERS FILTER + PAGINATION --------------------
  const indexOfLastOrder = currentPageOrders * recordsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - recordsPerPage;

  const filteredOrders = orders.filter((o) => {
    const term = searchTermOrders.toLowerCase();

    return (
      (o.orderId || "").toLowerCase().includes(term) ||
      (o.customerId?.customerName || "").toLowerCase().includes(term) ||
      (o.salesmanId?.employeeName || "").toLowerCase().includes(term)
    );
  });

  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalOrderPages = Math.ceil(filteredOrders.length / recordsPerPage);

  // -------------------- INVOICE FILTER + PAGINATION --------------------
  const indexOfLastInvoice = currentPageInvoices * recordsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - recordsPerPage;

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTermInvoices.toLowerCase();

    return (
      (inv.invoiceNo || "").toLowerCase().includes(term) ||
      (inv.customerId?.customerName || "").toLowerCase().includes(term) ||
      (inv.salesmanId?.employeeName || "").toLowerCase().includes(term)
    );
  });

  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const totalInvoicePages = Math.ceil(
    filteredInvoices.length / recordsPerPage
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        {/* TOP BUTTONS */}
        <div className="flex gap-4 ">
          <button
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === "orders"
                ? "bg-newPrimary text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            All Orders
          </button>

          <button
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === "invoices"
                ? "bg-newPrimary text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            All Invoices
          </button>
        </div>

        {/* -------------------- ORDERS SECTION -------------------- */}
        {activeTab === "orders" && (
          <>
            {/* SEARCH BAR */}
            <div className="flex justify-end mb-4">
              <input
                type="text"
                placeholder="Search Order, Customer, Salesman..."
                value={searchTermOrders}
                onChange={(e) => {
                  setSearchTermOrders(e.target.value);
                  setCurrentPageOrders(1);
                }}
                className="w-full md:w-64 p-2 border rounded-lg"
              />
            </div>

            <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_60px] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
                  <div>SR</div>
                  <div>Order ID</div>
                  <div>Date</div>
                  <div>Salesman</div>
                  <div>Customer</div>
                  <div>Phone</div>
                  <div>Action</div>
                </div>

                {/* Rows */}
                {loading ? (
                  <TableSkeleton rows={5} cols={7} />
                ) : filteredOrders.length === 0 ? (
                  <div className="p-4 text-center text-gray-600">
                    No Orders Found
                  </div>
                ) : (
                  currentOrders.map((o, index) => (
                    <div
                      key={o._id}
                      className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_60px] px-6 py-3 border-b bg-white"
                    >
                      <div>{indexOfFirstOrder + index + 1}</div>
                      <div>{o.orderId}</div>
                      <div>{formatDate(o.date)}</div>
                      <div>{o.salesmanId?.employeeName}</div>
                      <div>{o.customerId?.customerName}</div>
                      <div>{o.customerId?.phoneNumber}</div>
                      <div>
                        <Trash2
                          onClick={() => handleDeleteOrder(o._id)}
                          className="text-red-600 cursor-pointer"
                          size={18}
                        />
                      </div>
                    </div>
                  ))
                )}

                {/* PAGINATION */}
                {totalOrderPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstOrder + 1} to{" "}
                      {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                      {filteredOrders.length} orders
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPageOrders((prev) =>
                            Math.max(prev - 1, 1)
                          )
                        }
                        disabled={currentPageOrders === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPageOrders === 1
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                      >
                        Previous
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPageOrders((prev) =>
                            Math.min(prev + 1, totalOrderPages)
                          )
                        }
                        disabled={currentPageOrders === totalOrderPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPageOrders === totalOrderPages
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
          </>
        )}

        {/* -------------------- INVOICES SECTION -------------------- */}
        {activeTab === "invoices" && (
          <>
            {/* SEARCH BAR */}
            <div className="flex justify-end mb-4">
              <input
                type="text"
                placeholder="Search Invoice, Customer, Salesman..."
                value={searchTermInvoices}
                onChange={(e) => {
                  setSearchTermInvoices(e.target.value);
                  setCurrentPageInvoices(1);
                }}
                className="w-full md:w-64 p-2 border rounded-lg"
              />
            </div>

            <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_60px] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
                  <div>SR</div>
                  <div>Invoice No</div>
                  <div>Date</div>
                  <div>Salesman</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Action</div>
                </div>

                {/* Rows */}
                {loading ? (
                  <TableSkeleton rows={5} cols={7} />
                ) : filteredInvoices.length === 0 ? (
                  <div className="p-4 text-center text-gray-600">
                    No Invoices Found
                  </div>
                ) : (
                  currentInvoices.map((inv, index) => (
                    <div
                      key={inv._id}
                      className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_60px] px-6 py-3 border-b bg-white"
                    >
                      <div>{indexOfFirstInvoice + index + 1}</div>
                      <div>{inv.invoiceNo}</div>
                      <div>{formatDate(inv.invoiceDate)}</div>
                      <div>{inv.salesmanId?.employeeName}</div>
                      <div>{inv.customerId?.customerName}</div>
                      <div>{inv.totalAmount}</div>
                      <div>
                        <Trash2
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="text-red-600 cursor-pointer"
                          size={18}
                        />
                      </div>
                    </div>
                  ))
                )}

                {/* PAGINATION */}
                {totalInvoicePages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstInvoice + 1} to{" "}
                      {Math.min(
                        indexOfLastInvoice,
                        filteredInvoices.length
                      )}{" "}
                      of {filteredInvoices.length} invoices
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
                            Math.min(
                              prev + 1,
                              totalInvoicePages
                            )
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
          </>
        )}
      </div>
    </div>
  );
};

export default AllorderInvoice;
