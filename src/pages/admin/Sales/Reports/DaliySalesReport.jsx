import React, { useState, useEffect, useCallback } from "react";
import { Loader, Printer, SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import axios from "axios";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";
import ViewModal from "../../../../helper/ViewModel";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";
import { handleDailySalesPrint } from "../../../../helper/SalesPrintView";
import { set } from "date-fns";

const DailySalesReport = () => {
  const [isView, setIsView] = useState(false);
  const [mode, setMode] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSalesmanError, setShowSalesmanError] = useState(false);
// Pagination states (3 different tables)
const [salesPage, setSalesPage] = useState(1);
const [paymentPage, setPaymentPage] = useState(1);
const [recoveryPage, setRecoveryPage] = useState(1);

const recordsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [salesman, setSalesman] = useState([]);
  const [salesmanList, setSalesmanList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
 
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [selectedOrders, setSelectedOrders] = useState("");
  const [PendingOrdersList, setPeningOrdersList] = useState([]);
  const today = new Date().toLocaleDateString("en-CA");

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");
  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [dueAmount, setDueAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [enterAmount, setEnterAmount] = useState("");
  const [newBalance, setNewBalance] = useState(0);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerId, setCustomerID] = useState("");

  const staticInvoices = [
    { _id: "INV-001", customerId: "1", dueAmount: 30000 },
    { _id: "INV-002", customerId: "1", dueAmount: 15000 },
    { _id: "INV-003", customerId: "2", dueAmount: 44000 },
    { _id: "INV-004", customerId: "2", dueAmount: 25000 },
    { _id: "INV-005", customerId: "3", dueAmount: -20000 },
    { _id: "INV-006", customerId: "4", dueAmount: 37000 },
    { _id: "INV-007", customerId: "5", dueAmount: 156000 },
  ];

  // Handle individual checkbox change
  const handleInvoiceCheckboxChange = (invoiceId, isChecked) => {
    if (isChecked) {
      setSelectedInvoices((prev) => [...prev, invoiceId]);
    } else {
      setSelectedInvoices((prev) => prev.filter((id) => id !== invoiceId));
    }
  };

  // Select all/deselect all functionality
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allInvoiceIds = filteredInvoices.map((inv) => inv.orderId);
      setSelectedInvoices(allInvoiceIds);
    } else {
      setSelectedInvoices([]);
    }
  };

  // Remove individual invoice from selection
  const removeInvoice = (invoiceId) => {
    setSelectedInvoices((prev) => prev.filter((id) => id !== invoiceId));
  };

  // Clear all selected invoices
  const clearAllInvoices = () => {
    setSelectedInvoices([]);
  };

  // Calculate totals whenever selectedInvoices changes
  useEffect(() => {
    const totalDue = selectedInvoices.reduce((sum, invoiceId) => {
      const invoice = filteredInvoices.find((inv) => inv.orderId === invoiceId);
      return sum + (invoice ? invoice.totalAmount : 0);
    }, 0);

    setDueAmount(totalDue);
  }, [selectedInvoices]);

 
  // ✅ Fetch Orders for Selected Pending Customer
  const fetchOrdersByCustomer = async (customerId) => {
    try {
      setLoading(true);
      const response = await api.get(`/order-taker/pending/${customerId}`);
      setFilteredInvoices(response.data || []); // populate invoice list dynamically
    } catch (error) {
      console.error(" Failed to fetch orders by pending customer:", error);
      toast.error("Failed to load pending orders");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  useEffect(() => {
    if (customersList.length === 1) {
      setSelectedCustomer(customersList[0]._id);
    }
  }, [customersList]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchOrdersByCustomer(selectedCustomer);
    } else {
      setFilteredInvoices([]);
    }
  }, [selectedCustomer]);

  // ✅ Update balance when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const foundCustomer = customersList.find(
        (c) => c._id === selectedCustomer
      );
      setCustomerID(foundCustomer._id);
      setBalance(foundCustomer?.salesBalance);
    } else {
      setBalance(0);
    }
  }, [selectedCustomer, customersList]);

  // console.log("==== setCustomerID ===", customerId);

  // Fetching Salesman List
  const fetchSalesman = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/employees/salesman");
      setSalesman(response.employees || []);
    } catch (error) {
      console.error("Failed to fetch salesman list", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchSalesman();
  }, [fetchSalesman]);

  // Fetch Pening Orders List
  const fetchPendingOrdersList = useCallback(async () => {
    if (!selectedSalesman || !dateFrom) return;

    try {
      setLoading(true);
      const response = await api.get(
        `/sales-invoice/invoice-no?salesmanId=${selectedSalesman}&date=${dateFrom}`
      );

      const invoices = response?.data || [];
      setPeningOrdersList(invoices);
    } catch (error) {
      console.error("❌ Failed to fetch pending orders:", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, [selectedSalesman, dateFrom]);

  useEffect(() => {
    fetchPendingOrdersList();
  }, [fetchPendingOrdersList]);

  // console.log({ PendingOrdersList });

  // ✅ Fetch Pending Orders Data (Sales Items, Payment Received, Recoveries)
  const fetchPendingOrderData = useCallback(async () => {
    if (!selectedSalesman) return;
    try {
      setLoading(true);
      const response = await api.get(
        `/sales-invoice/daily-report/${selectedSalesman}`
      );
      setSalesmanList({
        salesItems: response?.salesItems || [],
        paymentReceived: response?.customerPayments || [],
        recoveries: response?.recoveries || [],
      });
    } catch (error) {
      console.error(" Failed to fetch pending order data:", error);
      toast.error("Failed to load pending order data");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, [selectedSalesman]);

  useEffect(() => {
    if (selectedSalesman) {
      fetchPendingOrderData(); // for table data
    }
  }, [selectedSalesman, fetchPendingOrderData]);

//   // ✅ Fetch Table Data Based on Selected Order
//   const fetchOrderBasedData = useCallback(async () => {
//     if (!selectedOrders) return;

//     try {
//       setLoading(true);

//       const response = await api.get(
//         `/sales-invoice/daily-report/${selectedSalesman}/${selectedOrders}?from=${dateFrom}&to=${dateTo}`
//       );

//       setSalesmanList({
//         salesItems: response?.data?.salesItems || [],
//         paymentReceived: response?.data?.customerPayments || [],
//         recoveries: response?.data?.recoveries || [],
//       });

//       setSelectedOrder(response.data);
//     } catch (error) {
//       console.error(" Failed to fetch order-based data:", error);
//       toast.error("Failed to load order data");
//     } finally {
//       setTimeout(() => setLoading(false), 2000);
//     }
//   }, [selectedOrders, dateFrom, dateTo]);

// useEffect(() => {
//   if (selectedOrders && dateFrom && dateTo) {
//     fetchOrderBasedData();
//   }
// }, [selectedOrders, dateFrom, dateTo, fetchOrderBasedData]);


  useEffect(() => {
    if (selectedSalesman && dateFrom) {
      const fetchPendingOrdersWithDate = async () => {
        try {
          setLoading(true);
          const response = await api.get(
            `/sales-invoice/daily-report/${selectedSalesman}?from=${dateFrom}&to=${dateTo}`
          );
          setSalesmanList({
            salesItems: response.salesItems || [],
            paymentReceived: response.customerPayments || [],
            recoveries: response.recoveries || [],
          });
        } catch (error) {
          console.error(
            " Failed to fetch all pending orders with date:",
            error
          );
        } finally {
          setTimeout(() => setLoading(false), 2000);
        }
      };
      fetchPendingOrdersWithDate();
    }
  }, [selectedSalesman, dateFrom,dateTo]);

  // Reset invoices when customer changes
  useEffect(() => {
    setSelectedInvoices([]);
    setDueAmount(0);
    setEnterAmount("");
    setNewBalance(0);
  }, [selectedCustomer]);

  useEffect(() => {
    const amount = parseFloat(enterAmount) || 0;
    if (paymentType === "Cash") {
      setNewBalance(balance - amount);
    } else if (paymentType === "Recovery") {
      setNewBalance(balance - amount);
    }
  }, [enterAmount, balance, paymentType]);

  const handleSaveReceivable = async (e) => {
    e.preventDefault();

    // 🧩 Validation
    if (!customerId || !paymentType || !enterAmount) {
      toast.error(" Please fill all required fields before saving.");
      return;
    }

    const payload = {
      invoiceNo: selectedInvoices[0] || "",
      customerId,
      mode: paymentType,
      amount: enterAmount,
    };

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    const headers = {
      headers: {
        Authorization: `Bearer ${userInfo?.token}`,
      },
    };

    try {
      setIsSaving(true); // start loader

      // 🧠 API Call
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/order-taker/receivables/add`,
        payload,
        headers
      );

      // ✅ Success
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Receivable added successfully.",
        confirmButtonColor: "#3085d6",
      });

      toast.success("💰 Receivable saved successfully!");

      // Optionally reset fields
      setEnterAmount("");
      setPaymentType("");
      resetForm();
    } catch (error) {
      console.error("❌ Error saving receivable:", error);
      const message =
        error.response?.data?.message ||
        "Something went wrong while saving the receivable.";
      toast.error(message);
    } finally {
      setIsSaving(false); // stop loader
    }
  };

  const resetForm = () => {
    setIsSliderOpen(false);
    setSelectedCustomer("");
    setSelectedInvoices([]);
    setDueAmount(0);
    setBalance(0);
    setEnterAmount("");
    setNewBalance(0);
    setPaymentType("Cash");
  };

const filteredSalesItems =
  (salesmanList?.salesItems || []).filter((item) => {
    return (
      item.invoiceNo?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rate?.toString().includes(searchTerm) ||
      item.qty?.toString().includes(searchTerm) ||
      item.total?.toString().includes(searchTerm)
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

const currentSalesItems = (filteredSalesItems || []).slice(
  indexOfFirstRecord,
  indexOfLastRecord
);

  const currentPaymentReceived =
    salesmanList?.paymentReceived?.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    ) || [];
  const currentRecoveries =
    salesmanList?.recoveries?.slice(indexOfFirstRecord, indexOfLastRecord) ||
    [];



  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSalesman]);

  const allSelected =
    selectedCustomer &&
    filteredInvoices.length > 0 &&
    selectedInvoices.length === filteredInvoices.length;
  // console.log({ salesmanList });
  useEffect(() => {
    if (!selectedSalesman) {
      setShowSalesmanError(true);
    }
  }, []);

  // Search
  
// console.log(currentRecoveries);


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
              Daily Sales Report
            </h1>
            <div className="flex items-center gap-4">
              {selectedSalesman &&
                (salesmanList?.salesItems?.length > 0 ||
                  salesmanList?.paymentReceived?.length > 0 ||
                  salesmanList?.recoveries?.length > 0) && (
                  <button
                    onClick={() =>
                      handleDailySalesPrint(
                        salesmanList,
                        salesman.find((s) => s._id === selectedSalesman)
                          ?.employeeName
                      )
                    }
                    className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
                  >
                    <Printer size={18} />
                  </button>
                )}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-10 w-full mt-4">
            {/* ===== Left Section ===== */}
            <div className="flex flex-col space-y-2">
              {/* Date Field */}
              {/* Date From */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6">
                  <label className="text-gray-700 font-medium w-24">
                    Date From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={today}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      // disable old logic
                    }}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>

                {/* Date To */}
                <div className="flex items-center gap-6 mt-2">
                  <label className="text-gray-700 font-medium w-24">
                    Date To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    max={today}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      // disable old logic
                    }}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>
              </div>

              {/* Salesman Field */}
              <div className="flex items-start gap-6">
                <label className="text-gray-700 font-medium w-24 mt-2">
                  Sales Officer 
                </label>

                <div className="flex flex-col">
                  <select
                    value={selectedSalesman}
                    onChange={(e) => {
                      setSelectedSalesman(e.target.value);
                      setShowSalesmanError(false);
                    }}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Sales Officer</option>
                    {salesman?.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.employeeName}
                      </option>
                    ))}
                  </select>

                  {showSalesmanError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a sales Officer before proceeding.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Right Section ===== */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-end mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                />
              </div>
            </div>
          </div>

          <div className="p-0 mt-6">
            {(selectedSalesman || selectedOrders) && (
              <div>
                {/* Sales Items Table */}
                <h1 className="text-xl font-bold py-2">Sales Items</h1>
                <div className="rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
                  <div className="overflow-y-auto lg:overflow-x-auto max-h-[300px]">
                    <div className="min-w-full custom-scrollbar">
                      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                        <div>Invoice No</div>
                        <div>Items</div>
                        <div>Rate</div>
                        <div>Qty</div>
                        <div>Total</div>
                      </div>
                      <div className="flex flex-col divide-y divide-gray-100">
                        {loading ? (
                          <TableSkeleton
                            rows={currentSalesItems.length || 5}
                            cols={5}
                            className="lg:grid-cols-[1fr_1fr_1fr_1fr_1fr]"
                          />
                        ) : currentSalesItems.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 bg-white">
                            No records found.
                          </div>
                        ) : (
                          <>
                            {currentSalesItems.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                              >
                                <div>{item.invoiceNo || "-"}</div>
                                <div>{item?.itemName || "-"}</div>
                                <div>{item?.rate || "-"}</div>
                                <div>{item?.qty || "-"}</div>
                                <div>{item?.total || "-"}</div>
                              </div>
                            ))}
                            {/* Total Row with Colors */}
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
                              <div></div>
                              <div></div>
                              <div></div>
                              <div></div>
                              <div className="text-blue-800">
                                Total:{" "}
                                {currentSalesItems
                                  .reduce((sum, item) => sum + item.total, 0)
                                  .toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Received Table */}
                <div className="">
                  <h1 className="text-xl font-bold py-2">Payment Received</h1>
                  <div className="rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
                    <div className="overflow-y-auto lg:overflow-x-auto max-h-[300px]">
                      <div className="min-w-full custom-scrollbar">
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                          <div>Customer</div>
                          <div>Total</div>
                          <div>Received</div>
                          <div>Balance</div>
                        </div>
                        <div className="flex flex-col divide-y divide-gray-100">
                          {loading ? (
                            <TableSkeleton
                              rows={currentPaymentReceived.length || 5}
                              cols={4}
                            />
                          ) : currentPaymentReceived.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 bg-white">
                              No records found.
                            </div>
                          ) : (
                            <>
                              {currentPaymentReceived.map((item, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                                >
                                  <div>{item?.customer}</div>
                                  <div>{item?.total}</div>
                                  <div>{item?.received}</div>
                                  <div
                                    className={
                                      item.balance < 0
                                        ? "text-red-600"
                                        : "text-gray-700"
                                    }
                                  >
                                    {item.balance || "-"}
                                  </div>
                                </div>
                              ))}
                              {/* Total Row with Colors */}
                              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                <div></div>
                                <div className="text-blue-600">
                                  Total:{" "}
                                  {currentPaymentReceived
                                    .reduce((sum, item) => sum + item.total, 0)
                                    .toLocaleString()}
                                </div>
                                <div className="text-green-600">
                                  Total Rec:{" "}
                                  {currentPaymentReceived
                                    .reduce(
                                      (sum, item) => sum + item.received,
                                      0
                                    )
                                    .toLocaleString()}
                                </div>
                                <div
                                  className={
                                    currentPaymentReceived.reduce(
                                      (sum, item) => sum + item.balance,
                                      0
                                    ) < 0
                                      ? "text-red-600"
                                      : "text-blue-800"
                                  }
                                >
                                  Total Bal:{" "}
                                  {currentPaymentReceived
                                    .reduce(
                                      (sum, item) => sum + item.balance,
                                      0
                                    )
                                    .toLocaleString()}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Recoveries Table */}
                <div className="">
                  <h1 className="text-xl font-bold py-2">Recovery</h1>
                  <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-y-auto lg:overflow-x-auto max-h-[300px]">
                      <div className="min-w-full custom-scrollbar">
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                          <div>Customer</div>
                          <div>Due Recovery</div>
                          <div>Sales Invoices</div>
                          <div>Recovery</div>
                        </div>
                        <div className="flex flex-col divide-y divide-gray-100">
                          {loading ? (
                            <TableSkeleton
                              rows={currentRecoveries.length || 5}
                              cols={4}
                            />
                          ) : currentRecoveries.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 bg-white">
                              No records found.
                            </div>
                          ) : (
                            <>
                              {currentRecoveries.map((item, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                                >
                                  <div>{item?.customer}</div>
                                  <div>{item?.dueRecovery}</div>
                                  <div>{item?.invoices?.join(", ") || "-"}</div>
                                  <div>{item?.totalRecovery || "-"}</div>
                                </div>
                              ))}
                              {/* Total Row with Colors */}
                              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                <div></div>
                                <div className="text-blue-600">
                                  Total Due:{" "}
                                  {currentRecoveries
                                    .reduce(
                                      (sum, item) => sum + item.dueRecovery,
                                      0
                                    )
                                    .toLocaleString()}
                                </div>
                                <div></div>
                                <div className="text-green-600">
                              Total Rec:{" "}
                              {currentRecoveries
                                .reduce((sum, item) => sum + item.totalRecovery, 0)
                                .toLocaleString() || "-"}
                            </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isView && selectedOrder && (
            <ViewModal
              type="dailySales"
              data={selectedOrder}
              onClose={() => setIsView(false)}
            />
          )}

          {isSliderOpen && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                {loading && (
                  <div className="absolute top-0 left-0 w-full h-full bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-50">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-2xl">
                  <h2 className="text-xl font-bold text-newPrimary">
                    Add Receivable
                  </h2>
                  <button
                    className="text-2xl text-gray-500 hover:text-gray-700"
                    onClick={resetForm}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveReceivable} className="space-y-4 p-6">
                  {/* Payment Type Radio Buttons */}
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Cash"
                        checked={paymentType === "Cash"}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2"
                      />
                      Cash
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Recovery"
                        checked={paymentType === "Recovery"}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2"
                      />
                      Recovery
                    </label>
                  </div>

                  {/* Conditional Fields */}
                  {(paymentType === "Cash" || paymentType === "Recovery") && (
                    <div className="space-y-4">
                      {/* ✅ If multiple customers -> show dropdown */}
                      {customersList.length > 1 ? (
                        <div className="w-[400px]">
                          <label className="block text-gray-700 mb-2">
                            Select Customer
                          </label>
                          <select
                            value={selectedCustomer}
                            onChange={(e) =>
                              setSelectedCustomer(e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Customer</option>
                            {customersList.map((cust) => (
                              <option key={cust._id} value={cust._id}>
                                {cust.customerName}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : customersList.length === 1 ? (
                        // ✅ If only one customer, show directly
                        <div className="w-[400px]">
                          <label className="block text-gray-700 mb-2">
                            Customer
                          </label>
                          <p className="p-3 border border-gray-300 rounded-md bg-gray-50">
                            {customersList[0].customerName}
                          </p>
                        </div>
                      ) : null}

                      {/* Checkbox-based Invoice Selection */}
                      {selectedCustomer && (
                        <div className="w-full border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-gray-700 font-medium mb-2">
                              Select Invoice No. ({selectedInvoices.length}{" "}
                              selected)
                            </label>
                            {filteredInvoices.length > 0 && (
                              <label className="flex items-center text-sm text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={handleSelectAll}
                                  className="mr-2"
                                />
                                Select All
                              </label>
                            )}
                          </div>

                          {filteredInvoices.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No invoices found for this customer.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {filteredInvoices.map((invoice, idx) => (
                                <label
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedInvoices.includes(
                                        invoice.orderId
                                      )}
                                      onChange={(e) =>
                                        handleInvoiceCheckboxChange(
                                          invoice.orderId,
                                          e.target.checked
                                        )
                                      }
                                      className="rounded border-gray-300 text-newPrimary focus:ring-newPrimary"
                                    />
                                    <span className="font-medium">
                                      {invoice.orderId}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-medium ${
                                      invoice.totalAmount < 0
                                        ? "text-red-600"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {invoice.totalAmount.toLocaleString()}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selected Invoices Display */}
                      {selectedInvoices.length > 0 && (
                        <div className="border rounded-md p-3 bg-blue-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              Selected Invoices ({selectedInvoices.length}):
                            </span>
                            <button
                              type="button"
                              onClick={clearAllInvoices}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedInvoices.map((invoiceId) => {
                              const invoice = staticInvoices.find(
                                (inv) => inv._id === invoiceId
                              );
                              return invoice ? (
                                <div
                                  key={invoiceId}
                                  className="flex justify-between items-center bg-white p-2 rounded border"
                                >
                                  <span className="font-medium">
                                    {invoice._id}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`font-medium ${
                                        invoice.dueAmount < 0
                                          ? "text-red-600"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {invoice.dueAmount.toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeInvoice(invoiceId)}
                                      className="text-red-500 hover:text-red-700 text-lg"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className="w-1/3">
                          <label className="block text-gray-700 mb-2">
                            Total Due Amount
                          </label>
                          <input
                            type="number"
                            value={dueAmount}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div className="w-1/3">
                          <label className="block text-gray-700 mb-2">
                            Balance
                          </label>
                          <input
                            type="text"
                            value={balance}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        <div className="w-1/3">
                          <label className="block text-gray-700 mb-2">
                            Enter Amount
                          </label>
                          <input
                            type="number"
                            value={enterAmount}
                            onChange={(e) => setEnterAmount(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            max={dueAmount}
                          />
                        </div>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-gray-700 mb-2">
                          New Balance
                        </label>
                        <input
                          type="number"
                          value={newBalance}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-newPrimary text-white py-3 rounded-lg hover:bg-newPrimary/80 "
                  >
                    {isSaving ? "Saving..." : `Save Receivable `}
                  </button>
                </form>
              </div>
            </div>
          )}

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #edf2f7;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #a0aec0;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #718096;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DailySalesReport;
