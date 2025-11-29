import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";
import { Loader, Printer } from "lucide-react";
import { handleSupplierAgingPrint } from "../../../../helper/SalesPrintView";

const SupplierAging = () => {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [selectedSupplier, setSelectedSupplier] = useState("");

  const [totals, setTotals] = useState({
    totalDues: 0,
    totalOverDues: 0,
    totalBalance: 0,
  });

  /** Fetch Suppliers */
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierData(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);
//   console.log({ supplierData });

  /** Fetch Supplier Aging */
  const fetchSupplierAging = useCallback(async () => {
    if (!selectedSupplier) {
      toast.error("Please select supplier first");
      return;
    }
    // console.log({ selectedSupplier });

    try {
      setLoading(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/credit-aging/supplier?supplierId=${selectedSupplier}`
      );

      if (res.data.success) {
        setApiData(res.data.data || []);
        setTotals(res.data.totals || {});
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch supplier aging");
      setApiData([]);
      setTotals({
        totalDues: 0,
        totalOverDues: 0,
        totalBalance: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier]);

//   console.log({ apiData });

  useEffect(() => {
    if (selectedSupplier) {
      fetchSupplierAging();
    } else {
      setApiData([]);
      setTotals({
        totalDues: 0,
        totalOverDues: 0,
        totalBalance: 0,
      });
    }
  }, [selectedSupplier, fetchSupplierAging]);

  /** Searching */
  const term = searchTerm.toLowerCase();

const filteredData = apiData.filter(row =>
  [row.supplier, row.grnNo, row.grnDate]
    .some(val => (val ?? "").toString().toLowerCase().includes(term)) ||
  [row.dues, row.overDues, row.balance]
    .some(num => num?.toString().includes(searchTerm))
);


  /** Pagination */
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      {loading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className="animate-spin" />
        </div>
      ) : (
        <div className="px-6 mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-newPrimary">
              Supplier Aging Report
            </h1>
            {apiData.length > 0 && (
              <button
                onClick={() => handleSupplierAgingPrint(apiData, totals)}
                className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
              >
                <Printer size={18} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex justify-between items-start gap-6 mb-5">
            {/* Supplier Select */}
            <div className="flex items-start gap-4">
              <label className="text-gray-700 flex font-medium w-24 mt-2">
                Supplier <span className="text-red-500 ml-1">*</span>
              </label>

              <div>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-[250px] p-2 h-[42px] border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-newPrimary"
                >
                  <option value="">Select Supplier</option>
                  {supplierData.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
                {!selectedSupplier && (
                  <p className="text-red-500 text-sm mt-1">
                    Please select a supplier to load report.
                  </p>
                )}
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search supplier, grn no, date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 h-[42px] w-[280px] border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          {/* Table Container */}
          <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <div className="max-h-screen overflow-y-auto custom-scrollbar">
                <div className="inline-block min-w-[1300px] w-full align-middle">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                    <div>SR</div>
                    <div>Supplier</div>
                    <div>GRN#</div>
                    <div>GRN Date</div>
                    <div>Over Days</div>
                    <div>Bill Days</div>
                    <div>Dues</div>
                    <div>Over Dues</div>
                    <div>Balance</div>
                  </div>

                  {/* Table Body */}
                  <div className="flex flex-col divide-y divide-gray-100">
                    {currentRecords.length > 0 ? (
                      currentRecords.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-3 text-sm hover:bg-gray-50 transition"
                        >
                          <div>{row.sr}</div>
                          <div>{row.supplier || "-"}</div>
                          <div>{row?.grnNo || "-"}</div> {/* No GRN# in API */}
                          <div>{row.grnDate || "-"}</div>
                          <div>{row.overDays ?? 0}</div>
                          <div>{row.billDays ?? 0}</div>
                          <div>{row.dues?.toLocaleString() ?? 0}</div>
                          <div>{row.overDues?.toLocaleString() ?? 0}</div>
                          <div>{row.balance?.toLocaleString() ?? 0}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No supplier aging data available
                      </div>
                    )}
                  </div>

                  {/* Totals Footer */}
                  {/* {currentRecords.length > 0 && (
                    <div className="grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      <div className="col-span-5"></div>

                      <div className="text-blue-600">
                        Dues: {(totals.totalDues ?? 0).toLocaleString()}
                      </div>
                      <div className="text-red-600">
                        Over Dues:{" "}
                        {(totals.totalOverDues ?? 0).toLocaleString()}
                      </div>
                      <div className="text-green-600">
                        Balance: {(totals.totalBalance ?? 0).toLocaleString()}
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl mt-2 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirst + 1}–
                    {Math.min(indexOfLast, currentRecords.length)} of{" "}
                    {currentRecords.length} suppliers
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

          {/* Scrollbar Styling */}
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
      )}
    </div>
  );
};

export default SupplierAging;
