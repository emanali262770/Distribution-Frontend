import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../../../context/ApiService";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { Printer } from "lucide-react";
import { handleDateWisePrint } from "../../../../helper/SalesPrintView";

const DateWisePurchase = () => {
  const [receivables, setReceivables] = useState([]);
  const today = new Date().toLocaleDateString("en-CA");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [showDateError, setShowDateError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const ledgerRef = useRef(null);

  // Fetch receivables by date range
  const fetchReceivablesLedger = useCallback(async () => {
    if (!dateTo) return;
    try {
      setLoading(true);

      // Correct query string
      let query = `/reports/datewise?startDate=${dateFrom}&endDate=${dateTo}`;
      const response = await api.get(query);

      const transformedData = (response.data || []).map((entry) => ({
        ...entry,
        Debit: entry.Paid || "0.00",
        Credit: entry.Received || "0.00",
        SR: entry.SR,
        ID: entry.invoiceNumber,
        Date: entry.invoiceDate,
        SupplierName: entry.Supplier?.supplierName || "-", // ✅ fix here
        Description: entry.notes,
        Balance: entry.balance,
      }));

      setReceivables(transformedData);
    } catch (error) {
      console.error("Failed to fetch receivables ledger:", error);
      Swal.fire("Error", "Failed to load ledger entries", "error");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  // Initial fetch and refetch on date change
  useEffect(() => {
    fetchReceivablesLedger();
    setCurrentPage(1);
  }, [fetchReceivablesLedger]);

  // Total sum of totalAmount
  const totalAmountSum = receivables.reduce(
    (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
    0
  );

  // 🔍 Search filter (by GRN ID, Supplier, or Item)
  const searchedReceivables = receivables.filter((entry) => {
    const search = searchTerm.toLowerCase();
    const supplier = entry.SupplierName?.toLowerCase() || "";
    const grn = entry.grnId?.toString().toLowerCase() || "";
    const items =
      entry.products?.map((p) => p.item?.toLowerCase()).join(", ") || "";

    return (
      supplier.includes(search) ||
      grn.includes(search) ||
      items.includes(search)
    );
  });

  // Pagination on searched data
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchedReceivables.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(searchedReceivables.length / recordsPerPage);

  // reset page when search changes
  useEffect(() => setCurrentPage(1), [searchTerm]);

  // console.log({ currentRecords });
  useEffect(() => {
    if (!dateTo) {
      setShowDateError(true);
    }
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Datewise Receivables Ledger
          </h1>

          {receivables.length > 0 && (
            <button
              onClick={() => handleDateWisePrint(receivables)}
              className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
            >
              <Printer size={18} />
            </button>
          )}
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap justify-between items-end gap-5 mb-6">
          {/* Date Filters */}
          <div className="flex flex-wrap gap-5">
            <div className="w-[200px]">
              <label className="block text-gray-700 font-medium mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
              />
            </div>

            <div className="w-[200px]">
              <label className="block text-gray-700 font-medium mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setShowDateError(false);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
              />
              {showDateError && (
                <p className="text-red-500 text-sm mt-1">
                  Please select an end date.
                </p>
              )}
            </div>
          </div>

          {/* Searchbar aligned to the right */}
          <div className="w-[260px]">
            <input
              type="text"
              placeholder="Search by supplier or item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
          {loading ? (
            <TableSkeleton
              rows={receivables.length > 0 ? receivables.length : 5}
              cols={6}
              className="lg:grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr_1fr]"
            />
          ) : searchedReceivables.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No ledger entries found.
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                <div>SR</div>
                <div>Date</div>
                <div>GRN NO.</div>
                <div>SUPPLIER</div>
                <div>ITEM</div>
                <div>TOTAL</div>
              </div>

              <div className="divide-y divide-gray-100">
                {currentRecords.map((entry, i) => (
                  <div
                    key={entry._id || i}
                    className="grid grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr] items-center gap-4 px-6 py-3 hover:bg-gray-50 text-sm"
                  >
                    <div>{i + 1 + indexOfFirstRecord}</div>
                    <div>{new Date(entry.grnDate).toLocaleDateString()}</div>
                    <div>{entry.grnId || "-"}</div>
                    <div>{entry.SupplierName || "-"}</div>
                    <div>
                      {entry.products.map((p) => `${p.item}`).join(", ") || "-"}
                    </div>{" "}
                    {/* You can treat as Debit */}
                    <div>{entry.totalAmount || "-"}</div>{" "}
                    {/* No Credit info in your API */}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700">
                <div className="col-span-5 text-right text-green-500 pr-2">
                  Total:
                </div>
                <div className="text-left text-green-500">
                  {totalAmountSum.toLocaleString()}
                </div>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center py-4 px-6 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, receivables.length)} of{" "}
                {receivables.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
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
  );
};

export default DateWisePurchase;
