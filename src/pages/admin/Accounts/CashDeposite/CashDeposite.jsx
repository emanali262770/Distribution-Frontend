import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";

const CashDeposite = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can change to 8 or 15
  const [searchQuery, setSearchQuery] = useState("");

  const [vouchers, setVouchers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nextReceiptId, setNextReceiptId] = useState("BR-001");
  const [submitting, setSubmitting] = useState(false);
  const [amountError, setAmountError] = useState(""); // new
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/cash-deposits`;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    receiptId: "",
    customer: "",
    amountReceived: "",
    remarks: "",
  });

  /** ================== Fetch All Vouchers ================== **/
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setVouchers(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch Cash deposite");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  //   fetcx customer
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customers`
      );
      setCustomers(res?.data || []);
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  console.log({ customers });

  /** ================== Generate Next ID ================== **/
  useEffect(() => {
    if (vouchers.length > 0) {
      const maxNo = Math.max(
        ...vouchers.map((v) => {
          const match = v.receiptId?.match(/CASH-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextReceiptId("CASH-" + (maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextReceiptId("CASH-001");
    }
  }, [vouchers]);

  /** ================== Open Add Form ================== **/
  const handleAdd = async () => {
    setIsEditing(false);
    setEditId(null);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      receiptId: nextReceiptId,
      customer: "",
      amountReceived: "",
      remarks: "",
      customerBalance: 0,
    });

    setIsFormOpen(true);
  };

  /** ================== Fetch Banks & Salesmen ================== **/
  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/banks`);
      setBanks(res.data?.data || []);
    } catch {
      setBanks([]);
    }
  };

  const fetchSalesmen = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees`
      );
      setSalesmen(res.data || []);
    } catch {
      setSalesmen([]);
    }
  };

  /** ================== Edit Voucher ================== **/
const handleEdit = (v) => {
  setIsEditing(true);
  setEditId(v._id);
  console.log({v});

  setFormData({
    date: v.date?.split("T")[0],
    receiptId: v.receiptId,
    customer: v.customer?._id || "",
    customerBalance: v.newBalance || 0,   // ✅ FIXED HERE
    amountReceived: v.amountReceived || "",
    remarks: v.remarks || "",
  });

  setIsFormOpen(true);
};



  /** ================== Delete Voucher ================== **/
 const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the receipt voucher.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563EB",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirm.isConfirmed) return;

  try {
    const headers = { Authorization: `Bearer ${userInfo?.token}` };

    await axios.delete(`${API_URL}/${id}`, { headers });

    toast.success("Voucher deleted");
    fetchVouchers(); // refresh list
  } catch (err) {
    console.log("Delete Error:", err);

    toast.error(
      err?.response?.data?.message ||
      "Failed to delete voucher"
    );
  }
};


  /** ================== Submit Form ================== **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Build correct payload EXACTLY like Postman
    const payload = {
      receiptId: formData.receiptId || nextReceiptId,
      date: formData.date,
      customer: formData.customer,
      amountReceived: Number(formData.amountReceived),
      remarks: formData.remarks,
    };
    // console.log({payload});
    

    try {
      const headers = {
        Authorization: `Bearer ${userInfo?.token}`,
        "Content-Type": "application/json",
      };

      if (isEditing && editId) {
        await axios.put(`${API_URL}/${editId}`, payload, { headers });
        toast.success("Receipt updated successfully");
      } else {
        await axios.post(API_URL, payload, { headers });
        toast.success("Receipt created successfully");
      }

      fetchVouchers();
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save voucher");
    } finally {
      setSubmitting(false);
    }
  };

  /** ================== UI ================== **/
  const filteredVouchers = vouchers.filter((v) => {
    const search = searchQuery.toLowerCase();
    return (
      v.receiptId?.toLowerCase().includes(search) ||
      v.customer?.customerName?.toLowerCase().includes(search) ||
      v.bank?.bankName?.toLowerCase().includes(search) ||
      v.amountReceived?.toString().includes(search)
    );
  });

  // 🔹 Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredVouchers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredVouchers.length / recordsPerPage);

  // Reset to first page when vouchers change (after add/edit/delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [vouchers]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="flex justify-between mb-6 px-6">
        <h1 className="text-2xl font-bold text-newPrimary">Cash Deposite</h1>
        <div className="flex items-center gap-3">
          {/* 🔍 Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Cash Deposite..."
            className="px-4 py-2 border rounded-lg w-60 focus:ring-2 focus:ring-newPrimary/50 focus:border-newPrimary outline-none"
          />

          {/* ➕ Add Button */}
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
            onClick={handleAdd}
          >
            + Add Cash Deposite
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-xl shadow bg-white mx-6 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : currentRecords.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No Cash Deposite found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Receipt ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Amount Received</th>
                  <th className="px-4 py-3 text-left">New Balance</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Remarks</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.map((v, i) => (
                  <tr key={v._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{indexOfFirstRecord + i + 1}</td>

                    <td className="px-4 py-3">{v.receiptId}</td>

                    <td className="px-4 py-3">
                      {v.customer?.customerName || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {v.customer?.phoneNumber || "-"}
                    </td>

                    <td className="px-4 py-3"> {v.amountReceived ?? "-"}</td>

                    <td className="px-4 py-3"> {v.newBalance ?? "-"}</td>

                    <td className="px-4 py-3">{v.date || "-"}</td>

                    <td className="px-4 py-3">{v.remarks || "-"}</td>

                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="text-blue-600"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-2 px-6 bg-white  mt-2 rounded-b-xl">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, vouchers.length)} of{" "}
                  {vouchers.length} records
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-700/40 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="bg-white rounded-2xl shadow-2xl w-full md:w-[700px] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-bold text-newPrimary">
                {isEditing ? "Update Cash Deposite" : "Add Cash Deposite"}
              </h2>
              <button
                className="text-2xl text-gray-500"
                onClick={() => setIsFormOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full border rounded-md p-3"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Cash ID</label>
                  <input
                    type="text"
                    value={formData.receiptId || nextReceiptId}
                    readOnly
                    className="w-full border rounded-md p-3 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Customers</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => {
                      const selected = customers.find(
                        (c) => c._id === e.target.value
                      );
                      setFormData({
                        ...formData,
                        customer: selected?._id,
                        customerBalance: selected?.salesBalance || 0,
                      });
                    }}
                    className="w-full border rounded-md p-3"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Customer Balance
                  </label>
                  <input
                    type="text"
                    value={formData.customerBalance || 0}
                    readOnly
                    className="w-full border rounded-md p-3 bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Amount Received <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amountReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (Number(value) > formData.salesmanBalance) {
                      setAmountError("Amount cannot exceed receivable balance");
                    } else {
                      setAmountError(""); // clear error
                    }
                    setFormData({ ...formData, amountReceived: value });
                  }}
                  required
                  className="w-full border rounded-md p-3"
                  placeholder="Enter amount"
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-1">{amountError}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows="3"
                  className="w-full border rounded-md p-3"
                  placeholder="Enter remarks"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-newPrimary text-white py-3 rounded-lg hover:bg-newPrimary/80 flex items-center justify-center gap-2"
                disabled={submitting} // optional: disable button while submitting
              >
                {submitting ? (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isEditing ? (
                  "Update Cash Deposite"
                ) : (
                  "Save Cash Deposite"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashDeposite;
