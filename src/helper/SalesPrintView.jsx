import Swal from "sweetalert2";

export const handleDirectPrint = (reportData = {}) => {
  const {
    productSection = [],
    customerSection = [],
    totals = {},
    salesman,
    date,
  } = reportData;

  if (!productSection.length && !customerSection.length) {
    Swal.fire("No Data", "There is no data to print!", "warning");
    return;
  }

  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Salesman Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1, h2, h3, p { margin: 0; text-align: center; }
          h1 { font-size: 24px; font-weight: bold; }
          h2 { font-size: 18px; margin-top: 15px; text-decoration: underline; }
          p { font-size: 13px; color: #555; margin: 4px 0; }
          hr { border: 0; border-top: 1px solid #ccc; margin: 10px 0 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: center; }
          th { background: #f3f3f3; font-weight: bold; }
          tfoot td { font-weight: bold; background: #fafafa; }
        </style>
      </head>
      <body>
        <!-- 🔹 Header -->
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />

        <h2>Salesman Daily Report</h2>
        <p><b>Salesman:</b> ${salesman || "-"} | <b>Date:</b> ${new Date(
    date
  ).toLocaleDateString()}</p>

        <!-- 🔹 PRODUCT SECTION -->
        ${
          productSection.length
            ? `
          <h3 style="text-align:left; margin-top:25px;">Product-wise Sales</h3>
          <table>
            <thead>
              <tr>
                <th>Sr</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Qty</th>
                <th>Purchase Total</th>
                <th>Sale Total</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              ${productSection
                .map(
                  (p, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${p.supplier || "-"}</td>
                    <td>${p.product || "-"}</td>
                    <td>${p.purchasePrice?.toLocaleString() || 0}</td>
                    <td>${p.salePrice?.toLocaleString() || 0}</td>
                    <td>${p.qty || 0}</td>
                    <td>${p.purchaseTotal?.toLocaleString() || 0}</td>
                    <td>${p.saleTotal?.toLocaleString() || 0}</td>
                    <td>${(
                      (p.saleTotal || 0) - (p.purchaseTotal || 0)
                    ).toLocaleString()}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align:right;">Totals:</td>
                <td>${totals.totalPurchase?.toLocaleString() || 0}</td>
                <td>${totals.totalSales?.toLocaleString() || 0}</td>
                <td>${(
                  (totals.totalSales || 0) - (totals.totalPurchase || 0)
                ).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          `
            : "<p style='text-align:center;margin-top:10px;color:#999;'>No product data found.</p>"
        }

        <!-- 🔹 CUSTOMER SECTION -->
        ${
          customerSection.length
            ? `
          <h3 style="text-align:left; margin-top:35px;">Customer-wise Sales & Recovery</h3>
          <table>
            <thead>
              <tr>
                <th>Sr</th>
                <th>Customer</th>
                <th>Sales Area</th>
                <th>Address</th>
                <th>Sales</th>
                <th>Recovery</th>
              </tr>
            </thead>
            <tbody>
              ${customerSection
                .map(
                  (c, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${c.customer || "-"}</td>
                    <td>${c.salesArea || "-"}</td>
                    <td>${c.customerAddress || "-"}</td>
                    <td>${c.sales?.toLocaleString() || 0}</td>
                    <td>${c.recovery?.toLocaleString() || 0}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align:right;">Totals:</td>
                <td>${totals.totalSales?.toLocaleString() || 0}</td>
                <td>${customerSection
                  .reduce((sum, c) => sum + (c.recovery || 0), 0)
                  .toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          `
            : "<p style='text-align:center;margin-top:10px;color:#999;'>No customer data found.</p>"
        }

        <p style="margin-top:30px; font-size:11px; color:#777; text-align:center;">
          This is a system-generated Salesman Report and does not require a signature.
        </p>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
};

export const handleLedgerPrint = (ledgerEntries = []) => {
  if (!ledgerEntries.length) return;

  const firstEntry = ledgerEntries[0];

  // 🧮 Totals
  const totalQty = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Qty) || 0),
    0
  );
  const totalAmount = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Amount) || 0),
    0
  );
  const totalOverall = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Total) || 0),
    0
  );

  // 🪟 Open printable window
  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Supplier Wise Purchase Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>Supplier-Wise Purchase Report</h2>

        <div style="margin-bottom:10px; font-size:13px;">
          <b>Date:</b> ${new Date().toLocaleDateString()}<br/>
          <b>Supplier:</b> ${firstEntry.SupplierName || "-"}<br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Date</th>
              <th>ID</th>
              <th>Supplier Name</th>
              <th>Item</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerEntries
              .map(
                (entry, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${entry.Date || "-"}</td>
                    <td>${entry.ID || "-"}</td>
                    <td>${entry.SupplierName || "-"}</td>
                    <td>${entry.Item || "-"}</td>
                    <td>${parseFloat(entry.Rate || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Qty || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Amount || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Total || 0).toLocaleString()}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right;">Totals:</td>
              <td>-</td>
              <td>${totalQty.toLocaleString()}</td>
              <td>${totalAmount.toLocaleString()}</td>
              <td>${totalOverall.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated supplier-wise purchase report and does not require a signature.
        </p>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

export const handleItemWisePrint = (ledgerEntries = []) => {
  if (!ledgerEntries.length) return;

  const firstEntry = ledgerEntries[0];

  // 🧮 Totals
  const totalQty = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Qty) || 0),
    0
  );
  const totalAmount = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Total) || 0),
    0
  );
  const totalOverall = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.Amount) || 0),
    0
  );

  // 🪟 Open printable window
  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Item Wise Purchase Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>Item-Wise Purchase Report</h2>

        <div style="margin-bottom:10px; font-size:13px;">
          <b>Date:</b> ${new Date().toLocaleDateString()}<br/>
          <b>Supplier:</b> ${firstEntry.SupplierName || "-"}<br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Date</th>
              <th>ID</th>
              <th>Supplier Name</th>
              <th>Item</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Total Amount</th>
              <th>
Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerEntries
              .map(
                (entry, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${entry.Date || "-"}</td>
                    <td>${entry.ID || "-"}</td>
                    <td>${entry.SupplierName || "-"}</td>
                    <td>${entry.Item || "-"}</td>
                    <td>${parseFloat(entry.Rate || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Qty || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Total || 0).toLocaleString()}</td>
                    <td>${parseFloat(entry.Amount || 0).toLocaleString()}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right;">Totals:</td>
              <td>-</td>
              <td>${totalQty.toLocaleString()}</td>
              <td>${totalAmount.toLocaleString()}</td>
              <td>${totalOverall.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated supplier-wise purchase report and does not require a signature.
        </p>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

export const handleSupplierLedgerPrint = (ledgerEntries = []) => {
  console.log(ledgerEntries);

  if (!ledgerEntries.length) return;

  const firstEntry = ledgerEntries[0];

  // Helper to convert comma values "1,500" → 1500
  const toNum = (v) => parseFloat(String(v || "0").replace(/,/g, ""));

  // Totals
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + toNum(e.Debit), 0);

  const totalCredit = ledgerEntries.reduce(
    (sum, e) => sum + toNum(e.Credit),
    0
  );

  const totalBalance = ledgerEntries.reduce(
    (sum, e) => sum + toNum(e.Balance),
    0
  );

  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Supplier Ledger Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>Supplier Ledger Report</h2>

        <div style="margin-bottom:10px; font-size:13px;">
          <b>Date:</b> ${new Date().toLocaleDateString()}<br/>
          <b>Supplier:</b> ${firstEntry.SupplierName || "-"}<br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Date</th>
              <th>ID</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerEntries
              .map(
                (entry, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${entry.Date || "-"}</td>
                    <td>${entry.ID || "-"}</td>
                    <td>${entry.Description || "-"}</td>
                    <td>${toNum(entry.Debit).toLocaleString()}</td>
                    <td>${toNum(entry.Credit).toLocaleString()}</td>
                    <td>${toNum(entry.Balance).toLocaleString()}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right;">Totals:</td>
              <td>${totalDebit.toLocaleString()}</td>
              <td>${totalCredit.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated ledger report and does not require a signature.
        </p>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

export const handleDateWisePrint = (ledgerEntries = []) => {
  if (!ledgerEntries.length) return;

  const firstEntry = ledgerEntries[0];

  // 🧮 Totals
  const totalAmount = ledgerEntries.reduce(
    (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
    0
  );

  const win = window.open("", "", "width=900,height=700");
  win.document.write(`
    <html>
      <head>
        <title>DateWise Ledger Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>DateWise Ledger Report</h2>

        <div style="margin-bottom:10px; font-size:13px;">
          <b>Date:</b> ${new Date().toLocaleDateString()}<br/>
          <b>Supplier:</b> ${firstEntry.SupplierName || "-"}<br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Date</th>
              <th>GRN ID</th>
              <th>Item(s)</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerEntries
              .map((entry, i) => {
                const item = entry.products?.[0]?.item || "-";
                const qty = entry.products?.[0]?.qty || 0;
                const rate = entry.products?.[0]?.rate || 0;
                const total = entry.totalAmount || 0;
                const formattedDate = new Date(
                  entry.grnDate
                ).toLocaleDateString("en-GB");

                return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${formattedDate}</td>
                      <td>${entry.grnId || "-"}</td>
                      <td>${item}</td>
                      <td>${qty}</td>
                      <td>${rate.toLocaleString()}</td>
                      <td>${total.toLocaleString()}</td>
                    </tr>`;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align:right;">Total Amount:</td>
              <td>${totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated Date wise Ledger and does not require a signature.
        </p>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
};

export const handleCreditAgingPrint = (apiData = [], totals = {}) => {
  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Credit Aging Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; vertical-align: middle; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .customer-row td { background: #e9f5ff; font-weight: bold; text-align: left; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>Credit Aging Report</h2>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Customer</th>
              <th>Invoice No</th>
              <th>Delivery Date</th>
              <th>Allow Days</th>
              <th>Bill Days</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Under Credit</th>
              <th>Due</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            ${apiData
              .map(
                (group, i) => `
                  <tr class="customer-row">
                    <td>${i + 1}</td>
                    <td colspan="10">${group.customerName}</td>
                  </tr>
                  ${
                    group.invoices
                      ?.map(
                        (inv) => `
                        <tr>
                          <td></td>
                          <td></td>
                          <td>${inv.invoiceNo || "-"}</td>
                          <td>${inv.deliveryDate || "-"}</td>
                          <td>${inv.allowDays || 0}</td>
                          <td>${inv.billDays || 0}</td>
                          <td>${inv.debit?.toLocaleString() || 0}</td>
                          <td>${inv.credit?.toLocaleString() || 0}</td>
                          <td>${inv.underCredit?.toLocaleString() || 0}</td>
                          <td>${inv.due?.toLocaleString() || 0}</td>
                          <td>${inv.outstanding?.toLocaleString() || 0}</td>
                        </tr>`
                      )
                      .join("") || ""
                  }
                `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align:right;">Totals:</td>
              <td>${(totals.totalDebit || 0).toLocaleString()}</td>
              <td>${(totals.totalCredit || 0).toLocaleString()}</td>
              <td>${(totals.totalUnderCredit || 0).toLocaleString()}</td>
              <td>${(totals.totalDue || 0).toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated credit aging report and does not require a signature.
        </p>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
};

export const handleDailySalesPrint = (
  salesmanList = {},
  selectedSalesmanName = ""
) => {
  if (
    !salesmanList ||
    (!salesmanList.salesItems?.length &&
      !salesmanList.paymentReceived?.length &&
      !salesmanList.recoveries?.length)
  ) {
    return;
  }

  const {
    salesItems = [],
    paymentReceived = [],
    recoveries = [],
  } = salesmanList;

  // 🔹 Totals
  const totalSales = salesItems.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalPayment = paymentReceived.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
  const totalReceived = paymentReceived.reduce(
    (sum, p) => sum + (p.received || 0),
    0
  );
  const totalBalance = paymentReceived.reduce(
    (sum, p) => sum + (p.balance || 0),
    0
  );
  const totalDueRecovery = recoveries.reduce(
    (sum, r) => sum + (r.dueRecovery || 0),
    0
  );
  const totalRecovered = recoveries.reduce(
    (sum, r) => sum + (r.totalRecovery || 0),
    0
  );

  const win = window.open("", "", "width=950,height=700");
  win.document.write(`
    <html>
      <head>
        <title>Daily Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          hr { border: none; border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />
        <h2>Daily Sales Report</h2>
        <p><b>Date:</b> ${new Date().toLocaleDateString()} &nbsp;&nbsp; | &nbsp;&nbsp; <b>Salesman:</b> ${
    selectedSalesmanName || "-"
  }</p>

        <!-- 🔹 Sales Items Table -->
        <h3 style="margin-top:20px;">Sales Items</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Item Name</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              salesItems.length
                ? salesItems
                    .map(
                      (s) => `
                    <tr>
                      <td>${s.invoiceNo || "-"}</td>
                      <td>${s.customer || "-"}</td>
                      <td>${s.itemName || "-"}</td>
                      <td>${s.rate || 0}</td>
                      <td>${s.qty || 0}</td>
                      <td>${(s.total || 0).toLocaleString()}</td>
                    </tr>`
                    )
                    .join("")
                : `<tr><td colspan="6">No sales records found.</td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right;">Total Sales:</td>
              <td>${totalSales.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <!-- 🔹 Payment Received Table -->
        <h3 style="margin-top:25px;">Payment Received</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Received</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${
              paymentReceived.length
                ? paymentReceived
                    .map(
                      (p) => `
                    <tr>
                      <td>${p.invoiceNo || "-"}</td>
                      <td>${p.customer || "-"}</td>
                      <td>${(p.total || 0).toLocaleString()}</td>
                      <td>${(p.received || 0).toLocaleString()}</td>
                      <td>${(p.balance || 0).toLocaleString()}</td>
                    </tr>`
                    )
                    .join("")
                : `<tr><td colspan="5">No payment records found.</td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align:right;">Totals:</td>
              <td>${totalPayment.toLocaleString()}</td>
              <td>${totalReceived.toLocaleString()}</td>
              <td>${totalBalance.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <!-- 🔹 Recovery Table -->
        <h3 style="margin-top:25px;">Recoveries</h3>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Invoices</th>
              <th>Total Recovered</th>
              <th>Due Recovery</th>
            </tr>
          </thead>
          <tbody>
            ${
              recoveries.length
                ? recoveries
                    .map(
                      (r) => `
                    <tr>
                      <td>${r.customer || "-"}</td>
                      <td>${r.invoices?.join(", ") || "-"}</td>
                      <td>${(r.totalRecovery || 0).toLocaleString()}</td>
                      <td>${(r.dueRecovery || 0).toLocaleString()}</td>
                    </tr>`
                    )
                    .join("")
                : `<tr><td colspan="4">No recovery records found.</td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align:right;">Total Recovery:</td>
              <td>${totalRecovered.toLocaleString()}</td>
              <td>${totalDueRecovery.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated report and does not require a signature.
        </p>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

export const handleSaleInvoicePrint = (orders = []) => {
  if (!orders.length) return;

  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Sales Tax Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 25px; }

          .heading { text-align: center; font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .sub-heading { text-align: center; font-size: 16px; margin-bottom: 25px; }

          /* FIXED perfect row alignment */
          .row {
            width: 100%;
            display: flex;
            margin: 4px 0;
            font-size: 14px;
          }
          .left-block { width: 50%; }
          .right-block { width: 50%; text-align: left; padding-left: 80px; } /* SAME LEFT PADDING FOR ALL */

          .label { font-weight: bold; width: 120px; display: inline-block; }

          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background: #f5f5f5; }

          .totals-box { width: 280px; margin-left: auto; margin-top: 10px; font-size: 14px; }
          .totals-box div { display: flex; justify-content: space-between; padding: 4px 0; }

          .words { margin-top: 20px; font-size: 14px; font-weight: bold; }

          .sign-row {
            margin-top: 40px; width: 100%;
            display: flex; justify-content: space-between; text-align: center;
          }
          .sign-box { width: 30%; }
          .sign-box .line { border-top: 1px solid #000; margin-bottom: 5px; }

          hr { border: none; border-top: 1px solid #aaa; margin: 40px 0; }
        </style>
      </head>
      <body>
  `);

  orders.forEach((order, index) => {
    const products = order.products || [];

    const totalAmount = products.reduce(
      (sum, p) => sum + (parseFloat(p.totalAmount) || 0),
      0
    );

    const invoiceNo = order.invoiceNo || "-";
    const invoiceDate = order.invoiceDate
      ? new Date(order.invoiceDate).toLocaleDateString()
      : "-";

    const customer = order.customerId || {};

    win.document.write(`

      <div class="heading">City Trader Pvt. Ltd.</div>
     
     <div style="
  text-align:center; 
  font-size:16px; 
  margin:0;
  line-height:18px;
">
  Taj Pura, Lahore
</div>
 <div style="
  text-align:center; 
  font-size:16px; 
  margin:0;
  line-height:18px;
">
  03184486979
</div>
<div style="
  text-align:center; 
  margin-top:16px;
  font-size:22px; 
  font-weight:bold; 
  text-decoration:underline; 
  margin-bottom:15px;
">
  DELIVERY CHALLAN
</div>
      <div style="
  text-align:center; 
  font-size:15px; 
  margin-top:6px; 
  margin-bottom:40px; 
  font-weight:bold; 
  letter-spacing:0.5px;
">
  SALES TAX INVOICE TO FOLLOW
</div>

      <!-- TOP SECTION FIXED ALIGNMENT -->
      <div class="row">
        <div class="left-block"><span class="label">Particular:</span> ${
          customer.customerName || "-"
        }</div>
        <div class="right-block"><span class="label">Area:</span> ${
          customer.salesArea || "-"
        }</div>
      </div>

      <div class="row">
        <div class="left-block"><span class="label">Date:</span> ${invoiceDate}</div>
        <div class="right-block"><span class="label">Sales Officer:</span> ${
          order.salesmanId?.employeeName || "-"
        }</div>
      </div>

      <div class="row">
        <div class="left-block"><span class="label">Serial No:</span> ${invoiceNo}</div>
        <div class="right-block"><span class="label">Terms:</span> Credit</div>
      </div>

      <div class="row">
  <div class="left-block"><span class="label">Phone:</span> ${
    customer.phoneNumber || "-"
  }</div>
  <div class="right-block">
    <span class="label">Ref No:</span> ${order.orderTakingId?.orderId || "-"}
  </div>
</div>

       
      </div>

      <!-- PRODUCT TABLE -->
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          ${products
            .map(
              (p) => `
                <tr>
                  <td>${invoiceNo}</td>
                  <td>${p.itemName}</td>
                  <td>${p.qty}</td>
                  <td>${p.rate.toLocaleString()}</td>
                  <td>${p.totalAmount.toLocaleString()}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <!-- TOTALS -->
      <div class="totals-box">
        <div><span>Amount:</span> <span>${totalAmount.toLocaleString()}</span></div>
        <div><span>Additional Discount:</span> <span>0</span></div>
        <div><span>Trade Offer:</span> <span>${order.received || 0}</span></div>
        <div><span><b>Net Amount:</b></span> <span><b>${
          order.receivable
        }</b></span></div>
      </div>

      <!-- AMOUNT IN WORDS -->
    <div class="words">
  IN WORDS:
  <span style="font-weight: normal;"> 
    ${
      order.receivable == 0
        ? "ZERO"
        : numberToWords(order.receivable).toUpperCase()
    } ONLY
  </span>
</div>



      <!-- SIGNATURE ROW -->
      <div class="sign-row">
        <div class="sign-box"><div class="line"></div>Salesman</div>
        <div class="sign-box"><div class="line"></div>Authorize</div>
        <div class="sign-box"><div class="line"></div>Shopkeeper</div>
      </div>

      <div style="
  margin-top: 40px;
  font-size: 14px;
  text-align: right;
  direction: rtl;
  line-height: 22px;
  font-family: 'Noto Nastaliq Urdu', serif;
">
  خبردار! <br />
  کمپنی نمائندہ سے مال کے بغیر مال کی خرید و فروخت اور کسی قسم کی ادائیگی نہ کریں، کرنے کی صورت میں ذمہ دار نہ ہوگا۔
</div>


      ${index < orders.length - 1 ? "<hr/>" : ""}
    `);
  });

  win.document.write("</body></html>");
  win.document.close();
  win.print();
};

/* Convert number to words */
function numberToWords(num) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
  if (num < 1000)
    return a[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100);
  if (num < 1000000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand " +
      numberToWords(num % 1000)
    );

  return "";
}

export const handleCustomerLedgerPrint = (ledgerEntries = []) => {

  if (!ledgerEntries.length) return;

  const firstEntry = ledgerEntries[0];

  // Convert comma numbers safely
  const toNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/,/g, ""));
  };

  const totalDebit = ledgerEntries.reduce(
    (sum, e) => sum + toNumber(e.Debit),
    0
  );

  const totalCredit = ledgerEntries.reduce(
    (sum, e) => sum + toNumber(e.Credit),
    0
  );

  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Customer Ledger Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, p { margin: 0; text-align: center; }
          h1 { font-size: 22px; font-weight: bold; }
          h2 { margin-top: 8px; text-decoration: underline; }
          p { font-size: 14px; color: #555; }
          hr { border-top: 1px solid #aaa; margin: 10px 0 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #999; padding: 6px; text-align: center; }
          th { background: #f2f2f2; }
          tfoot td { font-weight: bold; background: #fafafa; }
          .note { font-size: 11px; color: #777; margin-top: 20px; text-align: center; }
        </style>
      </head>

      <body>
        <h1>Distribution System Pvt. Ltd.</h1>
        <p>Mall of Lahore, Cantt</p>
        <p>Phone: 0318-4486979</p>
        <hr />

        <h2>Customer Ledger Report</h2>

        <div style="margin-bottom:10px; font-size:13px;">
          <b>Date:</b> ${new Date().toLocaleDateString()}<br/>
          <b>Customer:</b> ${firstEntry.CustomerName || "-"}<br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Date</th>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            ${ledgerEntries
              .map(
                (entry, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${entry.Date || "-"}</td>
                    <td>${entry.ID || "-"}</td>
                    <td>${entry.CustomerName || "-"}</td>
                    <td>${entry.Description || "-"}</td>
                    <td>${toNumber(entry.Debit).toLocaleString()}</td>
                    <td>${toNumber(entry.Credit).toLocaleString()}</td>
                    <td>${toNumber(entry.Balance).toLocaleString()}</td>
                  </tr>`
              )
              .join("")}
          </tbody>

          <tfoot>
            <tr>
              <td colspan="5" style="text-align:right;">Totals:</td>
              <td>${totalDebit.toLocaleString()}</td>
              <td>${totalCredit.toLocaleString()}</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>

        <p class="note">
          This is a system-generated customer ledger report and does not require a signature.
        </p>

      </body>
    </html>
  `);

  win.document.close();
  win.print();
};

