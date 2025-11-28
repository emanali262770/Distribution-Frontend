import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import Swal from "sweetalert2";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const PaymentVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nextPaymentId, setNextPaymentId] = useState("BP-001");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const sliderRef = useRef(null);
  const [amountError, setAmountError] = useState(""); // new

  const [submitting, setSubmitting] = useState(false);
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/payment-vouchers`;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    paymentId: "",
    bank: "",
    supplier: "",
    amountPaid: 0,
    remarks: "",
    bankBalance: 0,
    supplierPayable: 0,
  });

  /** ================== FETCH FUNCTIONS ================== **/
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setVouchers(res.data?.data || []);
    } catch {
      toast.error("Failed to load vouchers");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/banks`);
      setBanks(res.data?.data || []);
    } catch {
      setBanks([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSuppliers(res?.data || []);
    } catch {
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchBanks();
    fetchSuppliers();
  }, []);
  // console.log({ suppliers });

  /** ================== AUTO PAYMENT ID ================== **/
  useEffect(() => {
    if (vouchers.length > 0) {
      const maxNo = Math.max(
        ...vouchers.map((v) => {
          const match = v.paymentId?.match(/BP-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextPaymentId("BP-" + (maxNo + 1).toString().padStart(3, "0"));
    } else setNextPaymentId("BP-001");
  }, [vouchers]);

  /** ================== RESET FORM ================== **/
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      paymentId: "",
      bank: "",
      supplier: "",
      amountPaid: 0,
      remarks: "",
      bankBalance: 0,
      supplierPayable: 0,
    });
    setIsEditing(false);
    setEditId(null);
    setIsSliderOpen(false);
  };

  /** ================== ADD ================== **/
  const handleAdd = () => {
    resetForm();
    setIsSliderOpen(true);
    setTimeout(async () => {
      await Promise.all([fetchBanks(), fetchSuppliers()]);
    }, 300);
  };

  /** ================== EDIT ================== **/
  const handleEdit = (v) => {
    setIsEditing(true);
    setEditId(v._id);
    setFormData({
      date: v.date?.split("T")[0],
      paymentId: v.paymentId,
      bank: v.bank?._id || "",
      supplier: v.supplier?._id || "",
      amountPaid: v.amountPaid,
      remarks: v.remarks,
      bankBalance: v.bank?.balance || 0,
      supplierPayable: v.supplier?.payableBalance || 0,
    });
    setIsSliderOpen(true);
    setTimeout(async () => {
      await Promise.all([fetchBanks(), fetchSuppliers()]);
    }, 300);
  };

  /** ================== DELETE ================== **/
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the voucher.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        toast.success("Voucher deleted successfully");
        fetchVouchers();
      } catch {
        toast.error("Failed to delete voucher");
      }
    }
  };

  /** ================== SUBMIT ================== **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bank) {
      toast.error("Please select a bank");
      return;
    }

    if (!formData.supplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (formData.supplierPayable === 0) {
      toast.error("Selected supplier has 0 payable balance");
      return;
    }

    if (Number(formData.amountPaid) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (Number(formData.amountPaid) > formData.supplierPayable) {
      setAmountError("Amount cannot exceed payable balance");
      return;
    }

    if (Number(formData.amountPaid) > formData.bankBalance) {
      toast.error("Amount cannot exceed bank balance");
      return;
    }

    setSubmitting(true); // start spinner
    const payload = {
      date: formData.date,
      paymentId: isEditing ? formData.paymentId : nextPaymentId,
      bank: formData.bank,
      supplier: formData.supplier,
      amountPaid: Number(formData.amountPaid),
      remarks: formData.remarks,
    };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo?.token}`,
        "Content-Type": "application/json",
      };

      if (isEditing && editId) {
        await axios.put(`${API_URL}/${editId}`, payload, { headers });
        toast.success("Payment voucher updated successfully");
      } else {
        await axios.post(API_URL, payload, { headers });
        toast.success("Payment voucher created successfully");
      }

      fetchVouchers();
      setIsSliderOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save voucher");
    } finally {
      setSubmitting(false); // stop spinner
    }
  };

  /** ================== FILTER / PAGINATION ================== **/
  const filteredData = vouchers.filter((v) =>
    v.supplier?.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  useEffect(() => {
    setCurrentPage(1);
  }, [vouchers]);

  // console.log({banks});

  /** ================== UI ================== **/
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="flex justify-between mb-4 px-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Bank Payment Vouchers
          </h1>
          <p className="text-sm text-gray-500">
            Showing {filteredData.length} of {vouchers.length}
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by Supplier Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />
          <button
            onClick={handleAdd}
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          >
            + Add Voucher
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-xl shadow bg-white mx-6 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : currentRecords.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No vouchers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Payment ID</th>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Bank</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((v, i) => (
                  <tr key={v._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{indexOfFirst + i + 1}</td>
                    <td className="px-4 py-3">{v?.paymentId || "-"}</td>
                    <td className="px-4 py-3">
                      {v?.supplier?.supplierName || "-"}
                    </td>
                    <td className="px-4 py-3">{v?.bank?.bankName || "-"}</td>
                    <td className="px-4 py-3">Rs. {v?.amountPaid || "-"}</td>
                    <td className="px-4 py-3">
                      {new Date(v?.date).toLocaleDateString()}
                    </td>
                  
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-2 px-6 bg-white  mt-2 rounded-b-xl">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirst + 1} to{" "}
                  {Math.min(indexOfLast, filteredData.length)} of{" "}
                  {filteredData.length} records
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-newPrimary text-white hover:bg-newPrimary/80"
                      }`}
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
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
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-700/40 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="bg-white rounded-2xl shadow-2xl w-full md:w-[700px] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-bold text-newPrimary">
                {isEditing ? "Update Payment Voucher" : "Add Payment Voucher"}
              </h2>
              <button
                className="text-2xl text-gray-500"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Date</label>
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
                  <label className="block font-medium mb-1">Payment ID</label>
                  <input
                    type="text"
                    value={formData.paymentId || nextPaymentId}
                    readOnly
                    className="w-full border rounded-md p-3 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Bank</label>
                  <select
                    value={formData.bank}
                    onChange={(e) => {
                      const selected = banks.find(
                        (b) => b._id === e.target.value
                      );
                      setFormData({
                        ...formData,
                        bank: selected?._id,
                        bankBalance: selected?.balance || 0,
                      });
                    }}
                    className="w-full border rounded-md p-3"
                    required
                  >
                    <option value="">Select Bank</option>
                    {banks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} — {b.accountHolderName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Bank Balance</label>
                  <input
                    type="number"
                    value={formData.bankBalance}
                    readOnly
                    className="w-full border rounded-md p-3 bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => {
                      const selected = suppliers.find(
                        (s) => s._id === e.target.value
                      );
                      setFormData({
                        ...formData,
                        supplier: selected?._id,
                        supplierPayable: selected?.payableBalance || 0,
                      });
                    }}
                    className="w-full border rounded-md p-3"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers
                      .filter((s) => s.payableBalance > 0)
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.supplierName}
                        </option>
                      ))}
                  </select>

                  {/* ❗ Show message when no supplier has payable > 0 */}
                  {suppliers.length > 0 &&
                    suppliers.filter((s) => s.payableBalance > 0).length ===
                    0 && (
                      <p className="text-red-500 text-sm mt-1">
                        No supplier available — all suppliers have 0 payable
                        balance.
                      </p>
                    )}
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Payable Balance
                  </label>
                  <input
                    type="number"
                    value={formData.supplierPayable}
                    readOnly
                    className="w-full border rounded-md p-3 bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Amount to Pay <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (Number(value) > formData.supplierPayable) {
                      setAmountError("Amount cannot exceed payable balance");
                    } else {
                      setAmountError(""); // clear error
                    }
                    setFormData({ ...formData, amountPaid: value });
                  }}
                  required
                  className="w-full border rounded-md p-3"
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-1">{amountError}</p>
                )}
              </div>

              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Over Days</label>
                  <input
                    type="number"
                    value={formData.overDays}
                    onChange={(e) =>
                      setFormData({ ...formData, overDays: e.target.value })
                    }
                    className="w-full border rounded-md p-3"
                    placeholder="Enter overdue days"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Over Dues</label>
                  <input
                    type="number"
                    value={formData.overDues}
                    onChange={(e) =>
                      setFormData({ ...formData, overDues: e.target.value })
                    }
                    className="w-full border rounded-md p-3"
                    placeholder="Enter overdue amount"
                  />
                </div>
              </div> */}

              <div>
                <label className="block font-medium mb-1">Remarks</label>
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
                disabled={submitting}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isEditing ? (
                  "Update Payment Voucher"
                ) : (
                  "Save Payment Voucher"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVoucher;
