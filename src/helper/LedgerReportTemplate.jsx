import React from "react";

export const LedgerTemplate = React.forwardRef(({ ledgerEntries }, ref) => {
  if (!ledgerEntries || ledgerEntries.length === 0) return null;

  const firstEntry = ledgerEntries[0];

  // Totals
  const totalPaid = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Paid) || 0),
    0
  );
  const totalReceived = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Received) || 0),
    0
  );
  const totalBalance = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Balance) || 0),
    0
  );

  return (
    <div
      ref={ref}
      className="w-[800px] bg-white text-black p-8 border rounded-xl font-sans"
      style={{ fontSize: "12px" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Infinity Distribution System Pvt. Ltd.</h1>
          <p>Mall of Lahore</p>
          <p>Customer Ledger Report</p>
        </div>
        <div className="text-right">
          <p>
            <b>Date:</b> {new Date().toLocaleDateString()}
          </p>
          <p>
            <b>Customer:</b> {firstEntry.CustomerName}
          </p>
          <p>
            <b>Phone:</b> {firstEntry.Phone}
          </p>
          <p>
            <b>Address:</b> {firstEntry.Address}
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr className="bg-gray-200 border border-gray-400">
            <th className="border border-gray-400 p-1">Sr</th>
            <th className="border border-gray-400 p-1">Date</th>
            <th className="border border-gray-400 p-1">ID</th>
            <th className="border border-gray-400 p-1">Description</th>
            <th className="border border-gray-400 p-1">Paid</th>
            <th className="border border-gray-400 p-1">Received</th>
            <th className="border border-gray-400 p-1">Balance</th>
          </tr>
        </thead>
        <tbody>
          {ledgerEntries.map((entry, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="border border-gray-400 p-1 text-center">
                {entry.SR}
              </td>
              <td className="border border-gray-400 p-1 text-center">
                {entry.Date}
              </td>
              <td className="border border-gray-400 p-1 text-center">
                {entry.ID}
              </td>
              <td className="border border-gray-400 p-1 text-center">
                {entry.Description}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {parseFloat(entry.Paid).toLocaleString()}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {parseFloat(entry.Received).toLocaleString()}
              </td>
              <td className="border border-gray-400 p-1 text-right">
                {parseFloat(entry.Balance).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 text-right space-y-1 text-sm">
        <p>
          <b>Total Paid:</b> {totalPaid.toLocaleString()}
        </p>
        <p>
          <b>Total Received:</b> {totalReceived.toLocaleString()}
        </p>
        <p className="font-bold text-lg">
          Closing Balance: Rs. {totalBalance.toLocaleString()}
        </p>
      </div>

      <p className="text-xs mt-6 text-center text-gray-500">
        This is a system-generated ledger report and does not require a
        signature.
      </p>
    </div>
  );
});
