import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";
import { handleCreditAgingPrint } from "../../../../helper/SalesPrintView";
import { Loader, Printer } from "lucide-react";

const CreditAgingReport = () => {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [salesmanData, setSalesmanData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // below your totals useState
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [totals, setTotals] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalUnderCredit: 0,
    totalDue: 0,
    totalOutstanding: 0,
  });

  const fetchSalesman = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees/salesman-done`
      );
      setSalesmanData(response?.data?.employees || response.data || []);
    } catch (error) {
      console.error("Failed to fetch Salesman:", error);
      toast.error("Error", "Failed to load Salesman", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSalesman();
  }, []);

  const fetchCreditAging = useCallback(async () => {
    if (!selectedSalesman) {
      toast.error("Please select a salesman first");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL
        }/credit-aging?salesmanId=${selectedSalesman}`
      );

      if (response.data.success) {
        setApiData(response.data.data || []);
        setTotals(response.data.totals || {});
        toast.success("Credit Aging Report loaded successfully");
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Failed to fetch credit aging data:", error);
      toast.error("Failed to load Credit Aging data");
      setApiData([]);
      setTotals({
        totalDebit: 0,
        totalCredit: 0,
        totalUnderCredit: 0,
        totalDue: 0,
        totalOutstanding: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSalesman]);

  // console.log({ apiData });

  useEffect(() => {
    if (selectedSalesman) {
      fetchCreditAging();
    } else {
      setApiData([]);
      setTotals({
        totalDebit: 0,
        totalCredit: 0,
        totalUnderCredit: 0,
        totalDue: 0,
        totalOutstanding: 0,
      });
    }
  }, [selectedSalesman, fetchCreditAging]);

  // Search
  const filteredData = apiData.filter((customer) => {
    const matchInvoices = customer.invoices.some((inv) =>
      `${inv.invoiceNo} ${inv.customerName} ${inv.salesman} ${inv.invoiceDate} ${inv.deliveryDate}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return (
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchInvoices
    );
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

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
              Credit Aging Report
            </h1>

            {apiData.length > 0 && (
              <button
                onClick={() => handleCreditAgingPrint(apiData, totals)}
                className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
              >
                <Printer size={18} />
              </button>
            )}
          </div>
          <div className="flex justify-between items-start gap-6 mb-5">
            {/* Salesman Block */}
            <div className="flex items-start gap-4">
              <label className="text-gray-700 font-medium w-24 mt-2">
                Salesman <span className="text-red-500">*</span>
              </label>

              <div>
                <select
                  value={selectedSalesman}
                  onChange={(e) => setSelectedSalesman(e.target.value)}
                  className="w-[250px] p-2 h-[42px] border border-gray-300 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-newPrimary"
                >
                  <option value="">Select Salesman</option>
                  {salesmanData.map((cust) => (
                    <option key={cust._id} value={cust._id}>
                      {cust.employeeName}
                    </option>
                  ))}
                </select>

                {!selectedSalesman && (
                  <p className="text-red-500 text-sm mt-1">
                    Please select a salesman to load report.
                  </p>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search customer, invoice no, date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 h-[42px] w-[280px] border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>


          <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <div className="max-h-screen overflow-y-auto custom-scrollbar">
                <div className="inline-block min-w-[1500px] w-full align-middle">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                    <div>SR</div>
                    <div>Customer</div>
                    <div>Salesman</div>
                    <div>Invoice No</div>
                    <div>Invoice Date</div>
                    <div>Recovery Date</div>
                    <div>Allow Days</div>
                    <div>Bill Days</div>
                    <div>Debit</div>
                    <div>Credit</div>
                    <div>Under Credit</div>
                    <div>Due</div>
                    <div>OutStanding</div>
                  </div>

                  {/* Table Body */}
                  <div className="flex flex-col divide-y divide-gray-100">
                    {loading ? (
                      <TableSkeleton
                        rows={currentRecords.length || 5}
                        cols={13}
                      />
                    ) : currentRecords.length > 0 ? (
                      currentRecords.map((customer, cIdx) => (
                        <div key={cIdx} className="bg-white">
                          {/* Customer Header */}
                          <div className="bg-blue-50 px-6 py-2 text-newPrimary font-semibold border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">
                                #{indexOfFirstRecord + cIdx + 1}.
                              </span>
                              <span className="text-base">
                                {customer.customerName}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              Total Invoices: {customer.invoices.length}
                            </span>
                          </div>

                          {/* Customer Invoices */}
                          {customer.invoices.map((inv, iIdx) => (
                            <div
                              key={iIdx}
                              className="grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-3 text-sm hover:bg-gray-50 transition"
                            >
                              <div>{iIdx + 1}</div>
                              <div>{inv.customerName || "-"}</div>
                              <div>{inv.salesman || "-"}</div>
                              <div>{inv.invoiceNo || "-"}</div>
                              <div>{inv.invoiceDate || "-"}</div>
                              <div>{inv.deliveryDate || "-"}</div>
                              <div>{inv.allowDays ?? "-"}</div>
                              <div>{inv.billDays ?? "-"}</div>
                              <div>{inv.debit.toLocaleString() || "-"}</div>
                              <div>{inv.credit.toLocaleString() || "-"}</div>
                              <div className="text-green-600 font-semibold">
                                {inv.underCredit.toLocaleString() ?? "-"}
                              </div>
                              <div
                                className={`font-semibold ${inv.due > 0 ? "text-red-600" : "text-gray-500"
                                  }`}
                              >
                                {inv.due.toLocaleString() ?? "-"}
                              </div>
                               <div>{inv.outstanding.toLocaleString() || "-"}</div>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No credit aging data available
                      </div>
                    )}
                  </div>

                  {/* Totals Footer */}
                  {currentRecords.length > 0 && (
                    <div className="grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className=""></div>
                      <div className="col-span-8 text-right">Totals:</div>
                      <div className="text-blue-600">
                        Debit: {totals.totalDebit.toLocaleString()}
                      </div>
                      <div className="text-green-600">
                        Credit: {totals.totalCredit.toLocaleString()}
                      </div>
                      <div className="text-orange-600">
                        Under Credit: {totals.totalUnderCredit.toLocaleString()}
                      </div>
                      <div className="text-red-600">
                        Due: {totals.totalDue.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl mt-2 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1}–
                    {Math.min(indexOfLastRecord, currentRecords.length)} of{" "}
                    {currentRecords.length} customers
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

          {/* Scrollbar styling */}
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

export default CreditAgingReport;
