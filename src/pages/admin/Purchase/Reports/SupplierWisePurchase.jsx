import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../../../context/ApiService";
import axios from "axios";
import { LedgerTemplate } from "../../../../helper/LedgerReportTemplate";
import CommanHeader from "../../Components/CommanHeader";
import Swal from "sweetalert2";
import TableSkeleton from "../../Components/Skeleton";
import { handleLedgerPrint } from "../../../../helper/SalesPrintView";
import { Loader, Printer } from "lucide-react";

const SupplierWisePurchase = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showError, setShowError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const recordsPerPage = 10;
  const ledgerRef = useRef(null);

  // 1️⃣ FETCH SUPPLIERS LIST
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierList(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      Swal.fire("Error", "Failed to load suppliers", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2️⃣ FETCH SUPPLIER-WISE PURCHASE REPORT
  const fetchSupplierLedger = useCallback(async () => {
    if (!selectedSupplier) return;

    try {
      setLoading(true);

      // Construct query params
      let query = `/reports/supplierwise?supplierId=${selectedSupplier}`;
      if (dateFrom && dateTo) {
        query += `&from=${dateFrom}&to=${dateTo}`;
      }

      const response = await api.get(query);
      console.log("Response ", response.data);

      const report = response.data || [];

      const transformedData = report.map((entry, index) => ({
        SR: index + 1,
        Date: entry.Date,
        ID: entry.ID,
        SupplierName: entry.SupplierName,
        Item: entry.Item,
        Rate: entry.Rate,
        Qty: entry.Qty,
        Amount: entry.Amount,
        Total: entry.Total,
      }));

      setLedgerEntries(transformedData);
    } catch (error) {
      console.error("Failed to fetch supplier-wise purchases:", error);
      Swal.fire("Error", "Failed to load supplier-wise purchases", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier, dateFrom, dateTo]);

  // INITIAL LOAD
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // REFETCH WHEN FILTER CHANGES
  useEffect(() => {
    fetchSupplierLedger();
    setCurrentPage(1);
  }, [fetchSupplierLedger]);

  // 3️⃣ TOTALS
  const totalDebit = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Amount) || 0),
    0
  );
  const totalCredit = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Total) || 0),
    0
  );

  // 4️⃣ PAGINATION
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const filteredEntries = ledgerEntries.filter(
    (entry) =>
      entry.ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.SupplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.Item?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRecords = filteredEntries.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEntries.length / recordsPerPage);

  useEffect(() => {
    if (!selectedSupplier) {
      setShowError(true);
    }
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {loading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-newPrimary">
              Supplier Wise Purchase
            </h1>

            {ledgerEntries.length > 0 && (
              <button
                onClick={() => handleLedgerPrint(ledgerEntries)}
                className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
              >
                <Printer size={18} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end justify-between gap-5 mb-1">
            <div className="flex flex-wrap gap-5 mb-6">
              {/* Supplier Select */}
              <div className="w-[300px]">
                <label className="block text-gray-700 font-medium mb-2">
                  Supplier Name *
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    setShowError(false);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                >
                  <option value="">Select Supplier</option>
                  {supplierList.map((supp) => (
                    <option key={supp._id} value={supp._id}>
                      {supp.supplierName || supp.name}
                    </option>
                  ))}
                </select>
                {showError && (
                  <p className="text-red-500 text-sm mt-1">
                    Please select a supplier before proceeding.
                  </p>
                )}
              </div>

              {/* From Date */}
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

              {/* To Date */}
              <div className="w-[200px]">
                <label className="block text-gray-700 font-medium mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                />
              </div>
            </div>
            <div>
              {/* Search Bar */}
              <div className="w-[280px] justify-end mb-6">
                <input
                  type="text"
                  placeholder="Search by ID, Supplier, or Item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                />
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
            {loading ? (
              <TableSkeleton
                rows={ledgerEntries.length > 0 ? ledgerEntries.length : 5}
                cols={7}
                className="lg:grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr_1fr]"
              />
            ) : !selectedSupplier ? (
              <div className="text-center py-6 text-gray-500">
                Please select a supplier to view ledger entries.
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No ledger entries found.
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No ledger entries found.
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="hidden lg:grid grid-cols-[0.3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  <div>SR</div>
                  <div>Date</div>
                  <div>ID</div>
                  <div>Supplier Name</div>
                  <div>Item</div>
                  <div>Rate</div>
                  <div>Qty</div>
                  <div>Amount</div>
                  <div>Net Amount</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {currentRecords.map((entry, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[0.3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center px-6 py-3 hover:bg-gray-50 text-sm"
                    >
                      <div>{i + 1 + indexOfFirstRecord}</div>
                      <div>{entry.Date || "-"}</div>
                      <div>{entry.ID || "-"}</div>
                      <div>{entry.SupplierName || "-"}</div>
                      <div>{entry.Item || "-"}</div>
                      <div>{entry.Rate || "-"}</div>
                      <div>{entry.Qty || "-"}</div>
                      <div>{entry.Amount || "-"}</div>
                      <div>{entry.Total || "-"}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-[0.3fr_0.5fr_0.5fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center whitespace-nowrap bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="text-red-600">
                    Total Amount: {totalDebit.toLocaleString()}
                  </div>
                  <div className="text-green-600">
                    Total Payable: {totalCredit.toLocaleString()}
                  </div>
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-4 px-6 border-t bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, ledgerEntries.length)} of{" "}
                  {ledgerEntries.length}
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
      )}
    </div>
  );
};

export default SupplierWisePurchase;
