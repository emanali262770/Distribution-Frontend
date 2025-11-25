import React, { useState, useEffect, useCallback } from "react";

import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import { api } from "../../../../context/ApiService";

const BankPosition = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showZero, setShowZero] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  // 🔹 Fetch banks
  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/banks/bank-position`);
      setBanks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bank positions:", err);
      setBanks([]);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  // 🔹 Filter banks (with or without zero balance)
  const filteredBanks = showZero
    ? banks
    : banks.filter((b) => parseFloat(b.Balance) !== 0);

  // 🔹 Search Filter (Bank Name or Account Holder)
  const searchedBanks = filteredBanks.filter(
    (b) =>
      b.BankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.AccountHolder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchedBanks.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(searchedBanks.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showZero]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">Bank Position</h1>
          <input
            type="text"
            placeholder="Search by bank or account holder"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="balanceFilter"
              value="withZero"
              checked={showZero}
              onChange={() => setShowZero(true)}
              className="w-4 h-4"
            />
            With Zero
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="balanceFilter"
              value="withoutZero"
              checked={!showZero}
              onChange={() => setShowZero(false)}
              className="w-4 h-4"
            />
            Without Zero
          </label>
        </div>

        {/* Table Section */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-screen">
            <div className="min-w-[700px]">
              {/* Header */}
              <div className="hidden lg:grid grid-cols-4 gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 border-b border-gray-200">
                <div>SR</div>
                <div>Bank Name</div>
                <div>Account Holder</div>
                <div>Balance</div>
              </div>

              {/* Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton rows={5} cols={4} className="lg:grid-cols-4" />
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((bank, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 lg:grid-cols-4 items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{indexOfFirstRecord + index + 1}</div>
                      <div>{bank.BankName}</div>
                      <div>{bank.AccountHolder}</div>
                      <div>
                        {parseFloat(bank.Balance).toLocaleString("en-PK", {
                          style: "currency",
                          currency: "PKR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-white">
                    No bank data found.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, searchedBanks.length)} of{" "}
                    {searchedBanks.length} records
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
      </div>
    </div>
  );
};

export default BankPosition;
