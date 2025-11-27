import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../../context/ApiService";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";
import { Printer } from "lucide-react";
import { handleDirectPrint } from "../../../../helper/SalesPrintView";

const Sales = () => {
  const [salesmanList, setSalesmanList] = useState([]);
  const [reportData, setReportData] = useState(null); // holds whole response
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSalesmanError, setShowSalesmanError] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");

  // ✅ Fetch Salesman List
  const fetchSalesmanList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/employees/salesman");
      // console.log(response);
      
      setSalesmanList(response.employees || response);
    } catch (error) {
      console.error("Failed to fetch salesmen:", error);
    } finally {
      setLoading(false);
    }
  }, []);
// console.log({salesmanList});

  // ✅ Fetch Salesman Report
  const fetchSalesmanReport = useCallback(async () => {
    if (!selectedSalesman) {
      setShowSalesmanError(true);
      return;
    }
    if (!dateFrom) return; // only require from date
    try {
      setLoading(true);

      const from = new Date(dateFrom).toISOString().split("T")[0];
      let query = `/salesman-report/${selectedSalesman}?from=${from}`;

      if (dateTo) {
        const to = new Date(dateTo).toISOString().split("T")[0];
        query += `&to=${to}`;
      }

      const response = await api.get(query);
      const data = response;

      if (data?.success) {
        setReportData(data);
        toast.success(data.message || "Salesman report loaded");
      } else {
        setReportData(null);
        toast.error("No data found for this date or salesman");
      }
    } catch (error) {
      console.error("❌ Failed to fetch salesman report:", error);
      setTimeout(() => {
        toast.error("Error loading salesman report");
      }, 2000);

      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSalesman, dateFrom, dateTo]);

  useEffect(() => {
    fetchSalesmanList();
  }, [fetchSalesmanList]);

  useEffect(() => {
    if (selectedSalesman && dateFrom) {
      fetchSalesmanReport();
    }
  }, [selectedSalesman, dateFrom, dateTo]);

  const productSection = reportData?.productSection || [];
  const customerSection = reportData?.customerSection || [];
  const totals = reportData?.totals || { totalPurchase: 0, totalSales: 0 };

  // Seatch
  const filteredProductSection = productSection.filter(
    (item) =>
      item.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomerSection = customerSection.filter(
    (item) =>
      item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salesArea?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />

      <div className="px-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">
            Salesman Wise Sales & Recovery
          </h1>

          {productSection.length > 0 && (
            <button
              onClick={() => handleDirectPrint(reportData)}
              className="flex items-center gap-2 bg-newPrimary text-white px-4 py-2 rounded-md hover:bg-newPrimary/80"
            >
              <Printer size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-5 mb-6 w-full">
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

          {/* Salesman */}
          <div className="w-[300px]">
            <label className="block text-gray-700 font-medium mb-2">
              Sales Officer <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col">
              <select
                value={selectedSalesman}
                onChange={(e) => {
                  setSelectedSalesman(e.target.value);
                  setShowSalesmanError(false);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
              >
                <option value="">Select Sale Officer</option>
                {salesmanList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.employeeName}
                  </option>
                ))}
              </select>

              {showSalesmanError && (
                <p className="text-red-500 text-sm mt-1">
                  Please select a salesman before proceeding.
                </p>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="ml-auto w-full md:w-64">
            <input
              type="text"
              placeholder="Search by Customer, Sales Officer, Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        </div>

        {/* ================= PRODUCT SECTION ================= */}
        <div className="rounded-xl shadow-md border border-gray-200 bg-white mb-10 overflow-hidden">
          <div className="bg-newPrimary text-white py-3 px-5 text-sm font-semibold uppercase tracking-wide">
            Product-wise Sales
          </div>

          {loading ? (
            <TableSkeleton
              rows={productSection.length || 5}
              cols={9}
              className="lg:grid-cols-[0.2fr_1fr_1fr_0.7fr_0.7fr_0.4fr_0.8fr_0.8fr_0.6fr]"
            />
          ) : productSection.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No product data found.
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[0.2fr_1fr_0.7fr_0.7fr_0.4fr_0.8fr_0.8fr_0.6fr] bg-gray-50 border-b border-gray-200 py-3 px-6 text-xs font-semibold text-gray-600 uppercase text-center">
                <div>Sr</div>
                {/* <div>Supplier</div> */}
                <div>Product</div>
                {/* <div>Weight</div> */}
                <div>Purchase Price</div>
                <div>Sale Price</div>
                <div>Qty</div>
                <div>Purchase Total</div>
                <div>Sale Total</div>
                <div>Profit</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {filteredProductSection.map((row, i) => (
                  <div
                    key={i}
                    className={`grid  grid-cols-[0.2fr_1fr_0.7fr_0.7fr_0.4fr_0.8fr_0.8fr_0.6fr] items-center px-6 py-2 text-sm text-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                  >
                    <div>{i + 1}</div>
                    {/* <div className="">{row.supplier || "-"}</div> */}
                    <div className="">{row.product || "-"}</div>
                    {/* <div>{row.weight || "-"}</div> */}
                    <div>{row.purchasePrice.toLocaleString()}</div>
                    <div>{row.salePrice.toLocaleString()}</div>
                    <div>{row.qty}</div>
                    <div className="text-red-600">
                      {row.purchaseTotal.toLocaleString()}
                    </div>
                    <div className="text-green-600">
                      {row.saleTotal.toLocaleString()}
                    </div>
                    <div className="text-blue-600 font-semibold">
                      {(row.saleTotal - row.purchaseTotal).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Row */}
              <div className="grid grid-cols-[0.2fr_1fr_0.5fr_0.7fr_0.7fr_0.4fr_0.8fr_1fr_0.6fr] bg-gray-100 py-3 px-9 text-xs font-semibold text-gray-700 text-center border-t border-gray-200">
              
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className=" font-bold">Total:</div>
                <div className="text-red-600">
                  {totals.totalPurchase.toLocaleString()}
                </div>
                <div className="text-green-600">
                  {totals.totalSales.toLocaleString()}
                </div>
                <div className="text-blue-600 font-semibold">
                  {(totals.totalSales - totals.totalPurchase).toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ================= CUSTOMER SECTION ================= */}
        <div className="rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden">
          <div className="bg-newPrimary text-white py-3 px-5 text-sm font-semibold uppercase tracking-wide">
            Customer-wise Sales & Recovery
          </div>

          {loading ? (
            <TableSkeleton
              rows={customerSection.length || 5}
              cols={6}
              className="lg:grid-cols-[0.2fr_1fr_1fr_1.5fr_0.8fr_0.8fr]"
            />
          ) : customerSection.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No customer data found.
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1.5fr_0.8fr_0.8fr] bg-gray-50 border-b border-gray-200 py-3 px-6 text-xs font-semibold text-gray-600 uppercase text-center">
                <div>Sr</div>
                <div>Customer</div>
                <div>Section / Area</div>
                <div>Customer Address</div>
                <div>Sales</div>
                <div>Recovery</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {filteredCustomerSection.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[0.2fr_1fr_1fr_1.5fr_0.8fr_0.8fr] items-center px-6 py-2 text-sm text-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                  >
                    <div>{i + 1}</div>
                    <div className="">{row.customer || "-"}</div>
                    <div className="">{row.salesArea || "-"}</div>
                    <div className="">{row.customerAddress || "-"}</div>
                    <div className="text-blue-600 font-medium">
                      {row.sales.toLocaleString() || "-"}
                    </div>
                    <div className="text-green-600 font-medium">
                      {row.recovery.toLocaleString() || "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Row */}
              <div className="grid grid-cols-[0.2fr_1fr_1fr_1.5fr_0.8fr_0.8fr] bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-700 text-center border-t border-gray-200">
                <div></div>
                <div></div>
                <div></div>
                <div className="text-right pr-2 font-bold">Total:</div>
                <div className="text-blue-600">
                  {totals.totalSales.toLocaleString() || "-"}
                </div>
                <div className="text-green-600">
                  {customerSection
                    .reduce((sum, row) => sum + (row.recovery || 0), 0)
                    .toLocaleString() || "-"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
