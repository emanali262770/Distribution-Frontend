import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SquarePen, Trash2, X, Eye } from "lucide-react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ExpensePage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  const [expenses, setExpenses] = useState([]);
  const [expenseDate, setExpenseDate] = useState(today);
  const [expenseName, setExpenseName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [viewExpense, setViewExpense] = useState(null);
  const [heads, setHeads] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sliderRef = useRef(null);

  // ================= FETCH EXPENSES =================
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/salesman-expense`);
      if (data.success) {
        setExpenses(
          data?.data?.map((exp) => ({
            id: exp._id,
            date: exp.date?.split("T")[0] || "",
            expenseName: exp.head?.headName || "-",
            description: exp.description || "-",
            amount: exp.amount || 0,
            headId: exp.head?._id || "", // needed for edit
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };
  const fetchHeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/head`);
      if (res.data.success) {
        setHeads(res.data.data); // array of headName + description
      }
    } catch (err) {
      toast.error("Failed to load heads");
    }
  };
  useEffect(() => {
    fetchExpenses();

    // FETCH EXPENSE HEADS

    fetchHeads();
  }, []);
  // console.log(expenses);

  // ================= GSAP =================
  useEffect(() => {
    if (isSliderOpen) {
      sliderRef.current.style.display = "block";
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => (sliderRef.current.style.display = "none"),
      });
    }
  }, [isSliderOpen]);

  // ================= ADD ITEM =================

  // ================= SAVE / UPDATE EXPENSE =================
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    // ✅ FIELD VALIDATION

    if (!expenseName) {
      toast.error("Expense Head is required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const payload = {
      date: expenseDate,
      head: expenseName, // This must be HEAD _id, so set expenseName = head._id
      amount: Number(amount),
      description: description,
    };

    try {
      setIsSaving(true);

      if (editingExpense) {
        await axios.put(
          `${API_BASE}/salesman-expense/${editingExpense.id}`,
          payload
        );
        toast.success("Expense updated successfully!");
      } else {
        await axios.post(`${API_BASE}/salesman-expense`, payload);
        toast.success("Expense added successfully!");
      }

      fetchExpenses();

      setIsSliderOpen(false);
      setExpenseItems([]);
      setEditingExpense(null);
    } catch (err) {
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (exp) => {
    setEditingExpense(exp);

    // Set date
    setExpenseDate(exp.date);

    // Set head (must be headId)
    setExpenseName(exp.headId);

    // Set description
    setDescription(exp.description);

    // Set amount
    setAmount(exp.amount);

    setIsSliderOpen(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the expense record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/salesman-expense/${id}`);
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Expense deleted successfully.",
        });
      } catch {
        toast.error("Failed to delete expense");
      }
    }
  };

  // ================= SEARCH + PAGINATION =================
  // ================= SEARCH + PAGINATION =================
  const filteredExpenses = expenses.filter((exp) => {
    const term = searchTerm.toLowerCase();
    return (
      exp.expenseName.toLowerCase().includes(term) ||
      exp.description.toLowerCase().includes(term) ||
      String(exp.amount).includes(term)
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredExpenses.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);

  const formDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="px-6 mx-auto">
        <CommanHeader />

        {isSaving && (
          <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-[9999]">
            <ScaleLoader color="#1E93AB" size={60} />
          </div>
        )}

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              City Trader Expense
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your daily expense records
            </p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64 p-2 border rounded-lg"
            />

            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setEditingExpense(null); // reset edit mode
                setExpenseName(""); // reset head
                setDescription(""); // reset description
                setAmount(""); // reset amount
                setExpenseDate(today); // set current date
                setIsSliderOpen(true); // open modal
              }}
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* ================= MAIN TABLE ================= */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div
                className="hidden lg:grid 
        grid-cols-[80px_180px_150px_1fr_150px_150px] 
        gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold 
        text-gray-600 uppercase border-b "
              >
                <div>Sr</div>
                <div>Date</div>
                <div>Expense Head</div>
                <div>Description</div>
                <div>Total Amount</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="flex flex-col divide-y max-h-screen overflow-y-auto">
                {loading ? (
                  <TableSkeleton
                    rows={5}
                    cols={6}
                    className="lg:grid-cols-[80px_180px_150px_1fr_150px_150px]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No expenses found.
                  </div>
                ) : (
                  currentRecords.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="grid grid-cols-1 
              lg:grid-cols-[80px_180px_150px_1fr_150px_150px]
              gap-4 items-center px-6  text-sm bg-white 
              hover:bg-gray-50 transition"
                    >
                      <div className="">{indexOfFirstRecord + index + 1}</div>

                      <div className="">{formDate(exp.date) || "-"}</div>

                      {/* Expense Head */}
                      <div className="py-3 px-6">{exp.expenseName || "-"}</div>

                      {/* Description */}
                      <div className="py-3 px-6">{exp.description || "-"}</div>

                      <div className="font-semibold py-3 px-6 text-blue-600">
                        {exp.amount || "-"}
                      </div>

                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setViewExpense(exp)}
                          className="text-yellow-500"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(exp)}
                          className="text-blue-600"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1}–
                    {Math.min(indexOfLastRecord, filteredExpenses.length)} of{" "}
                    {filteredExpenses.length} expenses
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
                          : "bg-newPrimary text-white"
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
                          : "bg-newPrimary text-white"
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

        {/* ================= SLIDER FORM ================= */}
        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="relative w-full md:w-[550px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingExpense ? "Update Expense" : "Add New Expense"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setEditingExpense(null);
                    setExpenseItems([]);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 p-6">
                {/* ================= LINE 1: DATE + HEAD ================= */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Expense Head <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-newPrimary"
                    >
                      <option value="">Select Expense Head</option>

                      {heads.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.headName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ================= LINE 2: DESCRIPTION + AMOUNT ================= */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      className="w-full p-3 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg"
                >
                  {editingExpense ? "Update Expense" : "Save Expense"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= VIEW EXPENSE MODAL ================= */}
        {viewExpense && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-newPrimary mb-4">
                Expense Details
              </h2>

              <p>
                <strong>Date:</strong> {formDate(viewExpense.date)}
              </p>

              <div className="mt-3">
              

                <ul className="space-y-1">
                  <div className="mt-3 space-y-2 text-sm">
                    <p>
                      <strong>Head:</strong> {viewExpense.expenseName}
                    </p>
                    <p>
                      <strong>Description:</strong> {viewExpense.description}
                    </p>
                    <p>
                      <strong>Amount:</strong> {viewExpense.amount}
                    </p>
                  </div>
                </ul>
              </div>

              

              <button
                onClick={() => setViewExpense(null)}
                className="mt-6 w-full bg-newPrimary text-white py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
