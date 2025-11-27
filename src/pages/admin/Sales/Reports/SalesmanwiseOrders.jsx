import React, { useState, useEffect, useRef, useCallback } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import { api } from "../../../../context/ApiService";
import { Eye } from "lucide-react";
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Component for displaying Salesmanwise Order Details
 *
 * @param {array} ledgerEntries - Array of ledger entries
 * @param {string} ledgerId - Ledger ID
 * @param {string} date - Date
 * @param {string} salesInvoice - Invoice No
 * @param {string} status - Order Status
 *
 * @returns {JSX.Element} - The rendered JSX element
 */
/*******  660d969d-8881-4678-965d-3c6d61032962  *******/ import ViewModal from "../../../../helper/ViewModel";

const SalesmanwiseOrders = () => {
  const [isView, setIsView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [salesman, setSalesman] = useState([]);
  const [salesmanList, setSalesmanList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [selectedSalesman, setSelectedSalesman] = useState(""); // for selected ID

  // fetch Salesman
  const fetchSalesman = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/employees/reports");
      setSalesman(response); // ✅ use .data
      // console.log("Salesman List:", response);
    } catch (error) {
      console.error("Failed to fetch salesman list", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  useEffect(() => {
    fetchSalesman();
  }, [fetchSalesman]);

  // fetch Salesman List by ID
  const fetchSalesmanList = useCallback(async (id) => {
    if (!id) {
      // console.log("No customer selected yet");
      return; // don’t run when nothing selected
    }

    try {
      setLoading(true);
      const response = await api.get(`/sales-report/salesmanwise/${id}`);
      setSalesmanList(response.data);
      // console.log("Salesman Data:", response.data);
    } catch (error) {
      console.error("Failed to fetch salesman list", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  // useEffect example
  useEffect(() => {
    if (selectedSalesman) {
      fetchSalesmanList(selectedSalesman);
    }
  }, [selectedSalesman, fetchSalesmanList]);

  // ✅ Pagination logic (based on salesmanList)
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = salesmanList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(salesmanList.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSalesman]);

  // console.log("Tttsstts ", salesmanList);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              Salesmanwise Order Details
            </h1>
          </div>
          <div className="flex items-center gap-3"></div>
        </div>
        <div className="flex gap-6">
          {/* Left Filter Section */}
          <div className="w-full">
            <div className="space-y-5">
              <div className="flex gap-5">
                {/* Customer Selection */}
                <div className="w-[400px]">
                  <label className="block text-gray-700 font-medium mb-2">
                    Salesman <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSalesman}
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    required
                  >
                    <option value="">Select Salesman</option>
                    {salesman?.map((cust) => (
                      <option key={cust._id} value={cust._id}>
                        {cust.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Form Content */}
          <div className="flex-1">{/* your main form fields go here */}</div>
        </div>

        <div className="p-0">
          {/* Selection Form */}
          <div className="rounded-xl shadow border border-gray-200 overflow-hidden mt-6">
            {selectedSalesman ? (
              <div className="overflow-y-auto lg:overflow-x-auto max-h-[900px]">
                <div className="min-w-full custom-scrollbar">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                    <div>SR</div>
                    <div>Invoice No</div>
                    <div>Invoice Date</div>
                    <div>Order ID</div>
                    <div>Customer Name</div>
                    <div>Salesman</div>
                    <div>Total Amount</div>
                    <div>View</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col divide-y divide-gray-100">
                    {loading ? (
                      <TableSkeleton
                        rows={salesmanList.length || 5}
                        cols={8}
                        className="lg:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                      />
                    ) : salesmanList.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-white">
                        No records found for this Salesman.
                      </div>
                    ) : (
                      <>
                        {salesmanList.length > 0 ? (
                          currentRecords.map((entry, index) => (
                            <div
                              key={entry._id}
                              className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                            >
                              <div className="text-gray-600">
                                {indexOfFirstRecord + index + 1}
                              </div>

                              <div className="text-gray-600">
                                {entry.invoiceNo}
                              </div>
                              <div className="text-gray-600">
                                {new Date(
                                  entry.invoiceDate
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-gray-600">
                                {entry?.orderTakingId?.orderId || "N/A"}
                              </div>
                              <div className="text-gray-600">
                                {entry?.orderTakingId?.customerId
                                  ?.customerName || "N/A"}
                              </div>
                              <div className="text-gray-600">
                                {entry?.salesmanId?.employeeName}
                              </div>
                              <div className="text-gray-600">
                                {entry?.totalAmount}
                              </div>
                              <div className="">
                                <div>
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(entry);
                                      setIsView(true);
                                    }}
                                    className="text-amber-600 hover:bg-amber-50 rounded p-1"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 bg-white">
                            No records found for this salesman.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                      <p className="text-sm text-gray-600">
                        Showing {indexOfFirstRecord + 1} to{" "}
                        {Math.min(indexOfLastRecord, salesmanList.length)} of{" "}
                        {salesmanList.length} records
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
            ) : (
              <div className="text-center py-6 text-gray-500 bg-white rounded-lg mt-6">
                Please select a salesman to view salesman entries.
              </div>
            )}
          </div>
        </div>

        {/* ✅ View Modal */}
        {isView && selectedOrder && (
          <ViewModal
            type="salesmanwise"
            data={selectedOrder}
            onClose={() => setIsView(false)}
          />
        )}

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #edf2f7;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a0aec0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SalesmanwiseOrders;
