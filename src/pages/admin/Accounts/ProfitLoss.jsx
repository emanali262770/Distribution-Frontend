import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfitLoss() {
    const [month, setMonth] = useState("");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    // ------------------------------
    // COUNTDOWN HANDLER
    // ------------------------------
    useEffect(() => {
        let timer;
        if (loading) {
            setCountdown(30); // Reset
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [loading]);

    // ------------------------------
    // API CALL
    // ------------------------------
    const fetchReport = async () => {
        if (!month) {
            setError("Please select a month");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setReport(null);

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/dayBook/month?month=${month}`
            );

            setReport(res.data);
        } catch (err) {
            console.log(err);
            setError("Failed to load Profit & Loss report");
        } finally {
            // Timer will count down before ending loader
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    const formatNum = (num) => {
        if (!num) return 0;
        return Math.round(num).toLocaleString();
    };

    return (
        <div className="p-6">

            {/* ---------------- PAGE TITLE ---------------- */}
            <h1 className="text-2xl font-semibold text-newPrimary mb-6">
                Profit & Loss Report
            </h1>

            {/* ---------------- MONTH FILTER ---------------- */}
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <label className="block text-gray-600 font-medium mb-1">
                        Select Month
                    </label>
                    <input
                        type="month"
                        className="border px-4 py-2 rounded-md"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button
                    onClick={fetchReport}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md mt-6 text-white ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-newPrimary hover:bg-newPrimary/90"
                    }`}
                >
                    {loading ? "Loading..." : "Load Report"}
                </button>
            </div>

            {/* ---------------- ERROR MESSAGE ---------------- */}
            {error && (
                <p className="text-red-600 font-medium mb-4">{error}</p>
            )}

            {/* ---------------- LOADER WITH COUNTDOWN ---------------- */}
            {loading && (
                <div className="text-center my-6">
                    <div className="inline-block px-6 py-3 text-white bg-newPrimary rounded-md shadow">
                        <p className="text-lg font-semibold">
                            Fetching Monthly Report...
                        </p>
                        <p className="text-sm mt-1 text-white/90">
                            Please wait: <span className="font-bold">{countdown}</span> sec
                        </p>
                    </div>
                </div>
            )}

            {/* ---------------- SUMMARY ---------------- */}
            {report?.summary && !loading && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">

                    <h2 className="text-xl font-semibold text-newPrimary mb-4">
                        Summary for {report.month}
                    </h2>

                    <div className="grid grid-cols-3 gap-6">
                        {/* Revenue */}
                        <div className="p-4 shadow border rounded-lg">
                            <p className="text-gray-500 font-medium">Total Revenue</p>
                            <p className="text-green-600 text-2xl font-bold">
                                {formatNum(report.summary.totalRevenue)}
                            </p>
                        </div>

                        {/* Expense */}
                        <div className="p-4 shadow border rounded-lg">
                            <p className="text-gray-500 font-medium">Total Expense</p>
                            <p className="text-red-600 text-2xl font-bold">
                                {formatNum(report.summary.totalExpense)}
                            </p>
                        </div>

                        {/* Profit */}
                        <div className="p-4 shadow border rounded-lg">
                            <p className="text-gray-500 font-medium">Net Profit</p>
                            <p
                                className={`text-2xl font-bold ${
                                    report.summary.netProfit >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {formatNum(report.summary.netProfit)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- DAILY PROFIT/LOSS TABLE ---------------- */}
            {report?.days && !loading && (
                <div className="bg-white shadow rounded-lg overflow-hidden">

                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-gray-700 font-semibold text-left">Date</th>
                                <th className="px-6 py-3 text-gray-700 font-semibold text-left">Revenue</th>
                                <th className="px-6 py-3 text-gray-700 font-semibold text-left">Expense</th>
                                <th className="px-6 py-3 text-gray-700 font-semibold text-left">Profit / Loss</th>
                            </tr>
                        </thead>

                        <tbody>
                            {report.days.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 text-gray-500">
                                        No data found for this month
                                    </td>
                                </tr>
                            )}

                            {report.days.map((d, index) => (
                                <tr
                                    key={index}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-3">{d.date}</td>

                                    <td className="px-6 py-3 font-medium text-green-700">
                                        {formatNum(d.revenue)}
                                    </td>

                                    <td className="px-6 py-3 font-medium text-red-700">
                                        {formatNum(d.expense)}
                                    </td>

                                    <td
                                        className={`px-6 py-3 font-semibold ${
                                            d.profit >= 0
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {formatNum(d.profit)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
}
