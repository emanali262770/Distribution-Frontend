import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../../../../context/ApiService";
import axios from "axios";
import { LedgerTemplate } from "../../../../helper/LedgerReportTemplate";
import CommanHeader from "../../Components/CommanHeader";
import Swal from "sweetalert2";
import TableSkeleton from "../../Components/Skeleton";
import { handleSupplierLedgerPrint } from "../../../../helper/SalesPrintView";
import { Loader, Printer } from "lucide-react";
import toast from "react-hot-toast";

const SupplierLedger = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSupplierError, setShowSupplierError] = useState(false);
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

  // 2️⃣ FETCH SUPPLIER LEDGER ENTRIES
  const fetchSupplierLedger = async (supplierId) => {
    if (!supplierId) return;

    try {
      setLoading(true);
      let query = `/supplier-ledger?supplier=${supplierId}`;
      if (dateFrom && dateTo) {
        query += `&from=${dateFrom}&to=${dateTo}`;
      }

      const response = await api.get(query);

      setLedgerEntries(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch ledger entries"
      );
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    setShowSupplierError(false);

    if (supplierId) {
      fetchSupplierLedger(supplierId); // ✅ call API when selected
    } else {
      setLedgerEntries([]); // clear table if deselected
    }
  };

  useEffect(() => {
    if (selectedSupplier && dateFrom && dateTo) {
      fetchSupplierLedger(selectedSupplier);
    }
  }, [dateFrom, dateTo]);

  const toNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/,/g, ""));
  };

  // 3️⃣ TOTALS
  const totalDebit = ledgerEntries.reduce(
    (sum, e) => sum + (toNumber(e.Credit) || 0),
    0
  );
  const totalCredit = ledgerEntries.reduce(
    (sum, e) => sum + (toNumber(e.Debit) || 0),
    0
  );
  const totalBalance = ledgerEntries.reduce(
    (sum, e) => sum + (toNumber(e.Balance) || 0),
    0
  );

  // 4️⃣ PAGINATION
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const filteredRecords = ledgerEntries.filter(
    (entry) =>
      entry.ID?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.Date?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  // console.log({ledgerEntries});
  useEffect(() => {
    if (!selectedSupplier) {
      setShowSupplierError(true);
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
              Supplier Ledger Details
            </h1>

            {ledgerEntries.length > 0 && (
              <button
                onClick={() => handleSupplierLedgerPrint(ledgerEntries)}
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
                  onChange={(e) => handleSupplierChange(e)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                >
                  <option value="">Select Supplier</option>
                  {supplierList.map((supp) => (
                    <option key={supp._id} value={supp._id}>
                      {supp.supplierName || supp.name}
                    </option>
                  ))}
                </select>
                {showSupplierError && (
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
              <div className="w-[280px] justify-end">
                <input
                  type="text"
                  placeholder="Search by ID, Description, or Date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 mb-6 focus:ring-newPrimary"
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
            ) : (
              <>
                <div className="hidden lg:grid grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  <div>SR</div>
                  <div>Date</div>
                  <div>ID</div>
                  <div>Narration</div>
                  <div>Debit</div>
                  <div>Credit</div>
                  <div>Balance</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {currentRecords.map((entry, i) => (
                    <div
                      key={entry._id || i}
                      className="grid grid-cols-[0.3fr_0.7fr_0.7fr_2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-3 hover:bg-gray-50 text-sm"
                    >
                      <div>{i + 1 + indexOfFirstRecord}</div>
                      <div>{entry.Date}</div>
                      <div>{entry.ID || "-"}</div>
                      <div>{entry.Description || "-"}</div>
                      <div>{entry.Debit || "-"}</div>
                      <div>{entry.Credit || "-"}</div>
                      <div>{entry.Balance || "-"}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-[3.7fr_1fr_1fr_1fr] whitespace-nowrap gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700">
                  <div></div>

                  <div className="text-green-600">
                    Total Debit: {totalCredit.toLocaleString()}
                  </div>

                  <div className="text-red-600">
                    Total Credit: {totalDebit.toLocaleString()}
                  </div>

                  {/* <div className="text-blue-600">
                    Total Balance: {totalBalance.toLocaleString()}
                  </div> */}

                 
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

export default SupplierLedger;
