import React, { useRef } from "react";
import { X } from "lucide-react";

const ViewInvoiceModal = ({ data, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Invoice Details</title>
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[750px] rounded-xl shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div ref={printRef}>
          {/* Header */}
          <div className="text-center mb-6 pb-3">
            <h1 className="text-2xl font-extrabold text-newPrimary tracking-wide">
              City Trader Pvt. Ltd.
            </h1>
            <p className="text-gray-700 text-sm mt-1">Taj Pura Lahore</p>
            <p className="text-gray-700 text-sm">
              Phone: <span className="font-medium">0318-4486979</span>
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-4 pb-2 text-center">
            Invoice Details
          </h2>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 text-base mb-6">
            <div>
              <strong>Invoice No:</strong> {data.invoiceNo}
            </div>
            <div>
              <strong>Invoice Date:</strong>{" "}
              {new Date(data.invoiceDate).toLocaleDateString()}
            </div>

            <div>
              <strong>Order ID:</strong> {data.orderTakingId?.orderId || "-"}
            </div>
            <div>
              <strong>Customer:</strong> {data.customerId?.customerName}
            </div>

            <div>
              <strong>Phone:</strong> {data.customerId?.phoneNumber}
            </div>
            <div>
              <strong>Address:</strong> {data.customerId?.address}
            </div>

            <div>
              <strong>Salesman:</strong> {data.salesmanId?.employeeName || "-"}
            </div>
            <div>
              <strong>Status:</strong> {data.status}
            </div>

            <div>
              <strong>Total Amount:</strong> Rs.{" "}
              {data.totalAmount?.toLocaleString()}
            </div>
            <div>
              <strong>Discount:</strong> Rs. {data.discount?.toLocaleString()}
            </div>

            <div>
              <strong>Receivable:</strong> Rs.{" "}
              {data.receivable?.toLocaleString()}
            </div>
            <div>
              <strong>Received:</strong> Rs. {data.received?.toLocaleString()}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th>Sr #</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {(data.products || []).map((item, idx) => (
                <tr key={idx} className="">
                  <td className="text-center py-2">{idx + 1}</td>
                  <td className="text-center">{item.itemName}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-center">{item.rate}</td>
                  <td className="text-center">{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoiceModal;
