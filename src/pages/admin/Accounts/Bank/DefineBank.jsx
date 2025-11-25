import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { SquarePen, Trash2 } from "lucide-react";

import TableSkeleton from "../../Components/Skeleton";
import CommanHeader from "../../Components/CommanHeader";

const staticBanks = [
  { bankName: "National Bank of Pakistan" },
  { bankName: "Habib Bank Limited" },
  { bankName: "United Bank Limited" },
  { bankName: "MCB Bank Limited" },
  { bankName: "Allied Bank Limited" },
  { bankName: "Bank Alfalah Limited" },
  { bankName: "Faysal Bank Limited" },
  { bankName: "Askari Bank Limited" },
  { bankName: "BankIslami Pakistan Limited" },
  { bankName: "Meezan Bank Limited" },
  { bankName: "Dubai Islamic Bank Pakistan Limited" },
  { bankName: "Standard Chartered Bank Pakistan Limited" },
  { bankName: "Soneri Bank Limited" },
  { bankName: "Bank of Punjab" },
  { bankName: "Sindh Bank Limited" },
  { bankName: "JS Bank Limited" },
  { bankName: "Summit Bank Limited" },
  { bankName: "First Women Bank Limited" },
  { bankName: "Silkbank Limited" },
  { bankName: "Al Baraka Bank Pakistan Limited" },
];

const Bank = () => {
  const [bankList, setBankList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [balance, setBalance] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can change to 10/15

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/banks`;

  // Animation for modal
  useEffect(() => {
    if (isSliderOpen) {
      sliderRef.current.style.display = "block";
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => (sliderRef.current.style.display = "none"),
      });
    }
  }, [isSliderOpen]);

  /** ======================= FETCH ALL BANKS ======================= */
  const fetchBankList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setBankList(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch Banks", error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchBankList();
  }, [fetchBankList]);

  /** ======================= VALIDATION ======================= */
  const validateForm = () => {
    if (!bankName) return toast.error("Please select a bank name");
    if (!accountName.trim()) return toast.error("Please enter an account name");
    if (!accountNo.trim()) return toast.error("Please enter an account number");
    if (!balance || isNaN(balance))
      return toast.error("Please enter a valid balance");
    return true;
  };

  /** ======================= SAVE OR UPDATE ======================= */
  const handleSave = async () => {
    if (!validateForm()) return;
    const formData = {
      bankName,
      accountHolderName: accountName,
      accountNumber: accountNo,
      balance: parseFloat(balance),
    };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo?.token}`,
        "Content-Type": "application/json",
      };
      let res;
      if (isEdit && editId) {
        res = await axios.put(`${API_URL}/${editId}`, formData, { headers });
        toast.success("Bank updated successfully");
      } else {
        res = await axios.post(API_URL, formData, { headers });
        toast.success("Bank added successfully");
      }
      fetchBankList();
      setBankName("");
      setAccountName("");
      setAccountNo("");
      setBalance("");
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  /** ======================= EDIT ======================= */
  const handleEdit = (bank) => {
    setIsEdit(true);
    setEditId(bank._id);
    setBankName(bank.bankName || "");
    setAccountName(bank.accountHolderName || bank.accountName || "");
    setAccountNo(bank.accountNumber || "");
    setBalance(bank.balance || "");
    setIsSliderOpen(true);
  };

  /** ======================= DELETE ======================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the bank.",
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
        setBankList(bankList.filter((b) => b._id !== id));
        Swal.fire("Deleted!", "Bank deleted successfully.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete bank.", "error");
      }
    }
  };

  /** ======================= ADD NEW ======================= */
  const handleAddBank = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setBankName("");
    setAccountName("");
    setAccountNo("");
    setBalance("");
  };

  // 🔹 Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = bankList.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(bankList.length / recordsPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [bankList]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <CommanHeader />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Bank List</h1>
          <p className="text-gray-500 text-sm">Manage your bank details</p>
        </div>
        <button
          className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
          onClick={handleAddBank}
        >
          + Add Bank
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="hidden lg:grid grid-cols-[80px_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR#</div>
              <div>Bank Name</div>
              <div>Account Holder</div>
              <div>Account No.</div>
              <div>Balance</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : bankList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No banks found.
                </div>
              ) : (
                currentRecords.map((b, index) => (
                  <div
                    key={b._id}
                    className="hidden lg:grid grid-cols-[80px_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div>{indexOfFirstRecord + index + 1}</div>
                    <div>{b.bankName}</div>
                    <div>{b.accountHolderName || b.accountName}</div>
                    <div>{b.accountNumber}</div>
                    <div>{b.balance?.toLocaleString()}</div>
                    {userInfo?.isAdmin && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(b)}
                          className="text-blue-600"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, bankList.length)} of{" "}
                  {bankList.length} records
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
        </div>
      </div>

      {/* Form Modal */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b bg-white">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Bank" : "Add New Bank"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center"
                onClick={() => setIsSliderOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Bank Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Bank</option>
                  {staticBanks.map((b, i) => (
                    <option key={i} value={b.bankName}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Info */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Eman Ali"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium">
                    Account No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="123456789"
                  />
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Balance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. 50000"
                />
              </div>

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isEdit ? "Update" : "Save Bank"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bank;
