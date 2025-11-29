import React, { useState, useEffect } from "react";
import { Eye, SquarePen, Trash2, X } from "lucide-react";
import CommanHeader from "../../Components/CommanHeader";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import axios from "axios";
import TableSkeleton from "../../Components/Skeleton";
import { ScaleLoader } from "react-spinners";
import ViewModal from "../../../../helper/ViewModel";
import { Loader } from "lucide-react";
const OrderTaking = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isView, setIsView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [creditsDays, setCreditsDays] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalQty, setTotalQty] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isItemEditMode, setIsItemEditMode] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [salesman, setSalesman] = useState("");
  const [salesmanList, setSalesmanList] = useState([]);
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [unitList, setUnitList] = useState([]);
  const [rate, setRate] = useState("");
  const [purchase, setPurchase] = useState("");
  const [total, setTotal] = useState("");
  const [items, setItems] = useState([]);
  const [rateError, setRateError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const headers = {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
  };
  // Fetch Employe List
  async function fetchEmployees() {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees`
      );
      setSalesmanList(res.data);
    } catch (error) {
      console.error("Failed to fetch Employees", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);
  // Fetch customers
  async function fetchCustomers() {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customers`
      );
      setCustomersList(res.data);
    } catch (error) {
      console.error("Failed to fetch Employees", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // console.log({ customersList });

  // fetch fished Goods

  async function fetchFinshedGoods() {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/pending`
      );
      setProductsList(res.data);
    } catch (error) {
      console.error("Failed to fetch Employees", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  useEffect(() => {
    fetchFinshedGoods();
  }, []);

  // fetch order Taking
  // console.log({ productsList });

  async function fetchOrderTaking() {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/order-taker`
      );
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch Employees", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  useEffect(() => {
    fetchOrderTaking();
  }, []);

  // 🗓️ Auto calculate Due Date based on today's date and Credit Limit
  useEffect(() => {
    if (creditsDays) {
      const today = new Date(); // current date
      today.setDate(today.getDate() + Number(creditsDays)); // add credit limit days
      const formattedDueDate = today.toISOString().split("T")[0]; // format YYYY-MM-DD
      setDueDate(formattedDueDate);
    } else {
      setDueDate("");
    }
  }, [creditsDays]);
  // summ of total and qty
  useEffect(() => {
    if (items.length > 0) {
      const qtySum = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
      const totalSum = items.reduce(
        (sum, it) => sum + Number(it.total || 0),
        0
      );
      setTotalQty(qtySum);
      setGrandTotal(totalSum);
    } else {
      setTotalQty(0);
      setGrandTotal(0);
    }
  }, [items]);

  // Auto-generate Order ID and Date (based on highest existing number)
  useEffect(() => {
    if (!editingOrder && orders.length > 0) {
      const maxNo = Math.max(
        ...orders.map((o) => {
          const match = o.orderId?.match(/ORD-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setOrderId(`ORD-${(maxNo + 1).toString().padStart(3, "0")}`);
    } else if (!editingOrder && orders.length === 0) {
      setOrderId("ORD-001");
    }

    setOrderDate(new Date().toLocaleDateString("en-CA"));
  }, [orders, editingOrder, isSliderOpen]);

  // Auto calculate total
  useEffect(() => {
    const t = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
    setTotal(t);
  }, [qty, rate]);

  const handleAddItem = () => {
    setRateError("");

    if (!product) {
      toast.error("Please select a Product");
      return;
    }
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid Quantity");
      return;
    }
    if (!rate || rate <= 0) {
      toast.error("Rate is missing or invalid");
      return;
    }
    if (Number(rate) <= Number(purchase)) {
      setRateError("Rate should be greater than Purchase!");
      return;
    }

    const selected = productsList.find((p) => p._id === product);

    const newItem = {
      product: selected.itemName, // store itemName again
      purchase,
      qty,
      rate,
      total,
    };

    // 🔥 UPDATE MODE
    if (isItemEditMode) {
      setItems((prev) => prev.map((p, i) => (i === editIndex ? newItem : p)));

      // Reset edit state
      setIsItemEditMode(false);
      setEditIndex(null);
    } else {
      // 🔥 ADD MODE
      setItems([...items, newItem]);
    }

    // Reset inputs
    setProduct("");
    setPurchase("");
    setQty("");
    setRate("");
    setTotal("");
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (isItemEditMode) {
      toast.error(
        "You are editing an item. Please update the item before saving the order."
      );
      return;
    }
    // ✅ Strong validation before submitting
    if (!salesman) {
      toast.error("Please select a Salesman before saving!");
      return;
    }

    if (!customer) {
      toast.error("Please select a Customer before saving!");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one Product item!");
      return;
    }
    setIsSaving(true);
    const payload = {
      orderId,
      salesmanId: salesman,
      customerId: customer,
      products: items.map((it) => ({
        itemName: it.product,
        qty: Number(it.qty),
        rate: Number(it.rate),
        totalAmount: Number(it.total),
      })),
    };

    try {
      if (editingOrder) {
        // ✅ UPDATE EXISTING ORDER (PUT)
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/order-taker/${
            editingOrder._id
          }`,
          payload,
          headers // ✅ include token here
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Order updated successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        // ✅ CREATE NEW ORDER (POST)
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/order-taker`,
          payload,
          headers // ✅ include token here
        );

        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Order saved successfully.",
          confirmButtonColor: "#3085d6",
        });
      }

      fetchOrderTaking(); // reload after success
      resetForm();
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error(error.response?.data?.error || "Failed to save order");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (order) => {
    // console.log(order, "osder");

    setEditingOrder(order);

    // match your backend fields
    setOrderId(order.orderId || "");
    setOrderDate(
      order.date ? new Date(order.date).toISOString().split("T")[0] : ""
    );

    // set salesman and customer by ID
    setSalesman(order.salesmanId?._id || "");
    setCustomer(order.customerId?._id || "");

    // set address and phone
    setAddress(order.customerId?.address || "");
    setPhone(order.customerId?.phoneNumber || "");
    setBalance(order.customerId?.salesBalance || 0);
    setCreditsDays(order.customerId?.creditTime || 0);

    // transform products to frontend-friendly items
    const formattedItems =
      order.products?.map((p, i) => {
        const prod = productsList.find((x) => x.itemName === p.itemName);

        return {
          id: i + 1,
          product: p.itemName,
          purchase: prod?.purchase || 0, // <-- FIXED
          qty: p.qty,
          unit: p.itemUnit,
          rate: p.rate,
          total: p.totalAmount,
        };
      }) || [];

    setItems(formattedItems);
    // console.log("HI", formattedItems);

    setIsSliderOpen(true);
  };

  const resetForm = () => {
    setEditingOrder(null);
    setOrderId("");
    setOrderDate("");
    setSalesman("");
    setCustomer("");
    setAddress("");
    setPhone("");
    setProduct("");
    setQty("");
    setUnit("");
    setRate("");
    setPurchase("");
    setTotal("");
    setItems([]);
    setCreditsDays("");
    setDueDate("");
    setBalance("");
    setIsSliderOpen(false);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the order.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        // 🔥 Delete from backend
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/order-taker/${id}`,
          headers
        );

        // ✅ Remove from local state
        setOrders((prev) => prev.filter((o) => o._id !== id));

        // ✅ Success alert
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Order deleted successfully.",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error(error.response?.data?.message || "Failed to delete order");
      }
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      (order.orderId || "").toLowerCase().includes(term) ||
      (order.customerId?.customerName || "").toLowerCase().includes(term) ||
      (order.salesmanId?.employeeName || "").toLowerCase().includes(term)
    );
  });

  const currentRecords = filteredOrders.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  // console.log({ orders });
  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleItemEdit = (index) => {
    const it = items[index];

    const selected = productsList.find((p) => p.itemName === it.product);
    // console.log(selected, "fygfyf");

    setProduct(selected?._id || ""); // dropdown select correct
    setPurchase(it.purchase);
    setRate(it.rate);
    setQty(it.qty);
    setTotal(it.total);

    setEditIndex(index);
    setIsItemEditMode(true);
  };

  // console.log({ productsList });
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
  };

  // console.log("Hi", items);

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
            <h1 className="text-2xl font-bold text-newPrimary">Order Taking</h1>

            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by Customer, Salesman..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset to first page when searching
                }}
                className="w-full md:w-64 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              />

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                onClick={() => setIsSliderOpen(true)}
              >
                + Add Order
              </button>
            </div>
          </div>

          <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[800px]">
              <div className="min-w-[1000px]">
                <div className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR</div>
                  <div>Order ID</div>
                  <div>Date</div>
                  <div>Sales Officer</div>
                  <div>Customer</div>
                  <div>Phone</div>
                  <div>Actions</div>
                </div>

                <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
                  {loading ? (
                    <TableSkeleton
                      rows={orders.length > 0 ? orders.length : 5}
                      cols={7} // SR, Order ID, Date, Salesman, Customer, Phone, Actions
                      className="lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr]"
                    />
                  ) : currentRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No Orders Found
                    </div>
                  ) : (
                    currentRecords.map((order, i) => (
                      <div
                        key={order._id}
                        className="grid grid-cols-1 lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div>{indexOfFirstRecord + i + 1}</div>
                        <div>{order.orderId || "-"}</div>
                        <div>{formatDate(order.date) || "-"}</div>
                        <div>{order.salesmanId?.employeeName || "-"}</div>
                        <div>{order.customerId?.customerName || "-"}</div>
                        <div>{order.customerId?.phoneNumber || "-"}</div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-blue-600 hover:bg-blue-50  rounded"
                          >
                            <SquarePen size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(order._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ✅ Add pagination controls below here */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, orders.length)} of{" "}
                      {orders.length} orders
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
          </div>

          {isSliderOpen && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                {isSaving && (
                  <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-2xl">
                  <h2 className="text-xl font-bold text-newPrimary">
                    {editingOrder ? "Edit Order" : "Add New Order"}
                  </h2>
                  <button
                    className="text-2xl text-gray-500 hover:text-gray-700"
                    onClick={resetForm}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveOrder} className="space-y-4 p-6">
                  {/* ID and Date */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-2">
                        Order ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderId}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={orderDate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Salesman */}
                  <div className="w-[49%]">
                    <label className="block text-gray-700 mb-2">
                      Sales Officer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={salesman}
                      onChange={(e) => setSalesman(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Sales Officer</option>
                      {salesmanList.map((sale) => (
                        <option key={sale._id} value={sale._id}>
                          {sale?.employeeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Info */}

                  <div className="border p-4 rounded-lg bg-gray-100 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-2">
                          Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={customer}
                          onChange={(e) => {
                            const selected = customersList.find(
                              (c) => c._id === e.target.value
                            );
                            setCustomer(e.target.value);
                            setAddress(selected?.address || "");
                            setPhone(selected?.phoneNumber || "");
                            setCreditsDays(selected?.creditTime || "");
                            setBalance(selected?.salesBalance || 0); // ✅ New field
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Customer</option>
                          {customersList.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.customerName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone */}
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={phone}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* ✅ Balance and Address side by side */}
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-gray-700 mb-2">
                          Balance
                        </label>
                        <input
                          type="number"
                          value={balance}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                    {/* Crdits Days and Due date */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-2">
                          Credits Days
                        </label>
                        <input
                          type="text"
                          value={creditsDays}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      {/* Due Dates */}
                      <div className="flex-1">
                        <label className="block text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Entry */}
                  <div className="border p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-6 gap-3 items-end w-full">
                      <div className="w-full">
                        <label className="text-gray-700 text-sm">Product</label>
                        <select
                          value={product}
                          onChange={(e) => {
                            const selected = productsList.find(
                              (p) => p._id === e.target.value
                            );
                            setProduct(selected?._id || "");
                            setPurchase(selected?.purchase || "");
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select</option>
                          {productsList.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.itemName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full">
                        <label className="text-gray-700 text-sm">
                          Purchase
                        </label>
                        <input
                          type="number"
                          value={purchase}
                          disabled
                          onChange={(e) => setPurchase(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="w-full">
                        <label className="text-gray-700 text-sm">Rate</label>
                        <input
                          type="number"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="w-full">
                        <label className="text-gray-700 text-sm">Qty</label>
                        <input
                          type="number"
                          value={qty}
                          min={1}
                          onChange={(e) => setQty(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="w-full">
                        <label className="text-gray-700 text-sm">Total</label>
                        <input
                          type="number"
                          value={total}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <div className="w-full">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full bg-newPrimary text-white py-2 rounded-md hover:bg-newPrimary/90"
                        >
                          {isItemEditMode ? "Update" : "Add"}
                        </button>
                      </div>
                    </div>

                    {/* Show Rate error here */}
                    {rateError && (
                      <div className="text-red-600 font-medium mt-2">
                        {rateError}
                      </div>
                    )}

                    {/* Items Table */}
                    <div className="mt-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] bg-gray-200 text-sm font-semibold text-gray-600">
                        <div className="px-4 py-2">Product</div>

                        {/* <div className="px-4 py-2">Purchase</div> */}
                        <div className="px-4 py-2">Rate</div>
                        <div className="px-4 py-2">Qty</div>
                        <div className="px-4 py-2">Total</div>
                        <div className="px-4 py-2">Edit/Remove</div>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-center py-3 text-gray-500 bg-white">
                          No items added yet.
                        </div>
                      ) : (
                        items.map((it, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] text-sm bg-white border-t"
                          >
                            <div className="px-4 py-2">{it.product}</div>
                            {/* <div className="px-4 py-2">{it.purchase}</div>  */}
                            <div className="px-4 py-2">{it.rate}</div>{" "}
                            {/* Manual rate */}
                            <div className="px-4 py-2">{it.qty}</div>
                            <div className="px-4 py-2">{it.total}</div>
                            <div className="flex justify-center gap-2 py-2">
                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() => handleItemEdit(i)}
                                className="text-blue-600 hover:bg-blue-100 rounded-full p-1"
                                title="Edit Item"
                              >
                                <SquarePen size={18} />
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(i)}
                                className="text-red-600 hover:bg-red-100 rounded-full p-1"
                                title="Remove Item"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isItemEditMode}
                    className={`w-full py-3 rounded-lg text-white transition
    ${
      isItemEditMode
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-newPrimary hover:bg-newPrimary/80"
    }`}
                  >
                    {editingOrder ? "Update Order" : "Save Order"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {isView && selectedOrder && (
        <ViewModal
          type="order"
          data={selectedOrder}
          onClose={() => setIsView(false)}
        />
      )}
    </div>
  );
};

export default OrderTaking;
