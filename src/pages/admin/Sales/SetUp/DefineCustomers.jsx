import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";

import Swal from "sweetalert2";
import CommanHeader from "../../Components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const DefineCustomers = () => {
  const [customerList, setCustomerList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Credit");
  const [status, setStatus] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState(""); // Added department
  const [ntn, setNtn] = useState("");
  const [gst, setGst] = useState("");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(""); // Added opening balance date
  const [balanceReceived, setBalanceReceived] = useState(""); // Added balance received
  const [creditTime, setCreditTime] = useState(30);
  const [creditLimit, setCreditLimit] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [areaName, setAreaName] = useState("");
  const [areaNameList, setAreaNameList] = useState([]);
  const [salesManList, setSalesManList] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filtered customers based on search term
  const filteredCustomers = customerList.filter(
    (c) =>
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic on filtered customers
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCustomers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Total pages based on filtered customers
  const totalPages = Math.ceil(filteredCustomers.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setLoading(true);
    setCurrentPage(pageNumber);
    setTimeout(() => setLoading(false), 300);
  };

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block";
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(sliderRef.current, {
        scale: 0.7,
        opacity: 0,
        y: -50,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          if (sliderRef.current) {
            sliderRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isSliderOpen]);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/customers`;

  const fetchCustomersList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setCustomerList(res.data);
    } catch (error) {
      console.error("Failed to fetch Customers", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchCustomersList();
  }, [fetchCustomersList]);

  const fetchSalesManList = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees`
      );
      setSalesManList(res.data);
    } catch (error) {
      console.error("Failed to fetch Salesman", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, []);

  useEffect(() => {
    fetchSalesManList();
  }, [fetchSalesManList]);

  // Handlers
  const handleAddCustomer = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setSelectedSalesman("");
    setEditId(null);
    setCustomerName("");
    setContactPerson("");
    setEmail("");
    setAddress("");
    setPaymentTerms("Credit");
    setPhoneNumber("");
    setMobileNumber("");
    setDesignation("");
    setAreaName("");
    setDepartment(""); // Reset department
    setNtn("");
    setGst("");
    setOpeningBalanceDate(new Date().toISOString().split("T")[0]); // Reset opening balance date
    setBalanceReceived(0); // Reset balance received
    setStatus(true);
    setCreditTime(30);
    setCreditLimit("");
  };

  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  // ✅ Customer Form Validation
  const validateCustomerForm = () => {
    const errors = [];

    if (!areaName) errors.push("Area Name is required");
    if (!selectedSalesman) errors.push("Salesman is required");
    if (!customerName) errors.push("Customer Name is required");
    if (!address) errors.push("Address is required");
    if (!phoneNumber) errors.push("Phone Number is required");
    if (!openingBalanceDate) errors.push("Opening Balance Date is required");
    if (balanceReceived === "" || balanceReceived === null)
      errors.push("Opening Balance is required");

    // ✅ Credit fields (only when Payment Terms = Credit)
    if (paymentTerms === "Credit") {
      if (!creditTime) errors.push("Credit Days Limit is required");
      if (!creditLimit) errors.push("Credit Cash Limit is required");
    }

    return errors;
  };

  // Save or Update Customer
  const handleSave = async () => {
    const errors = validateCustomerForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: errors.join("<br/>"),
      });
      return;
    }
    setIsSaving(true);
    const formData = {
      salesArea: areaName,
      customerName,

      address,
      salesman: selectedSalesman,

      phoneNumber,

      paymentTerms,
      creditTime: paymentTerms === "Credit" ? Number(creditTime) : undefined,
      creditLimit: paymentTerms === "Credit" ? Number(creditLimit) : undefined,
      openingBalanceDate,
      salesBalance: Number(balanceReceived) || 0,
    };

    try {
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      let res;
      if (isEdit && editId) {
        res = await axios.put(`${API_URL}/${editId}`, formData, { headers });
        toast.success("Customer updated successfully");
      } else {
        res = await axios.post(`${API_URL}`, formData, { headers });
        setCustomerList([...customerList, res.data]);
        toast.success("Customer added successfully");
      }
      fetchCustomersList();
      setCustomerName("");
      setContactPerson("");
      setEmail("");
      setAddress("");
      setPaymentTerms("");
      setPhoneNumber("");
      setMobileNumber("");
      setDesignation("");
      setDepartment("");
      setNtn("");
      setGst("");
      setOpeningBalanceDate("");
      setBalanceReceived("");
      setStatus(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setEditId(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Customer
  const handleEdit = (customer) => {
    // console.log({ customer });

    setIsEdit(true);
    setEditId(customer._id);
    setAreaName(customer.salesArea || "");
    setCustomerName(customer.customerName);
    setSelectedSalesman(customer.salesman._id);
    setContactPerson(customer.contactPerson);
    setEmail(customer.email);
    setAddress(customer.address);
    setPhoneNumber(customer.phoneNumber || "");
    setMobileNumber(customer.mobileNumber || "");
    setDesignation(customer.designation || "");
    setDepartment(customer.department || ""); // Added department
    setNtn(customer.ntn || "");
    setGst(customer.gst || "");
    const formattedDate = customer.openingBalanceDate
      ? customer.openingBalanceDate.split("T")[0]
      : "";
    setOpeningBalanceDate(formattedDate);

    setBalanceReceived(
      customer.salesBalance !== undefined && customer.salesBalance !== null
        ? customer.salesBalance
        : ""
    );
    setPaymentTerms(customer.paymentTerms || "");
    setCreditTime(customer.creditTime || "");
    setCreditLimit(customer.creditLimit || "");
    setStatus(customer.status);
    setIsSliderOpen(true);
  };

  // Delete Customer
  const handleDelete = async (id) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_URL}/${id}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });
            setCustomerList(customerList.filter((c) => c._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Customer deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete customer.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Customer is safe 🙂",
            "error"
          );
        }
      });
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <CommanHeader />
      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Customers List</h1>
          <p className="text-gray-500 text-sm">Manage your customer details</p>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name or Address..."
            className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
          />
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
            onClick={handleAddCustomer}
          >
            + Add Customer
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1fr_1.5fr_auto] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>SR</div>
              <div>Customer Name</div>
              <div>Address</div>
              <div>Phone</div>
              <div>Balance</div>
              <div>Status</div>
              {userInfo?.isAdmin && <div className="text-right">Actions</div>}
            </div>

            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={customerList.length > 0 ? customerList.length : 5}
                  cols={userInfo?.isAdmin ? 7 : 10}
                  className="lg:grid-cols-[20px_1fr_1fr_1fr_1fr_1.5fr_auto]"
                />
              ) : customerList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No customers found.
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No customers found.
                </div>
              ) : (
                currentRecords?.map((c, index) => (
                  <>
                    <div
                      key={c._id}
                      className="hidden lg:grid grid-cols-[20px_1fr_1fr_1fr_1fr_1.5fr_auto] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-900">
                        {indexOfFirstRecord + index + 1}
                      </div>
                      <div className="text-gray-700">
                        {c.customerName || "-"}
                      </div>
                      <div className="text-gray-600 truncate">
                        {c.address || "-"}
                      </div>
                      <div className="text-gray-600">
                        {c.phoneNumber || "-"}
                      </div>
                      <div className="text-gray-600">
                        {c.salesBalance || "0"}
                      </div>
                      <div className="font-semibold">
                        {c.status ? (
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-[5px]">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-3 py-1 rounded-[5px]">
                            Inactive
                          </span>
                        )}
                      </div>
                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      key={`mobile-${c._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {c.customerName || "-"}
                      </h3>
                      <p className="text-sm text-gray-600">SR#: {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        Address: {c.address || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Phone: {c.phoneNumber || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Person: {c.contactPerson || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Designation: {c.designation || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Department: {c.department || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mobile: {c.mobileNumber || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {c.balanceReceived || "0"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          c.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {c.status ? "Active" : "Inactive"}
                      </p>
                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(c)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(c._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, customerList.length)} of{" "}
                  {customerList.length} records
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
      </div>

      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update a Customer" : "Add a New Customer"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setCustomerName("");
                  setContactPerson("");
                  setEmail("");
                  setAddress("");
                  setPaymentTerms("");
                  setPhoneNumber("");
                  setMobileNumber("");
                  setDesignation("");
                  setDepartment("");
                  setNtn("");
                  setGst("");
                  setOpeningBalanceDate("");
                  setBalanceReceived("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Area Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={areaName}
                    required
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="Enter Area Name"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Salesman <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={selectedSalesman}
                    required
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-newPrimary"
                  >
                    <option value="">Select Salesman</option>
                    {salesManList.map((salesman) => (
                      <option key={salesman._id} value={salesman._id}>
                        {salesman.employeeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    required
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      // ✅ Allow only digits and '+' sign at start
                      if (/^[0-9+]*$/.test(value)) {
                        setPhoneNumber(value);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. +1-213-555-9876"
                  />
                </div>
              </div>
              {/* <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      // ✅ Allow only digits and '+' sign at start
                      if (/^[0-9+]*$/.test(value)) {
                        setMobileNumber(value);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 03005678901"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div> */}
              <div className="flex gap-4">
                {/* <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    required
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div> */}
                {/* <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    required
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Purchasing Manager"
                  />
                </div> */}
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">NTN</label>
                  <input
                    type="text"
                    value={ntn}
                    required
                    onChange={(e) => setNtn(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. NTN456789123"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">GST</label>
                  <input
                    type="text"
                    value={gst}
                    required
                    onChange={(e) => setGst(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 27DEFGH5678J2K4"
                  />
                </div>
              </div> */}
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Opening Balance Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={openingBalanceDate}
                    required
                    onChange={(e) => setOpeningBalanceDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Opening Balance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={balanceReceived}
                    required
                    onChange={(e) => setBalanceReceived(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter balance received"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Credit"
                      checked={paymentTerms === "Credit"}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="form-radio"
                    />
                    Credit
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Cash"
                      checked={paymentTerms === "Cash"}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="form-radio"
                    />
                    Cash
                  </label>
                </div>
              </div>

              {paymentTerms === "Credit" && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Days Limit{" "}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditTime} // controlled input
                      onChange={(e) =>
                        setCreditTime(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Cash Limit{" "}
                      <span className="text-newPrimary">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter cash limit"
                    />
                  </div>
                </div>
              )}

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isEdit ? "Update Customer" : "Save Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-container {
          max-width: 100%;
        }
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
        @media (max-width: 1024px) {
          .grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_100px_auto] {
            grid-template-columns: 80px 1.5fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px auto;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_100px_auto] {
            grid-template-columns: 80px 1.5fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr 100px auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DefineCustomers;
