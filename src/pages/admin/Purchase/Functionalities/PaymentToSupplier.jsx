import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";

const PaymentToSupplier = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dcNo, setDcNo] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);

  const [date, setDate] = useState("");
  const [product, setProduct] = useState("");
  const [rate, setRate] = useState("");
  const [inStock, setInStock] = useState("");
  const [specification, setSpecification] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [qty, setQty] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingVoucher, setEditingVoucher] = useState(null); // Fixed: was editingReceipt
  const [cashData, setCashData] = useState({
    receiptId: "",
    date: "",
    customer: "", // store customer _id (not name)
    amountReceived: 0,
    newBalance: 0,
    remarks: "",
  });
  const [nextReceiptId, setNextReceiptId] = useState("001");
  const [customersCash, setCustomersCash] = useState([]);



  const today = new Date().toISOString().split("T")[0];
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState(today);
  const [orderDetails, setOrderDetails] = useState({
    customer: "",
    person: "",
    phone: "",
    address: "",
    orderType: "",
    mode: "",
    deliveryAddress: "",
    deliveryDate: "",
    totalWeight: "",
  });

  const [remarks, setRemarks] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [status, setStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChallan, setEditingChallan] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("orderDetails");
  const [currentPage, setCurrentPage] = useState(1);
  const [supplierDeposits, setSupplierDeposits] = useState([]);

  const recordsPerPage = 10;
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};


  // seraching
  const filteredDeposits = supplierDeposits.filter((deposit) => {
    const term = searchTerm.toLowerCase();
    return (
      deposit.receiptId?.toLowerCase().includes(term) ||
      deposit.supplier?.supplierName?.toLowerCase().includes(term) ||
      deposit.date?.toLowerCase().includes(term) ||
      deposit.remarks?.toLowerCase().includes(term)
    );
  });

  // move to first page wqhen sercahing
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (!editingVoucher && supplierDeposits.length > 0) {
      const maxNo = Math.max(
        ...supplierDeposits.map((v) => {
          const match = v.receiptId?.match(/SCD-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReceiptId((maxNo + 1).toString().padStart(3, "0"));
    } else if (!editingVoucher && supplierDeposits.length === 0) {
      setNextReceiptId("001");
    }
  }, [supplierDeposits, editingVoucher, isSliderOpen]);

  // Simulate fetching delivery challans
  const headers = {
    Authorization: `Bearer ${userInfo?.token}`,
  };


  // 🟢 Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL
        }/suppliers`
      );
      // console.log("Res ", response.data);

      setCustomersCash(response.data);

    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchSuppliers();
  }, []);


  // Reset form fields
  const resetForm = () => {
    setDcNo("");
    setDate("");
    setOrderNo("");
    setOrderDate("");
    setOrderDetails({
      customer: "",
      person: "",
      phone: "",
      address: "",
      orderType: "",
      mode: "",
      deliveryAddress: "",
      deliveryDate: "",
      totalWeight: "",
    });

    setRemarks("");
    setApprovalRemarks("");
    setStatus("Pending");
    setEditingChallan(null);
    setErrors({});
    setItemsList([]);
    setActiveTab("orderDetails");
    setIsSliderOpen(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // 🧾 Required fields
    if (!cashData.date) newErrors.date = "Date is required.";
    if (!cashData.supplier) newErrors.supplier = "Supplier name is required.";
    if (!cashData.amountReceived || Number(cashData.amountReceived) <= 0)
      newErrors.amountReceived = "Amount received must be greater than zero.";

    // Remarks optional — but you can enforce minimum length if needed
    // if (cashData.remarks.trim().length < 3) newErrors.remarks = "Remarks too short.";

    setErrors(newErrors);

    // ✅ Return true if no errors
    return Object.keys(newErrors).length === 0;
  };


  // Handlers for form and table actions
  const handleAddChallan = () => {
    resetForm();
    setEditingVoucher(null);
    setIsSliderOpen(true);
    const today = new Date().toLocaleDateString("en-CA")
    setCashData({
      receiptId: `SCD-${nextReceiptId}`,
      date: today,
      supplier: "",
      balance: 0,
      amountReceived: 0,
      newBalance: 0,
      remarks: "",
    });


  };




  // 🟢 Fetch Supplier Cash Deposits
  const fetchSupplierDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/supplier-cash-deposit`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSupplierDeposits(response.data.data);
      } else {
        setSupplierDeposits([]);
      }
    } catch (error) {
      console.error("Failed to fetch supplier deposits:", error);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);


  useEffect(() => {
    fetchSupplierDeposits();
  }, []);


  const handleEditClick = (voucher) => {
    // console.log(voucher);

    setEditingVoucher(voucher);

    // 🔹 Convert "08-Nov-2025" → "2025-11-08"
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      if (dateStr.includes("T")) return dateStr.split("T")[0];
      const [day, mon, year] = dateStr.split("-");
      const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      return `${year}-${months[mon]}-${day.padStart(2, "0")}`;
    };

    setCashData({
      receiptId: voucher.receiptId || "",
      date: formatDate(voucher.date),
      supplier: voucher.supplier?._id || "",
      balance: voucher.newBalance || 0,
      amountReceived:  0,
      newBalance: voucher.newBalance || 0,
      remarks: voucher.remarks || "",
    });

    setIsSliderOpen(true);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true)
    try {
      if (!validateForm()) {
        return Swal.fire("Error", "Please fill all required fields correctly.", "error");
      }

      // ✅ Build payload exactly as your backend expects
      const payload = {
        receiptId: editingVoucher
          ? editingVoucher.receiptId
          : `SCD-${nextReceiptId}`,
        date: cashData.date,
        supplier: cashData.supplier,
        amountReceived: Number(cashData.amountReceived),
        remarks: cashData.remarks || "",
      };

      // console.log("Submitting payload:", payload);

      const token = userInfo?.token;

      if (editingVoucher) {
        // 🟡 UPDATE
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/supplier-cash-deposit/${editingVoucher._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        Swal.fire("Updated!", "Supplier payment updated successfully.", "success");
      } else {
        // 🟢 CREATE
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/supplier-cash-deposit`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        Swal.fire("Added!", "Supplier payment added successfully.", "success");
      }

      // ✅ Refresh supplier data after saving
      fetchSuppliers();
      fetchSupplierDeposits()
      resetForm();
    } catch (error) {
      console.error("Error submitting supplier payment:", error);
     toast.error(error.response.data.message)
    } finally {
      setIsSaving(false)
    }
  };


  const handleDelete = (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            setLoading(true);
            await api.delete(`/supplier-cash-deposit/${id}`, { headers });
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Supplier Cash Deposit deleted successfully.",
              "success"
            );
            fetchSupplierDeposits()
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete Supplier Cash Deposit.",
              "error"
            );
          } finally {
            setLoading(false);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Supplier Cash Deposit is safe 🙂",
            "error"
          );
        }
      });
  };

  // Pagination logic
  // ✅ Pagination logic based on filtered deposits
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDeposits.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredDeposits.length / recordsPerPage);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // 🟢 Handle Product Selection

  // console.log({ supplierDeposits });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Supplier Payment Details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by Receipt ID or Supplier Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddChallan}
            >
              + Add Payment
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
          <div className="bg-newPrimary text-white py-2 px-4 font-semibold">
            Supplier Payment Records
          </div>

          <div className="overflow-y-auto lg:overflow-x-auto max-h-[700px]">
            <div className="min-w-[1000px]">
              {/* Header Row */}
              <div className="hidden lg:grid grid-cols-[0.3fr_1fr_1fr_1fr_1fr_1fr_2fr_0.5fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Receipt ID</div>
                <div>Date</div>
                <div>Supplier</div>
                <div>Amount Paid</div>
                <div>New Balance</div>
                <div>Remarks</div>
                <div>Action</div>
              </div>

              {/* Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton rows={5} cols={8} />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-white">
                    No supplier deposits found.
                  </div>
                ) : (
                  currentRecords.map((deposit, index) => (
                    <div
                      key={deposit._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.3fr_1fr_1fr_1fr_1fr_1fr_2fr_0.5fr] items-center gap-4 px-6 py-3 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{index + 1}</div>
                      <div>{deposit.receiptId}</div>
                      <div>{deposit.date}</div>
                      <div>{deposit.supplier?.supplierName || "-"}</div>
                      <div>{deposit.amountReceived?.toLocaleString()}</div>
                      <div>{deposit.newBalance?.toLocaleString()}</div>
                      <div className="truncate max-w-[250px]">{deposit.remarks || "-"}</div>
                      <div className="flex gap-3 justify-start">
                        <button
                          onClick={() => handleEditClick(deposit)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(deposit._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, filteredDeposits.length)} of{" "}
                    {filteredDeposits.length} records
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-newPrimary text-white hover:bg-newPrimary/80"
                        }`}
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
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


        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className=" relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {isSaving && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                  <ScaleLoader color="#1E93AB" size={60} />
                </div>
              )}
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingVoucher
                    ? "Update Supplier Payment"
                    : "Add Supplier Payment"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                {/* Cash Form */}

                <div className="space-y-4">
                  {/* Date & Receipt ID */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={cashData.date}
                        onChange={(e) =>
                          setCashData({ ...cashData, date: e.target.value })
                        }
                        disabled
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Receipt ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          editingVoucher
                            ? editingVoucher.receiptId
                            : `REC-${nextReceiptId}`
                        }
                        disabled
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Customer & Balance */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Supplier Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={cashData.supplier}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedSupplier = customersCash.find((s) => s._id === selectedId);

                          setCashData({
                            ...cashData,
                            supplier: selectedSupplier?._id || "",
                            balance: selectedSupplier?.payableBalance || 0, // ✅ supplier balance
                            newBalance: selectedSupplier?.payableBalance || 0,
                            amountReceived: 0,
                          });
                        }}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Supplier</option>
                        {Array.isArray(customersCash) && customersCash.length > 0 ? (
                          customersCash.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.supplierName}
                            </option>
                          ))
                        ) : (
                          <option disabled>No suppliers found</option>
                        )}

                      </select>

                    </div>

                    {/* Balance field */}
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Balance
                      </label>
                      <input
                        type="number"
                        value={cashData.balance}
                        readOnly
                        className="w-full p-3 border rounded-md bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Amount Received & New Balance */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        Amount Paid <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={cashData.amountReceived}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const newBalance = (cashData.balance || 0) - amount;
                          setCashData({
                            ...cashData,
                            amountReceived: amount,
                            newBalance: newBalance < 0 ? 0 : newBalance, // never negative
                          });
                        }}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />

                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 font-medium mb-2">
                        New Balance
                      </label>
                      <input
                        type="text"
                        value={cashData.newBalance.toFixed(2)}
                        readOnly
                        className={`w-full p-3 border rounded-md ${cashData.newBalance < 0
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100"
                          }`}
                      />

                    </div>
                  </div>
                  {/* Remarks Field */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={cashData.remarks}
                      onChange={(e) =>
                        setCashData({
                          ...cashData,
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Enter any remarks or notes"
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                >
                 {editingVoucher ? "Update Payment" : "Save Payment"} 
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
    </div>
  );
};

export default PaymentToSupplier;
