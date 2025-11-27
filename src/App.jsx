import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { Toaster } from "react-hot-toast";

import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./helper/ScrollToTop.jsx";

import SalesSidebar from "./pages/admin/Sales/Functionalities/SalesSideBar.jsx";

import OrderTaking from "./pages/admin/Sales/Functionalities/OrderTaking.jsx";
import LoadSheet from "./pages/admin/Sales/Functionalities/LoadSheet.jsx";
import SalesInvoice from "./pages/admin/Sales/Functionalities/SalesInvoice.jsx";
// import CashDeposite from "./pages/admin/Sales/Functionalities/CashDeposite.jsx";
import LoadReturn from "./pages/admin/Sales/Functionalities/LoadReturn.jsx";

import CustomerwiseOrders from "./pages/admin/Sales/Reports/CustomerwiseOrders.jsx";
import CustomerLedger from "./pages/admin/Sales/Reports/CustomerLedger.jsx";
import DateWiseOrder from "./pages/admin/Sales/Reports/DateWiseOrder.jsx";
import ProductWiseOrder from "./pages/admin/Sales/Reports/ProductWiseOrder.jsx";

import SalesmanwiseOrders from "./pages/admin/Sales/Reports/SalesmanwiseOrders.jsx";

// =================== PURCHASE SECTION IMPORTS ===================

import PurchaseSideBar from "./pages/admin/Purchase/Functionalities/PurchaseSideBar.jsx";
import PurchaseGRN from "./pages/admin/Purchase/Functionalities/GRN.jsx";
import PurchasePaymentToSupplier from "./pages/admin/Purchase/Functionalities/PaymentToSupplier.jsx";

import PurchaseAmountPayable from "./pages/admin/Purchase/Reports/AmountPayable.jsx";
import PurchaseDateWisePurchase from "./pages/admin/Purchase/Reports/DateWisePurchase.jsx";
import PurchaseItemWisePurchases from "./pages/admin/Purchase/Reports/ItemWisePurchases.jsx";
import PurchaseSupplierLedger from "./pages/admin/Purchase/Reports/SupplierLedger.jsx";
import PurchaseSupplierWisePurchase from "./pages/admin/Purchase/Reports/SupplierWisePurchase.jsx";
import OpeningStockPrice from "./pages/admin/Purchase/Reports/OpeningStockPrice.jsx";

import DefineSupplier from "./pages/admin/Purchase/SetUp/DefineSupplier.jsx";
import AmountReceivales from "./pages/admin/Sales/Reports/AmountReceivales.jsx";
import ListOfItems from "./pages/admin/Sales/SetUp/ListOfItems.jsx";
import DefineCustomers from "./pages/admin/Sales/SetUp/DefineCustomers.jsx";
import VehicleInformation from "./pages/admin/Sales/SetUp/VehicleInformation.jsx";

import SalesArea from "./pages/admin/Sales/SetUp/SalesArea.jsx";

// =================== ACCOUNTS SECTION IMPORTS

// import AccountSideBar from "./pages/admin/Accounts/Functionalities/AccountSideBar.jsx";
// import ExpenseVoucher from "./pages/admin/Accounts/Functionalities/ExpenseVoucher.jsx";

// import DateWiseCashRecived from "./pages/admin/Accounts/Reports/DateWiseCashRecived.jsx";
// import DateWiseRecovery from "./pages/admin/Accounts/Reports/DateWiseRecovery.jsx";
// import ItemWiseRecovery from "./pages/admin/Accounts/Reports/ItemWiseRecovery.jsx";
// import SalesmanWiseRecovery from "./pages/admin/Accounts/Reports/SalesmanWiseRecovery.jsx";
import DailySalesReport from "./pages/admin/Sales/Reports/DaliySalesReport.jsx";

import DefineBank from "./pages/admin/Accounts/Bank/DefineBank.jsx";
import Sales from "./pages/admin/Sales/Functionalities/SalesProfit.jsx";
import CreditAgingReport from "./pages/admin/Sales/Reports/CreditAgingReport.jsx";
import ItemCategory from "./pages/admin/Sales/SetUp/ItemCategory.jsx";
import ItemType from "./pages/admin/Sales/SetUp/ItemType.jsx";
import ManufactureList from "./pages/admin/Sales/SetUp/ManufacturerList.jsx";
import ShelveLocationList from "./pages/admin/Sales/SetUp/ShelveLoactionList.jsx";
import SalesManInformation from "./pages/admin/Sales/SetUp/SalesManInformation.jsx";
import SupplierList from "./pages/admin/Sales/SetUp/Supplier.jsx";
import ItemUnit from "./pages/admin/Sales/SetUp/ItemUnit.jsx";
import OpeningStock from "./pages/admin/Sales/Reports/OpeningStock.jsx";
import OpeningStockSupplierwise from "./pages/admin/Purchase/Reports/OpeningStockSupplierwise.jsx";
import Recovery from "./pages/admin/Sales/Functionalities/Recovery.jsx";
import ExpenseSheet from "./pages/admin/Accounts/Expense/ExpenseSheet.jsx";
import Expense from "./pages/admin/Accounts/Expense/Expense.jsx";
import Security from "./components/Security.jsx";
import BankSideBar from "./pages/admin/Accounts/Bank/BankPage.jsx";
import PaymentVoucher from "./pages/admin/Accounts/Bank/PaymentVoucher.jsx";
import ReceiptVoucher from "./pages/admin/Accounts/Bank/ReceiptVoucher.jsx";
import BankLedger from "./pages/admin/Accounts/Bank/BankLedger.jsx";
import BankPosition from "./pages/admin/Accounts/Bank/BankPosition.jsx";
import DayBook from "./pages/admin/Accounts/DayBook.jsx";
import AllorderInvoice from "./pages/admin/AllOrdersInvoice/AllorderInvoice.jsx";
import SalesmanAmountReceivales from "./pages/admin/Sales/Reports/SalesmanAmountReceivales.jsx";
import ExSideBar from "./pages/admin/Accounts/Expense/ExpensePage.jsx";
import DefineExpenseHead from "./pages/admin/Accounts/Expense/DefineExpenseHead.jsx";
import CashDeposite from "./pages/admin/Accounts/CashDeposite/CashDeposite.jsx";

function AppContent() {
  return (
    <div className="max-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="security" element={<Security />} />
            <Route path="sales" element={<SalesSidebar />} />
            <Route path="day-book" element={<DayBook />} />

            {/* Sales */}
            <Route path="sales/order-taking" element={<OrderTaking />} />
            <Route path="sales/load-sheet" element={<LoadSheet />} />
            <Route path="sales/sales-invoice" element={<SalesInvoice />} />
            <Route path="sales/recovery" element={<Recovery />} />
            <Route path="sales/sales" element={<Sales />} />
            {/* <Route path="sales/cash-deposite" element={<CashDeposite />} /> */}
            <Route path="sales/load-return" element={<LoadReturn />} />
         

            {/* Reports */}
            <Route
              path="report/customer-amount-receivable"
              element={<AmountReceivales />}
            />
            <Route
              path="report/daily-sales-report"
              element={<DailySalesReport />}
            />
            <Route path="report/customer-ledger" element={<CustomerLedger />} />
            <Route path="report/datewise-orders" element={<DateWiseOrder />} />
            <Route path="report/credit-aging" element={<CreditAgingReport />} />
            <Route
              path="report/productwise-orders"
              element={<ProductWiseOrder />}
            />
            <Route path="report/opening-stock" element={<OpeningStock />} />
            <Route
              path="report/opening-stock-supplierwise"
              element={<OpeningStockSupplierwise />}
            />
            <Route path="report/stock-price" element={<OpeningStockPrice />} />
            <Route
              path="report/customerwise-orders"
              element={<CustomerwiseOrders />}
            />

            <Route
              path="report/salesmanwise-orders"
              element={<SalesmanwiseOrders />}
            />
           
            <Route
              path="report/salesman-amount-receivable"
              element={<SalesmanAmountReceivales />}
            />
            {/* setup */}
            <Route path="define-customers" element={<DefineCustomers />} />
            <Route path="item-category" element={<ItemCategory />} />
            <Route path="item-type" element={<ItemType />} />
            <Route path="manufacture" element={<ManufactureList />} />
            <Route path="shelve-location" element={<ShelveLocationList />} />
            <Route path="list-of-items" element={<ListOfItems />} />
            <Route path="supplier" element={<SupplierList />} />
            <Route path="item-unit" element={<ItemUnit />} />
            <Route
              path="salesman-information"
              element={<SalesManInformation />}
            />
            <Route
              path="vehicle-information"
              element={<VehicleInformation />}
            />
            <Route path="sales-area" element={<SalesArea />} />

            {/* =================== PURCHASE SECTION =================== */}

            <Route path="purchase" element={<PurchaseSideBar />} />

            {/* Functionalities */}
            <Route path="purchase/grn" element={<PurchaseGRN />} />
            <Route
              path="purchase/payment-to-supplier"
              element={<PurchasePaymentToSupplier />}
            />

            {/* Reports */}
            <Route
              path="purchase/amount-payable"
              element={<PurchaseAmountPayable />}
            />
            <Route
              path="purchase/datewise-purchase"
              element={<PurchaseDateWisePurchase />}
            />
            <Route
              path="purchase/itemwise-purchases"
              element={<PurchaseItemWisePurchases />}
            />
            <Route
              path="purchase/supplier-ledger"
              element={<PurchaseSupplierLedger />}
            />
            <Route
              path="purchase/supplierwise-purchase"
              element={<PurchaseSupplierWisePurchase />}
            />

            {/* Setup */}
            <Route
              path="purchase/define-supplier"
              element={<DefineSupplier />}
            />

            {/* =================== ACCOUNTS SECTION =================== */}

            {/* <Route path="accounts" element={<AccountSideBar />} /> */}

            {/* Functionalities */}
            {/* <Route
              path="admin/expense-voucher"
              element={<ExpenseVoucher />}
            /> */}

            {/* Reports */}
            {/* <Route
              path="admin/datewise-cashrecived"
              element={<DateWiseCashRecived />}
            />
            <Route
              path="admin/datewise-recovery"
              element={<DateWiseRecovery />}
            />
            <Route
              path="admin/itemwise-recovery"
              element={<ItemWiseRecovery />}
            />
            <Route
              path="admin/salesmanwise-recovery"
              element={<SalesmanWiseRecovery />}
            /> */}

            {/* Expense Section */}
            {/* Expense Section */}
            <Route path="expense" element={<ExSideBar />} />
            <Route path="expense/expense" element={<Expense />} />
            <Route path="expense/expense-sheet" element={<ExpenseSheet />} />
            <Route path="expense/define-expense-head" element={<DefineExpenseHead />} />

            {/* Bank */}
            <Route path="bank" element={<BankSideBar />} />
            <Route path="bank-payment-voucher" element={<PaymentVoucher />} />
            <Route path="bank-receipt-voucher" element={<ReceiptVoucher />} />
               {/* cash deposite */}
            <Route path="cash-deposite" element={<CashDeposite />} />
            <Route path="bank-ledger" element={<BankLedger />} />
            <Route path="opening-bank-position" element={<BankPosition />} />
            {/* Setup */}
            <Route path="bank/define" element={<DefineBank />} />
            {/* All order / invoice */}
            <Route path="all-orders-invoice" element={<AllorderInvoice />} />
          </Route>
        </Routes>
      </main>
      <Toaster position="top-right" autoClose={2000} />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
