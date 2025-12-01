import React, { useState, useEffect } from "react";
import axios from "axios";
import { SquarePen, Trash2, Eye, Loader, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import {  handleExpenseSheetPrint } from "../../../../helper/SalesPrintView";

const ExpensePage = () => {
  const today = new Date().toLocaleDateString("en-CA");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salesmanList, setSalesmanList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewExpense, setViewExpense] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can change page size if needed
  const [showSalesmanError, setShowSalesmanError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const formDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // ✅ Fetch Expenses based on salesman/date
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);

      let url = `${API_BASE}/salesman-expense/by-date`; // default

      // Date range selected
      if (dateFrom && dateTo) {
        url = `${API_BASE}/salesman-expense/by-date?from=${dateFrom}&to=${dateTo}`;
      }

      const { data } = await axios.get(url);

      if (data.success) {
        const mapped = data.data.map((exp) => ({
          id: exp._id,
          date: exp.date.split("T")[0],
          headName: exp.head?.headName || "N/A",
          amount: exp.amount,
          description: exp.description,
        }));

        setExpenses(mapped);
        setExpenseAmount(data.totalExpense || 0);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      toast.error("Failed to fetch expenses");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto load today's date and data
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setSelectedDate(today);
  }, []);

  // ✅ Auto-refresh when salesman or date changes
  // 🔥 When user selects Date From & Date To → fetch range API
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchExpenses();
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  // console.log({expenses});

  useEffect(() => {
    if (!selectedSalesman) {
      setShowSalesmanError(true);
    }
  }, []);

  const filteredExpenses = expenses.filter((exp) => {
    const search = searchTerm.toLowerCase();

    return (
      exp.headName.toLowerCase().includes(search) ||
      exp.description?.toLowerCase().includes(search) ||
      exp.amount.toString().includes(search) ||
      exp.date.toLowerCase().includes(search)
    );
  });

  // 🔹 Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredExpenses.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredExpenses.length / recordsPerPage);
// console.log({currentRecords});

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {isSaving ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-newPrimary">
              Expenses Sheet
            </h1>
            {currentRecords.length > 0 && (
                <button
                  onClick={() => handleExpenseSheetPrint(currentRecords)}
                  className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
                >
                  <Printer size={18} />
                </button>
              )}
          </div>

          {isLoading && (
            <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-[9999]">
              <ScaleLoader color="#1E93AB" size={60} />
            </div>
          )}

          {/* 🔹 Filters */}
          <div className="flex justify-end items-center w-full gap-4">
            <div className="flex justify-between items-center w-full gap-4 mb-5">
              <div className="flex justify-between items-center mt-8 gap-3">
                {/* Date From */}
                <div className="whitespace-nowrap flex  gap-3 items-start">
                  <label className="text-sm font-semibold ">
                    Date From <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setSelectedDate(""); // disable old filter
                    }}
                    className="p-2 border w-[180px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>

                {/* Date To */}
                <div className="whitespace-nowrap flex gap-3 items-start">
                  <label className="text-sm font-semibold ">
                    Date To <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setSelectedDate(""); // disable old filter
                    }}
                    className="p-2 border w-[180px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>
              </div>

              <div>
                {/* Today Expense Amount */}
                <div className="whitespace-nowrap">
                  <label className="text-newPrimary text-lg inline-flex gap-2 items-center font-medium mb-2">
                    Today Expense Amount:
                    <p className="text-black">{expenseAmount}</p>
                  </label>
                </div>

                {/* 🔍 Search Bar */}
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[280px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                />
              </div>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="hidden lg:grid grid-cols-[80px_1fr_1fr_2fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase border-b">
                  <div>Sr</div>
                  <div>Date</div>
                  {/* <div className="text-center">Salesman</div> */}
                  <div className="text-center">Head Expense</div>
                  <div className="text-center">Description</div>
                  <div>Amount</div>
                  <div className="text-center">Actions</div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
                  {isLoading ? (
                    // 🦴 Skeleton loader while fetching
                    <TableSkeleton
                      rows={currentRecords.length || 5}
                      cols={6}
                      className="lg:grid-cols-[80px_1fr_1fr_2fr_1fr_1fr]"
                    />
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No expenses found.
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No expenses found.
                    </div>
                  ) : (
                    currentRecords.map((exp, index) => (
                      <div
                        key={exp.id}
                        className="grid grid-cols-1 lg:grid-cols-[80px_1fr_1fr_2fr_1fr_1fr] gap-4 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div>{indexOfFirstRecord + index + 1}</div>
                        <div>{formDate(exp.date) || '-'}</div>
                        {/* <div className="text-center">{exp.salesman}</div> */}
                        <div className="text-center">{exp.headName || '-'}</div>
                        <div className="text-center">{exp.description || '-'}</div>
                        <div className="font-semibold text-blue-600">
                          {exp.amount ?? "-"}
                        </div>

                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setViewExpense(exp)}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                   { currentRecords.length > 0 && (
                <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-sm font-semibold text-gray-700 border-t">
                  <div></div>
                  <div></div>
                  
                  <div className="text-right">Total Amount:</div>
                  <div className="text-blue-600">
                    {expenseAmount}
                  </div>
                </div>
              )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl mt-2 shadow-sm">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1}–
                      {Math.min(indexOfLastRecord, expenses.length)} of{" "}
                      {expenses.length} records
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

          {/* ===== VIEW MODAL ===== */}
          {viewExpense && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-newPrimary mb-4">
                  Expense Details
                </h2>
                <p>
                  <strong>Date:</strong> {viewExpense.date}
                </p>

                <div className="">
                  <p>
                    <strong>Head Expense:</strong> {viewExpense.headName}
                  </p>
                  <p>
                    <strong>Description:</strong> {viewExpense.description}
                  </p>
                  <p className="mt-4 font-semibold text-blue-600">
                    Amount: {viewExpense.amount}
                  </p>
                </div>

                <button
                  onClick={() => setViewExpense(null)}
                  className="mt-6 w-full bg-newPrimary text-white py-2 rounded-lg hover:bg-newPrimary/80"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpensePage;
