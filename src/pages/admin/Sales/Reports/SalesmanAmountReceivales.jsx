import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../../../context/ApiService";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";

const SalesmanAmountReceivables = () => {
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // 🔹 Fetch salesman receivables
  const fetchReceivables = useCallback(async () => {
    try {
      setLoading(true);

      // 🔥 API: Only salesman receivables
      const response = await api.get(`/salesman-report/salesman-recovery`);

      // ✅ your data is inside response.data.data
      setReceivables(response.data || []);
    } catch (error) {
      console.error("Failed to fetch receivables", error);
      setReceivables([]);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);
  // console.log(receivables);

  // 🔹 Search filter (employee name or recovery balance)
  const searchedCustomers = receivables.filter(
    (r) =>
      r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recoveryBalance?.toString().includes(searchTerm)
  );

  // 🔹 Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchedCustomers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(searchedCustomers.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  // 🔹 Total Recovery Balance Calculation
  const totalBalance = searchedCustomers.reduce(
    (sum, r) => sum + (parseFloat(r.recoveryBalance) || 0),
    0
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Salesman Amount Receivable Details
          </h1>
        </div>

        {/* Only Search */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search by salesman or amount"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
          />
        </div>

        {/* Table Section */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto lg:overflow-x-auto max-h-screen">
            <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-[0.2fr_0.5fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 border-b border-gray-200">
                <div>SR</div>
                <div>Sales Officer</div>
                <div>Balance</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={currentRecords.length || 5}
                    cols={3}
                    className="lg:grid-cols-[0.2fr_0.5fr_1fr]"
                  />
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((cust, index) => (
                    <div
                      key={cust._id}
                      className="lg:grid grid-cols-[0.2fr_0.5fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div>{indexOfFirstRecord + index + 1}</div>
                      <div>{cust.employeeName}</div>
                      <div>
                        {parseFloat(cust.recoveryBalance).toLocaleString(
                          "en-PK",
                          {
                            style: "currency",
                            currency: "PKR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-white">
                    No receivables found.
                  </div>
                )}
              </div>
              {/* ✅ TOTAL RECOVERY BALANCE ROW */}

              {!loading && searchedCustomers.length > 0 && (
                <div className="grid grid-cols-[0.2fr_0.5fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-sm font-semibold text-gray-700 border-t">
                  <div></div>
                  <div className="text-right">Total Balance:</div>
                  <div className="text-blue-600">
                    {Number(totalBalance.toFixed(0)).toLocaleString("en-PK", {
                      style: "currency",
                      currency: "PKR",
                      minimumFractionDigits: 0,
                    })}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, searchedCustomers.length)} of{" "}
                    {searchedCustomers.length} records
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesmanAmountReceivables;
