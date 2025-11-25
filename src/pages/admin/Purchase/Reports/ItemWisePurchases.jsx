import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../../context/ApiService";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import Swal from "sweetalert2";
import TableSkeleton from "../../Components/Skeleton";
import { handleItemWisePrint } from "../../../../helper/SalesPrintView";
import { Loader, Printer } from "lucide-react";

const ItemWisePurchase = () => {
  const [itemList, setItemList] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [showItemError, setShowItemError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // ================= 1️⃣ FETCH ITEMS LIST =================
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/order-taker`
      );
      setItemList(res.data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      Swal.fire("Error", "Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= 2️⃣ FETCH ITEMWISE PURCHASE REPORT =================
  const fetchItemwiseReport = useCallback(async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);

      // ✅ Build query dynamically before calling API
      let query = `${
        import.meta.env.VITE_API_BASE_URL
      }/reports/itemwise?itemName=${encodeURIComponent(selectedItem)}`;

      if (dateFrom && dateTo) {
        query += `&from=${dateFrom}&to=${dateTo}`;
      }

      const response = await axios.get(query);

      const report = response.data?.data || response.data || [];

      const transformed = report.map((entry, index) => ({
        SR: index + 1,
        Date: new Date(entry.Date).toLocaleDateString(),
        ID: entry.ID,
        SupplierName: entry.SupplierName,
        Item: entry.Item,
        Rate: entry.Rate,
        Qty: entry.Qty,
        Amount: entry.Amount,
        Total: entry.Total,
      }));

      setLedgerEntries(transformed);
    } catch (error) {
      console.error("Failed to fetch itemwise purchase report:", error);
      Swal.fire("Error", "Failed to load purchase data", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedItem, dateFrom, dateTo]);

  // INITIAL LOAD (items only)
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // FETCH REPORT WHEN ITEM / DATE CHANGES
  useEffect(() => {
    if (selectedItem) fetchItemwiseReport();
  }, [fetchItemwiseReport]);

  // ================= 3️⃣ PAGINATION =================
  // 🔍 SEARCH FILTER
  const filteredEntries = ledgerEntries.filter((entry) => {
    const q = searchQuery.toLowerCase();

    return (
      entry.ID?.toString().toLowerCase().includes(q) ||
      entry.SupplierName?.toLowerCase().includes(q) ||
      entry.Item?.toLowerCase().includes(q)
    );
  });

  // 🔢 PAGINATION (USE FILTERED DATA)
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEntries.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEntries.length / recordsPerPage);
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);

  // console.log({ ledgerEntries });
  useEffect(() => {
    if (!selectedItem) {
      setShowItemError(true);
    }
  }, []);

  const totalNetAmount = ledgerEntries.reduce(
    (sum, entry) => sum + Number(entry.Amount || 0),
    0
  );

  const filteredEntries = ledgerEntries.filter((entry) => {
  const term = searchQuery.toLowerCase();

  return (
    entry.ID?.toLowerCase().includes(term) ||
    entry.SupplierName?.toLowerCase().includes(term) ||
    entry.Item?.toLowerCase().includes(term)
  );
});

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
              Item Wise Purchase
            </h1>

            {ledgerEntries.length > 0 && (
              <button
                onClick={() => handleItemWisePrint(ledgerEntries)}
                className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
              >
                <Printer size={18} />
              </button>
            )}
          </div>

          {/* ================= FILTER SECTION ================= */}
          <div className="">
            <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
              <div className="flex gap-3">
                {/* Item Dropdown */}
                <div className="w-[300px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Item *
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => {
                      setSelectedItem(e.target.value);
                      setShowItemError(false); // hide error once user selects
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Choose Item</option>
                    {itemList.map((item) => (
                      <option key={item._id} value={item.itemName}>
                        {item.itemName}
                      </option>
                    ))}
                  </select>
                  {showItemError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select an item before proceeding.
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

                {/* Filter Button */}
                <div
                  className={`${
                    showItemError ? "items-center" : "items-end"
                  } flex `}
                >
                  <button
                    onClick={fetchItemwiseReport}
                    disabled={!selectedItem}
                    className="bg-newPrimary text-white px-6 py-3 rounded-md hover:bg-newPrimary/80 disabled:bg-gray-400"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-[280px]">
                <label className="block text-gray-700 font-medium mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by GRN ID, Supplier, or Item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                />
              </div>
            </div>
          </div>

          {/* ================= TABLE SECTION ================= */}
          <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
            {loading ? (
              <TableSkeleton rows={5} cols={8} />
            ) : !selectedItem ? (
              <div className="text-center py-6 text-gray-500">
                Please select an item to view purchase details.
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No purchase records found for this item.
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="hidden lg:grid grid-cols-[0.3fr_1fr_1fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase">
                  <div>SR</div>
                  <div>Date</div>
                  <div>ID</div>
                  <div>Supplier Name</div>
                  <div>Item</div>
                  <div>Rate</div>
                  <div>Qty</div>
                  <div>Total Amount</div>
                  <div>Net Amount</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {currentRecords.map((entry, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[0.3fr_1fr_1fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] items-center px-6 py-3 hover:bg-gray-50 text-sm"
                    >
                      <div>{i + 1 + indexOfFirstRecord}</div>
                      <div>{entry.Date || "-"}</div>
                      <div>{entry.ID || "-"}</div>
                      <div>{entry.SupplierName || "-"}</div>
                      <div>{entry.Item || "-"}</div>
                      <div>{entry.Rate || "-"}</div>
                      <div>{entry.Qty || "-"}</div>
                      <div>{entry.Total || "-"}</div>
                      <div>{entry.Amount || "-"}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TOTAL NET AMOUNT ROW */}
            {ledgerEntries.length > 0 && (
              <div className="grid grid-cols-[0.3fr_1fr_1fr_1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-sm font-semibold text-gray-700 border-t">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className="text-right">Total Amount:</div>

                {/* Total Amount Column */}
                <div className="text-blue-600">
                  {totalNetAmount.toLocaleString("en-PK", {
                    style: "currency",
                    currency: "PKR",
                    minimumFractionDigits: 0,
                  })}
                </div>
              </div>
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

export default ItemWisePurchase;
