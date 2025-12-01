import React, { useState, useEffect } from "react";
import axios from "axios";
import CommanHeader from "../Components/CommanHeader";
import TableSkeleton from "../Components/Skeleton";

const DayBook = () => {
  const [search, setSearch] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const [selectedDate, setSelectedDate] = useState(today);

  // --- DATA STATES ---
  const [salesData, setSalesData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [summary, setSummary] = useState({});

  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  // ---------------- FETCH API ----------------
  useEffect(() => {
    const fetchDayBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/dayBook?date=${selectedDate}`,
          headers
        );

        setSalesData(res.data.sales || []);
        setRecoveryData(res.data.recovery || []);
        setCustomerData(res.data.cashDeposit || []); // <-- FIXED
        setExpenseData(res.data.expenses || []);

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
  const filterText = search.toLowerCase();

  const filteredSales = salesData.filter((i) =>
    (i.description || "").toLowerCase().includes(filterText)
  );

  const filteredRecovery = recoveryData.filter((i) =>
    (i.description || "").toLowerCase().includes(filterText)
  );

  const filteredCustomers = customerData.filter((i) =>
    (i.customer?.customerName || "").toLowerCase().includes(filterText)
  );

  const filteredExpenses = expenseData.filter((i) =>
    (i.expenseName || "").toLowerCase().includes(filterText)
  );

  // ---------------- TOTALS ----------------
  const totalSales = filteredSales.reduce((s, a) => s + (a.amount || 0), 0);
  const totalRecovery = filteredRecovery.reduce((s, a) => s + (a.amount || 0), 0);
  const totalCustomer = filteredCustomers.reduce((s, a) => s + (a.amountReceived || 0), 0);
  const totalExpense = filteredExpenses.reduce((s, a) => s + (a.amount || 0), 0);

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
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-64 focus:ring-2 focus:ring-newPrimary"
          />
        </div>

        {/* ---------------- 4 COLUMNS GRID ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-start">


          {/* ========== SALES ========== */}
          <ColumnTable
            title="Sales"
            rows={filteredSales}
            loading={loading}
            columns={["SR", "Description", "Amount"]}
            renderRow={(item, idx) => (
              <>
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{item.description}</td>
                <td className="p-3 border font-semibold">{item.amount}</td>
              </>
            )}
            total={totalSales}
            totalColor="text-green-600"
          />

          {/* ========== RECOVERY ========== */}
          <ColumnTable
            title="Recovery"
            rows={filteredRecovery}
            loading={loading}
            columns={["SR", "Description", "Amount"]}
            renderRow={(item, idx) => (
              <>
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{item.description}</td>
                <td className="p-3 border font-semibold">{item.amount}</td>
              </>
            )}
            total={totalRecovery}
            totalColor="text-green-600"
          />

          {/* ========== CUSTOMER ========== */}
          <ColumnTable
            title="Customer"
            rows={filteredCustomers}
            loading={loading}
            columns={["SR", "Customer Name", "Amount Received"]}
            renderRow={(item, idx) => (
              <>
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{item.customer?.customerName}</td>
                <td className="p-3 border font-semibold">{item.amountReceived}</td>
              </>
            )}
            total={totalCustomer}
            totalColor="text-blue-600"
          />

          {/* ========== EXPENSE ========== */}
          <ColumnTable
            title="Expense"
            rows={filteredExpenses}
            loading={loading}
            columns={["SR", "Expense Name", "Amount"]}
            renderRow={(item, idx) => (
              <>
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{item.expenseName}</td>
                <td className="p-3 border font-semibold">{item.amount}</td>
              </>
            )}
            total={totalExpense}
            totalColor="text-red-600"
          />

        </div>

        {/* ---------------- SUMMARY (UNCHANGED) ---------------- */}
        <div className="mt-6 bg-white shadow p-6 rounded-xl">
          <p className="text-xl font-semibold">
            Total Sales =
            <span className="text-blue-600"> {summary?.totalSales || 0}</span>
          </p>

          <p className="text-xl font-semibold mt-2">
            Total Recovery =
            <span className="text-blue-600"> {summary?.totalRecovery || 0}</span>
          </p>

          <p className="text-xl font-semibold mt-2">
            Total Cash Deposit =
            <span className="text-blue-600"> {summary?.totalCashDeposit || 0}</span>
          </p>

          <p className="text-xl font-semibold mt-2">
            Total Expense =
            <span className="text-red-600"> {summary?.totalExpense || 0}</span>
          </p>

          <p className="text-xl font-semibold mt-2">
            Net Cash =
            <span className="text-green-600"> {summary?.netCash || 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DayBook;


/* ----------------------------------------------
   REUSABLE COLUMN COMPONENT
---------------------------------------------- */
const ColumnTable = ({ title, rows, loading, columns, renderRow, total, totalColor }) => {
  return (
    <div className="border rounded-xl shadow bg-white">
      <div className="bg-gray-100 p-3 text-center text-lg font-semibold">
        {title}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={columns.length} />
      ) : (
        <>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="p-3 border font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((item, idx) => (
                  <tr key={idx}>{renderRow(item, idx)}</tr>
                ))
              )}
            </tbody>
          </table>

          <div className={`p-4 text-right font-bold ${totalColor}`}>
            Total = {total}
          </div>
        </>
      )}
    </div>
  );
};
