import React, { useRef } from "react";
import { X } from "lucide-react";

const ViewModal = ({ type, data, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>${type} Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handlePDF = () => {
    alert("PDF export coming soon 🚀");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[750px] rounded-xl shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div ref={printRef}>
          <div className="text-center mb-6  pb-3">
            <h1 className="text-2xl font-extrabold text-newPrimary tracking-wide">
              Distribution System Pvt. Ltd.
            </h1>
            <p className="text-gray-700 text-sm mt-1">Mall of Lahore, Cantt</p>
            <p className="text-gray-700 text-sm">
              Phone: <span className="font-medium">0318-4486979</span>
            </p>
          </div>

          {/* 🔹 Dynamic Heading */}
          <h2 className="text-2xl font-bold mb-6 pb-2">
            {type === "loadsheet"
              ? "Loadsheet Details"
              : type === "order"
              ? "Order Details"
              : type === "DateWise-Sales"
              ? "DateWise Sales"
              : type === "productwise"
              ? "Product-Wise Invoice Details"
              : type === "salesmanwise"
              ? "Salesman-Wise Invoice Details"
              : type === "customerwise"
              ? "Customer-Wise Invoice Details"
              : type === "grn"
              ? "Goods Received Note (GRN)"
              : "Details"}
          </h2>

          {/* 🔹 Info Sections */}
          <div className="grid grid-cols-2 gap-4 text-base mb-6">
            {/* ✅ GRN DETAILS SECTION */}
            {type === "grn" && (
              <>
                <div>
                  <strong>GRN ID:</strong> {data.grnId}
                </div>
                <div>
                  <strong>GRN Date:</strong> {data.grnDate}
                </div>
                <div>
                  <strong>Supplier:</strong>{" "}
                  {data.supplier?.supplierName || "-"}
                </div>
                <div>
                  <strong>Sales Tax :</strong>{" "}
                  {data.salesTax ? `${parseFloat(data.salesTax)}%` : "0%"}
                </div>
                <div>
                  <strong>Total Amount:</strong>{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
              </>
            )}

            {/* ---- EXISTING SECTIONS (UNCHANGED) ---- */}

            {type === "productwise" && (
              <>
                <div>
                  <strong>Invoice No:</strong> {data.invoiceNo}
                </div>
                <div>
                  <strong>Invoice Date:</strong>{" "}
                  {new Date(data.invoiceDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Order ID:</strong> {data.orderTakingId?.orderId}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {data.orderTakingId?.customerId?.customerName}
                </div>
                <div>
                  <strong>Salesman:</strong> {data.salesmanId?.employeeName}
                </div>
                <div>
                  <strong>Total Quantity:</strong> {data.totalQty}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs.{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}

            {type === "customerwise" && (
              <>
                <div>
                  <strong>Invoice No:</strong> {data.invoiceNo}
                </div>
                <div>
                  <strong>Invoice Date:</strong>{" "}
                  {new Date(data.invoiceDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {data.orderTakingId?.customerId?.customerName}
                </div>
                <div>
                  <strong>Customer Phone:</strong>{" "}
                  {data.orderTakingId?.customerId?.phoneNumber}
                </div>
                <div>
                  <strong>Salesman:</strong> {data.salesmanId?.employeeName}
                </div>
                <div>
                  <strong>Order ID:</strong> {data.orderTakingId?.orderId}
                </div>
                <div>
                  <strong>Total Quantity:</strong> {data.totalQty}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs.{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}

            {type === "salesmanwise" && (
              <>
                <div>
                  <strong>Invoice No:</strong> {data.invoiceNo}
                </div>
                <div>
                  <strong>Invoice Date:</strong>{" "}
                  {new Date(data.invoiceDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Order ID:</strong>{" "}
                  {data.orderTakingId?.orderId || "N/A"}
                </div>

                <div>
                  <strong>Salesman:</strong> {data.salesmanId?.employeeName}
                </div>
                <div>
                  <strong>Total Quantity:</strong> {data.totalQty}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs.{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}

            {type === "order" && (
              <>
                <div>
                  <strong>Order ID:</strong> {data.orderId}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(data.date).toLocaleDateString() || "-"}
                </div>
                <div>
                  <strong>Salesman:</strong>{" "}
                  {data.salesmanId?.employeeName || "-"}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {data.customerId?.customerName || "-"}
                </div>
                <div>
                  <strong>Phone:</strong> {data.customerId?.phoneNumber || "-"}
                </div>
                <div>
                  <strong>Address:</strong> {data.customerId?.address}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}

            {type === "loadsheet" && (
              <>
                <div>
                  <strong>Load No:</strong> {data.loadNo}
                </div>
                <div>
                  <strong>Load Date:</strong>{" "}
                  {new Date(data.loadDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Salesman:</strong> {data.salesmanId?.employeeName}
                </div>
                <div>
                  <strong>Vehicle No:</strong> {data.vehicleNo}
                </div>
                <div>
                  <strong>Pre-Balance:</strong> Rs.{" "}
                  {data.salesmanId?.preBalance?.toLocaleString()}
                </div>
                <div>
                  <strong>Total Quantity:</strong> {data.totalQty}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs.{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {new Date(data.createdAt).toLocaleString()}
                </div>
              </>
            )}

            {type === "DateWise-Sales" && (
              <>
                <div>
                  <strong>Invoice No:</strong> {data.invoiceNo}
                </div>
                <div>
                  <strong>Invoice Date:</strong>{" "}
                  {new Date(data.invoiceDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Order ID:</strong> {data.orderTakingId?.orderId}
                </div>
                <div>
                  <strong>Customer:</strong>{" "}
                  {data.orderTakingId?.customerId?.customerName}
                </div>
                <div>
                  <strong>Salesman:</strong> {data.salesmanId?.employeeName}
                </div>
                <div>
                  <strong>Total Quantity:</strong> {data.totalQty}
                </div>
                <div>
                  <strong>Total Amount:</strong> Rs.{" "}
                  {data.totalAmount?.toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {data.status}
                </div>
              </>
            )}
          </div>

          {/* 🔹 Items Table */}
          <table className="w-full border text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th>Sr #</th>

                {/* GRN Columns */}
                {type === "grn" && (
                  <>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>GST</th>
                    <th>Total</th>
                  </>
                )}

                {/* Existing Columns */}
                {(type === "DateWise-Sales" ||
                  type === "productwise" ||
                  type === "salesmanwise" ||
                  type === "customerwise") && (
                  <>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Issue</th>
                    <th>Sold</th>
                    <th>Return</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </>
                )}

                {type === "loadsheet" && (
                  <>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Pack</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </>
                )}

                {type === "order" && (
                  <>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {/* GRN Items */}
              {type === "grn" &&
                (data.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-center py-2">{idx + 1}</td>
                    <td className="text-center">{item.item}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-center">{item.rate}</td>
                    <td className="text-center">{item.gst}%</td>
                    <td className="text-center">
                      {item.total?.toLocaleString()}
                    </td>
                  </tr>
                ))}

              {/* Existing Items */}
              {(data.products || []).map((item, idx) => (
                <tr key={idx}>
                  {/* Already handled above for GRN */}
                  {type !== "grn" && <td className="text-center">{idx + 1}</td>}

                  {(type === "DateWise-Sales" ||
                    type === "productwise" ||
                    type === "salesmanwise" ||
                    type === "customerwise") && (
                    <>
                      <td className="text-center">
                        {item.categoryName || "-"}
                      </td>
                      <td className="text-center">{item.itemName || "-"}</td>
                      <td className="text-center">{item.issue || 0}</td>
                      <td className="text-center">{item.sold || 0}</td>
                      <td className="text-center">{item.return || 0}</td>
                      <td className="text-center">{item.rate || "-"}</td>
                      <td className="text-center">
                        {item.totalAmount
                          ? item.totalAmount.toLocaleString()
                          : "-"}
                      </td>
                    </>
                  )}

                  {type === "loadsheet" && (
                    <>
                      <td className="text-center">{item.category || "-"}</td>
                      <td className="text-center">{item.item}</td>
                      <td className="text-center">{item.pack}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-center">
                        {item.amount ? item.amount.toLocaleString() : "-"}
                      </td>
                    </>
                  )}

                  {type === "order" && (
                    <>
                      <td className="text-center">{item.itemName}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-center">{item.itemUnit}</td>
                      <td className="text-center">{item.rate}</td>
                      <td className="text-center">
                        {item.totalAmount
                          ? item.totalAmount.toLocaleString()
                          : "-"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 Footer Buttons
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handlePDF}
            className="px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Print
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ViewModal;
