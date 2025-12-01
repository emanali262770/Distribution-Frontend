import React, { useState, useEffect } from "react";
import { Loader, SquarePen } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ScaleLoader } from "react-spinners";
import { api } from "../../../../context/ApiService";

const Recovery = () => {
  const today = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(today);
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [showCustomerError, setShowCustomerError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customersList, setCustomersList] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [salesmanLodaing, setSalesmanLodaing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  // Form fields for edit modal
  const [discountAmount, setDiscountAmount] = useState("");
  const [PreviousBalance, setPreviousBalance] = useState(6000);
  const [receivable, setReceivable] = useState("");
  const [received, setReceived] = useState("");
  const [balance, setBalance] = useState("");

  // salesmanList
  const fetchcustomersList = async () => {
    try {
      setSalesmanLodaing(true);
      const response = await api.get(`/customers/isPending`);

      setCustomersList(response.customers);
    } catch (error) {
      console.error(" Failed to fetch customers by fetchcustomersList:", error);
    } finally {
      setTimeout(() => setSalesmanLodaing(false), 2000);
    }
  };
  useEffect(() => {
    fetchcustomersList();
  }, []);

  // 🔹 Fetch Recovery Data when salesman changes
  const fetchRecoveryData = async (id) => {
    if (!selectedCustomer) {
      setShowCustomerError(true);
      return;
    }
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(
        `/sales-invoice/recovery/${id}?date=${selectedDate}`
      );
      // console.log("✅ Recovery Data:", res);
      if (res.success) {
        setData(res.data || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch recovery data:", error);
      setTimeout(() => {
        toast.error("Failed to load recovery records");
      }, 2000);

      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };
  // 🔹 Re-fetch Recovery Data when date changes (if salesman already selected)
  useEffect(() => {
    if (selectedCustomer) {
      fetchRecoveryData(selectedCustomer);
    }
  }, [selectedDate]);

  // 🔹 Fetch Recovery Data by Invoice No for specific salesman
  const fetchRecoveryByInvoice = async (selectedCustomer, invoiceNo) => {
    if (!selectedCustomer || !invoiceNo) return;

    try {
      setLoading(true);
      const res = await api.get(
        `/sales-invoice/recovery/${selectedCustomer}/${invoiceNo}`
      );

      // console.log("✅ Recovery Data by Invoice:", res);

      if (res.success) {
        setData(res.data || []);
        setCurrentPage(1);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch recovery by invoice:", error);
      setTimeout(() => {
        toast.error("Failed to load recovery details for this invoice");
      }, 2000);

      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  // 🔹 Fetch Invoice List by Salesman and Date
  const fetchInvoicesByDate = async (selectedCustomer, date) => {
    if (!selectedCustomer) {
      setShowCustomerError(true);
      return;
    }
    if (!date) return;

    try {
      setSalesmanLodaing(true);
      const res = await api.get(
        `/sales-invoice/invoice-no?salesmanId=${selectedCustomer}&date=${date}`
      );
      // console.log("✅ Invoices by Date:", res);

      if (res.success) {
        setInvoiceList(res.data || []);
      } else {
        setInvoiceList([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch invoices by date:", error);
      toast.error("Failed to load invoices for selected date");
      setInvoiceList([]);
    } finally {
      setTimeout(() => setSalesmanLodaing(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedCustomer) {
      // 🔸 Update Invoice dropdown when date changes
      fetchInvoicesByDate(selectedCustomer, selectedDate);

      // 🔸 Also refresh table data
      fetchRecoveryData(selectedCustomer);
    }
  }, [selectedDate]);

  const handleSalesmanChange = async (e) => {
    const id = e.target.value;
    setSelectedSalesman(id);
    setSelectedOrders(""); // reset invoice select

    if (!id) {
      setInvoiceList([]);
      return;
    }

    try {
      setSalesmanLodaing(true);
      const res = await api.get(`/sales-invoice/invoice-no?salesmanId=${id}`);
      if (res.success) {
        setInvoiceList(res.data || []);
      } else {
        setInvoiceList([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch invoices:", error);
      toast.error("Failed to load invoice list");
      setInvoiceList([]);
    } finally {
      setTimeout(() => setSalesmanLodaing(false), 2000);
    }

    // ✅ Fetch Recovery data for that salesman & date
    fetchRecoveryData(id);
  };

  // ✅ Fetch Recovery Data whenever customer changes
  useEffect(() => {
    if (selectedCustomer) {
      fetchRecoveryData(selectedCustomer);
      fetchInvoicesByDate(selectedCustomer, selectedDate);
    } else {
      setData([]);
      setInvoiceList([]);
    }
  }, [selectedCustomer]);

  const handleEdit = (invoice) => {
    // console.log("Editing Invoice:", invoice);

    setEditingInvoice(invoice);

    setDiscountAmount("");
    // receivable now means remaining balance
    setReceivable(invoice.receivable || invoice.totalPrice || 0);
    setReceived(""); // user will type new recovery amount
    setBalance(invoice.receivable || 0); // initially same as remaining due

    setPreviousBalance(invoice.balance || 0);
    setSelectedDate(
      invoice.recoveryDate
        ? invoice.recoveryDate.split("T")[0]
        : invoice.invoiceDate
        ? invoice.invoiceDate.split("T")[0]
        : today
    );

    setIsSliderOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    const headers = {
      headers: {
        Authorization: `Bearer ${userInfo?.token}`,
      },
    };
    if (!editingInvoice?._id && !editingInvoice?.invoiceId) {
      toast.error("Invalid invoice ID");
      return;
    }

    try {
      setIsSaving(true);

      // 🔹 Prepare payload for API
      const payload = {
        invoiceId: editingInvoice.invoiceId || editingInvoice._id,
        amount: parseFloat(received) || 0,
      };

      // console.log("📤 Sending Recovery Data:", payload);

      // 🔹 Call API
      const res = await api.post(`/recovery`, payload, headers);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Recovery Added!",
          text: "Recovery has been added successfully.",
          confirmButtonColor: "#3085d6",
        });

        // ✅ Optionally refresh data table
        fetchRecoveryData(selectedCustomer);
        setIsSliderOpen(false);
      } else {
        toast.error(res.message || "Failed to add recovery");
      }
    } catch (error) {
      console.error("❌ Recovery submission failed:", error);
      toast.error("Failed to save recovery");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto recalculation logic like in SalesInvoice
  useEffect(() => {
    if (editingInvoice) {
      const remaining = parseFloat(receivable) || 0;
      const entered = parseFloat(received) || 0;
      const newBalance = remaining - entered;
      setBalance(newBalance >= 0 ? newBalance : 0);
    }
  }, [received, receivable, editingInvoice]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
  };

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.customer?.toLowerCase().includes(term) ?? false) ||
      (item.salesman?.toLowerCase().includes(term) ?? false) ||
      (item.invoiceNo?.toLowerCase().includes(term) ?? false)
    );
  });

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // console.log({ currentRecords });
  useEffect(() => {
    if (!selectedCustomer) {
      setShowCustomerError(true);
    }
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {salesmanLodaing ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-newPrimary">
              Recovery List
            </h1>
          </div>

          {/* 🔹 Filter Fields */}
          <div className="flex flex-wrap justify-between items-start gap-8 w-full mt-4">
            {/* Left Side: Date + Customer */}
            <div className="flex flex-col space-y-4">
              {/* Date */}
              <div className="flex items-center gap-6">
                <label className="text-gray-700 font-medium w-24">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                />
              </div>

              {/* Customer */}
              <div className="flex items-center gap-6">
                <label className="text-gray-700 font-medium w-24">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col">
                  <select
                    value={selectedCustomer}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCustomer(val);
                      setShowCustomerError(!val);
                    }}
                    className="w-[250px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Customer</option>
                    {customersList.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.customerName}
                      </option>
                    ))}
                  </select>
                  {showCustomerError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a customer before proceeding.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Search Bar */}
            <div className="flex items-end ml-auto w-full md:w-64 mt-16">
              <input
                type="text"
                placeholder="Search by Customer, Salesman, Invoice..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset to first page
                }}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          {/* 🔹 Table */}
          <div className="p-0 mt-6">
            {selectedCustomer && (
              <div>
                <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
                    <div className="min-w-full custom-scrollbar">
                      <div className="hidden lg:grid whitespace-nowrap grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                        <div>SR</div>
                        <div>Date</div>
                        <div>ID</div>
                        <div>Customer</div>
                        <div>Salesman</div>
                        <div>Total</div>
                        <div>Received</div>
                        <div>Balance</div>
                        <div>Bill Days</div>
                        <div>Due Days</div>
                        <div>Recovery Date</div>
                        <div>Action</div>
                      </div>

                      <div className="flex flex-col divide-y divide-gray-100">
                        {loading ? (
                          <TableSkeleton
                            rows={data.length || 5}
                            cols={12}
                            className="lg:grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                          />
                        ) : data.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 bg-white">
                            No records found.
                          </div>
                        ) : filteredData.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 bg-white">
                            No records found.
                          </div>
                        ) : (
                          currentRecords.map((item, index) => (
                            <div
                              key={item.invoiceId}
                              className="grid lg:grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                            >
                              <div>{indexOfFirstRecord + index + 1}</div>

                              <div>{formatDate(item.invoiceDate) || "-"}</div>
                              <div>{item.invoiceNo || "-"}</div>
                              <div>{item.customer || "-"}</div>
                              <div>{item.salesman || "-"}</div>
                              <div>{item.totalPrice || "-"}</div>
                              <div>{item.received || 0}</div>
                              <div>{item.balance || item.total}</div>
                              <div>{item.billDays ?? "-"}</div>
                              <div>{item.overDays || "-"}</div>
                              <div>{formatDate(item.agingDate)}</div>
                              <div className="flex gap-3 justify-start">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-blue-600 hover:bg-blue-50 rounded p-1 transition-colors"
                                  title="Edit"
                                >
                                  <SquarePen size={18} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl">
                          <p className="text-sm text-gray-600">
                            Showing {indexOfFirstRecord + 1} to{" "}
                            {Math.min(indexOfLastRecord, data.length)} of{" "}
                            {data.length} records
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === 1
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-newPrimary text-white hover:bg-newPrimary/80"
                              }`}
                            >
                              Previous
                            </button>

                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === totalPages
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
              </div>
            )}
          </div>

          {/* 🔹 Edit Form Modal (Full Functional Like SalesInvoice) */}
          {isSliderOpen && editingInvoice && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                {isSaving && (
                  <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b bg-white">
                  <h2 className="text-xl font-bold text-newPrimary">
                    Edit Recovery
                  </h2>
                  <button
                    className="text-2xl text-gray-500 hover:text-gray-700"
                    onClick={() => setIsSliderOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4 p-4 md:p-6">
                  <div className="grid grid-cols-2 items-center gap-x-4 gap-y-1 border p-4 rounded-lg">
                    <div className="flex gap-3">
                      <label className="block text-gray-700 font-medium">
                        Recovery Id :
                      </label>
                      <p>{`${editingInvoice.recoveryNo || "REC-001"}`}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                      <label className="block text-gray-700 font-medium">
                        Recovery Date :
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        disabled
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border h-[30px] border-gray-300 rounded-md p-4 w-[200px] focus:outline-none focus:ring-2 focus:ring-newPrimary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 border p-4 rounded-lg">
                    <div className="flex gap-3">
                      <label className="block text-gray-700 font-medium">
                        Invoice No. :
                      </label>
                      <p>{editingInvoice.invoiceNo}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Invoice Date :
                      </label>
                      <p>{formatDate(editingInvoice.invoiceDate)}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Customer :
                      </label>
                      <p>{editingInvoice.customer}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Salesman :
                      </label>
                      <p>{editingInvoice.salesman}</p>
                    </div>
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Previous Balance :
                      </label>
                      <p>{editingInvoice.balance}</p>
                    </div>
                  </div>

                  {/* Items Table */}
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
                      {editingInvoice?.items.map((item, i) => (
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
                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.rate}
                          </div>
                          <div className="px-4 py-2 border-r border-gray-300 ">
                            {item.qty}
                          </div>
                          <div className="px-4 py-2 ">{item.total}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals + Aging Date + Discounts */}
                  <div className="flex flex-col w-full items-end gap-4 mt-4">
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Total Price :
                      </label>
                      <input
                        type="number"
                        value={editingInvoice.totalPrice || 0}
                        disabled
                        readOnly
                        className="w-[150px] bg-gray-100 cursor-not-allowed h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Receivable :
                      </label>
                      <input
                        type="number"
                        value={receivable}
                        readOnly
                        disabled
                        className="w-[150px] bg-gray-100 cursor-not-allowed h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex gap-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Received :
                      </label>
                      <input
                        type="number"
                        value={received}
                        onChange={(e) => {
                          let val = e.target.value;

                          // 🚫 Restrict value greater than receivable
                          if (parseFloat(val) > parseFloat(receivable)) {
                            toast.error(
                              "Amount cannot be greater than receivable balance"
                            );
                            return; // stop execution
                          }

                          setReceived(val);

                          const remaining = parseFloat(receivable) || 0;
                          const newBalance = remaining - parseFloat(val || 0);
                          setBalance(newBalance >= 0 ? newBalance : 0);
                        }}
                        placeholder="Enter amount"
                        className="w-[150px] h-[40px] p-3 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="flex w-full items-start gap-6">
                      <div className="flex-1">
                        {/* <p className="ml-auto font-bold ">
                          Allow Days : {editingInvoice.allowDays || "-"}
                        </p> */}
                        <p className="ml-auto font-bold ">
                          Over Days : {editingInvoice.overDays ?? "-"}
                        </p>

                        <div className="flex  gap-3 mt-2">
                          <label className="block text-gray-700 font-medium">
                            Aging Date
                          </label>
                          <input
                            type="date"
                            value={
                              editingInvoice.agingDate
                                ? editingInvoice.agingDate.split("T")[0]
                                : ""
                            }
                            disabled
                            readOnly
                            className="w-[150px] bg-gray-100 cursor-not-allowed h-[40px] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                          />
                        </div>
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
                          className="w-[150px] cursor-not-allowed bg-gray-100 h-[40px] p-3 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {(editingInvoice.status === "Completed" || balance <= 0) && (
                    <p className="text-green-600 font-semibold text-center mb-2">
                      ✅ This invoice has been fully recovered.
                    </p>
                  )}
                  {/* ✅ Disable when invoice is completed or balance is 0 */}
                  <button
                    type="submit"
                    className={`w-full px-4 py-3 rounded-lg transition-colors 
                         bg-newPrimary text-white hover:bg-newPrimary/80
                        }`}
                  >
                    Update Recovery
                  </button>
                </form>
              </div>
            </div>
          )}
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
  );
};

export default Recovery;
