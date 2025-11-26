import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { SquarePen, Trash2, Eye } from "lucide-react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DefineExpenseHead = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  const [expenses, setExpenses] = useState([]);
  const [expenseDate, setExpenseDate] = useState(today);
  const [expenseName, setExpenseName] = useState("");
  const [description, setDescription] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [viewExpense, setViewExpense] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sliderRef = useRef(null);

  // ================= FETCH EXPENSES =================
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(`${API_BASE}/head`);

        if (data.success) {
          setExpenses(
            data.data.map((exp) => ({
              id: exp._id,
              headName: exp.headName,
              description: exp.description,
              createdAt: exp.createdAt,
            }))
          );
        }
      } catch {
        toast.error("Failed to load expense heads");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

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

  // ================= SAVE / UPDATE EXPENSE =================
  const handleSaveExpense = async (e) => {
    e.preventDefault();

    if (!expenseName.trim()) {
      toast.error("Expense head is required");
      return;
    }

    const payload = {
      headName: expenseName,
      description: description,
    };

    try {
      setIsSaving(true);

      if (editingExpense) {
        await axios.put(`${API_BASE}/head/${editingExpense.id}`, payload);
        toast.success("Expense head updated");
      } else {
        await axios.post(`${API_BASE}/head`, payload);
        toast.success("Expense head created");
      }

      // Refresh list
      const { data } = await axios.get(`${API_BASE}/head`);
      if (data.success) {
        setExpenses(
          data.data.map((exp) => ({
            id: exp._id,
            headName: exp.headName,
            description: exp.description,
          }))
        );
      }

      // Reset
      setIsSliderOpen(false);
      setExpenseName("");
      setDescription("");
      setEditingExpense(null);
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setExpenseName(exp.headName);
    setDescription(exp.description);
    setIsSliderOpen(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the expense head.",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/head/${id}`);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        Swal.fire("Deleted!", "Expense head removed.", "success");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  // ================= SEARCH + PAGINATION =================
 const filteredExpenses = expenses.filter((exp) => {
  const term = searchTerm.toLowerCase();

  return (
    exp.headName?.toLowerCase().includes(term) ||
    exp.description?.toLowerCase().includes(term) 
    
  );
});


  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredExpenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);

  const formDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}-${date.toLocaleString(
      "en-US",
      { month: "short" }
    )}-${date.getFullYear()}`;
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
              Define Head
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
              onClick={() => setIsSliderOpen(true)}
            >
              + Add Head
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="hidden lg:grid grid-cols-[80px_200px_1fr_150px] text-center gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
                <div>Sr</div>
                <div>Head</div>
                <div>Description</div>
                <div className="text-center">Actions</div>
              </div>

              <div className="flex flex-col divide-y max-h-screen overflow-y-auto">
                {loading ? (
                  <TableSkeleton
                    rows={5}
                    cols={4}
                    className="lg:grid-cols-[80px_200px_1fr_150px]"
                  />
                ) : currentRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No expenses found.
                  </div>
                ) : (
                  currentRecords.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="grid grid-cols-1 text-center lg:grid-cols-[80px_200px_1fr_150px] gap-4 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{indexOfFirst + index + 1}</div>

                      <div>{exp.headName}</div>
                      <div>{exp.description}</div>

                      <div className="flex justify-center gap-4">
                       

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
                    Showing {indexOfFirst + 1}–
                    {Math.min(indexOfLast, filteredExpenses.length)} of{" "}
                    {filteredExpenses.length}
                  </p>

                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white"
                      }`}
                    >
                      Previous
                    </button>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
              <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingExpense
                    ? "Update Head"
                    : "Add New Head"}
                </h2>

                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setEditingExpense(null);
                    setExpenseName("");
                    setDescription("");
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 p-6">
                {/* ROW: EXPENSE HEAD + DESCRIPTION */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Head <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter Expense Head"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-newPrimary"
                    />
                  </div>

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
                </div>

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg"
                >
                  {editingExpense ? "Update Head" : "Save Head"}
                </button>
              </form>
            </div>
          </div>
        )}

      
      </div>
    </div>
  );
};

export default DefineExpenseHead;
