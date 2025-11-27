import React, { useState, useEffect } from "react";

import axios from "axios";
import CommanHeader from "../Components/CommanHeader";
import TableSkeleton from "../Components/Skeleton";

// your skeleton component

const DayBook = () => {
  const [search, setSearch] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(today);

  const [salesRecoveryData, setSalesRecoveryData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPageSales, setCurrentPageSales] = useState(1);
  const [currentPageExpense, setCurrentPageExpense] = useState(1);
  const recordsPerPage = 8;

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  // Fetch API
 useEffect(() => {
  const fetchDayBook = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/dayBook?date=${selectedDate}`,
        headers
      );

      setSalesRecoveryData(res.data.salesRecovery || []);

      // Flatten expenses
     const allExpenses = res.data.expenses || [];


      setExpenseData(allExpenses);

      setSummary(res.data.summary || {});
    } catch (error) {
      console.error("DayBook error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDayBook();
}, [selectedDate]);


  // ---------------- FILTERS ----------------

const filteredSalesRecovery = salesRecoveryData?.filter((item) =>
  (item?.description || "").toLowerCase().includes(search.toLowerCase())
);


 const filteredExpenses = expenseData?.filter((item) =>
  (item?.expenseName || "").toLowerCase().includes(search.toLowerCase())
);


  // ---------------- PAGINATION ----------------
  const indexOfLastSales = currentPageSales * recordsPerPage;
  const indexOfFirstSales = indexOfLastSales - recordsPerPage;
  const currentSales = filteredSalesRecovery.slice(
    indexOfFirstSales,
    indexOfLastSales
  );
  const totalSalesPages = Math.ceil(
    filteredSalesRecovery.length / recordsPerPage
  );

  const indexOfLastExpense = currentPageExpense * recordsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - recordsPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );
  const totalExpensesPages = Math.ceil(
    filteredExpenses.length / recordsPerPage
  );

  // ---------------- TOTALS ----------------
  const totalSalesRecovery = filteredSalesRecovery.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const totalExpense = filteredExpenses.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
// console.log({currentExpenses});

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        <h1 className="text-2xl font-bold text-newPrimary mb-6">Day Book</h1>

        {/* ---------------- DATE + SEARCH ---------------- */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <label className="text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 h-[40px] rounded-md w-48 focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPageSales(1);
              setCurrentPageExpense(1);
            }}
            className="border p-2 rounded-md w-64 focus:ring-2 focus:ring-newPrimary"
          />
        </div>

        {/* ---------------- MAIN TABLES ---------------- */}
        <div className="grid grid-cols-2 gap-6 items-start">
          {/* SALES + RECOVERY */}
          <div className="border rounded-xl shadow bg-white">
            <div className="bg-gray-100 p-3 text-center text-lg font-semibold">
              Sales + Recovery
            </div>

            {loading ? (
              <TableSkeleton rows={currentSales.length || 5} cols={3} />
            ) : (
              <>
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border">SR</th>
                      <th className="p-3 border">Description</th>
                      <th className="p-3 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSales.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center p-4 text-gray-500"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      currentSales.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 border">
                            {indexOfFirstSales + idx + 1}
                          </td>
                        <td className="p-3 border">{ item.expenseName ||item.description }</td>
                          <td className="p-3 border font-semibold">
                            {item.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalSalesPages > 1 && (
                  <div className="flex justify-between items-center p-3 border-t">
                    <button
                      disabled={currentPageSales === 1}
                      onClick={() =>
                        setCurrentPageSales((prev) => Math.max(prev - 1, 1))
                      }
                      className={`px-3 py-1 rounded ${
                        currentPageSales === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white"
                      }`}
                    >
                      Prev
                    </button>

                    <button
                      disabled={currentPageSales === totalSalesPages}
                      onClick={() =>
                        setCurrentPageSales((prev) =>
                          Math.min(prev + 1, totalSalesPages)
                        )
                      }
                      className={`px-3 py-1 rounded ${
                        currentPageSales === totalSalesPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="p-4 text-right font-bold text-green-600">
              Total = {totalSalesRecovery}
            </div>
          </div>

          {/* EXPENSE */}
          <div className="border rounded-xl shadow bg-white">
            <div className="bg-gray-100 p-3 text-center text-lg font-semibold">
              Expense
            </div>

            {loading ? (
              <TableSkeleton rows={currentExpenses.length || 5} cols={3} />
            ) : (
              <>
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border">SR</th>
                      <th className="p-3 border">EXpense Name</th>
                      <th className="p-3 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExpenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center p-4 text-gray-500"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      currentExpenses.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 border">
                            {indexOfFirstExpense + idx + 1}
                          </td>
                          <td className="p-3 border">{item.description || item.expenseName}</td>
                          <td className="p-3 border font-semibold">
                            {item.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalExpensesPages > 1 && (
                  <div className="flex justify-between items-center p-3 border-t">
                    <button
                      disabled={currentPageExpense === 1}
                      onClick={() =>
                        setCurrentPageExpense((prev) => Math.max(prev - 1, 1))
                      }
                      className={`px-3 py-1 rounded ${
                        currentPageExpense === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white"
                      }`}
                    >
                      Prev
                    </button>

                    <button
                      disabled={currentPageExpense === totalExpensesPages}
                      onClick={() =>
                        setCurrentPageExpense((prev) =>
                          Math.min(prev + 1, totalExpensesPages)
                        )
                      }
                      className={`px-3 py-1 rounded ${
                        currentPageExpense === totalExpensesPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-newPrimary text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="p-4 text-right font-bold text-red-600">
              Total Expense = {totalExpense}
            </div>
          </div>
        </div>

        {/* ---------------- SUMMARY ---------------- */}
        {(filteredSalesRecovery.length > 0 || filteredExpenses.length > 0) && (
          <div className="mt-6 bg-white shadow p-6 rounded-xl">
            <p className="text-xl font-semibold">
              Total Income =
              <span className="text-blue-600">
                {" "}
                {summary?.totalIncome || 0}
              </span>
            </p>

            <p className="text-xl font-semibold mt-2">
              Total Expense =
              <span className="text-red-600">
                {" "}
                {summary?.totalExpense || 0}
              </span>
            </p>

            <p className="text-xl font-semibold mt-2">
              Total Profit =
              <span className="text-green-700">
                {" "}
                {summary?.totalProfit || 0}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayBook;
