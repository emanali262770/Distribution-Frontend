import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommanHeader from "../../Components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../../Components/Skeleton";
import { set } from "date-fns";

const DefineSupplier = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [productsSupplied, setProductsSupplied] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [status, setStatus] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [ntn, setNtn] = useState("");
  const [gst, setGst] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [creditTime, setCreditTime] = useState("");
  const [creditLimitError, setCreditLimitError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // GSAP Animation for Modal
  useEffect(() => {
    if (isSliderOpen) {
      if (sliderRef.current) {
        sliderRef.current.style.display = "block"; // ensure visible before animation
      }
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0, y: -50 }, // start smaller & slightly above
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

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/suppliers`;

  const fetchSuppliersList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setSupplierList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSuppliersList();
  }, [fetchSuppliersList]);

  // Handlers
  const handleAddSupplier = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setSupplierName("");
    setContactPerson("");
    setEmail("");
    setAddress("");
    setProductsSupplied("");
    setPaymentTerms("");
    setPhoneNumber("");
    setMobileNumber("");
    setDesignation("");
    setNtn("");
    setGst("");
    setCreditLimit("");

    setStatus(true);
  };

  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  // Save or Update Supplier
  const handleSave = async () => {
    if (
      paymentTerms === "CreditCard" &&
      status &&
      (!creditLimit || creditLimit > 5000000)
    ) {
      toast.error("❌ Credit limit is required and must not exceed 50 lac");
      return;
    }

    setIsSaving(true);

    const formData = {
      supplierName,

      contactNumber: phoneNumber,
      address,

      paymentTerms: paymentTerms === "CreditCard" ? "Credit" : paymentTerms, // map CreditCard -> Credit
      creditTime: paymentTerms === "CreditCard" ? creditTime : undefined, // <-- add this state
      creditLimit: paymentTerms === "CreditCard" ? creditLimit : undefined,
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

        toast.success(" Supplier updated successfully");
      } else {
        res = await axios.post(`${API_URL}`, formData, { headers });

        setSupplierList([...supplierList, res.data]);

        toast.success("Supplier added successfully");
      }
      fetchSuppliersList();
      setSupplierName("");
      setContactPerson("");
      setEmail("");
      setAddress("");
      setProductsSupplied("");
      setPaymentTerms("");
      setPhoneNumber("");
      setDesignation("");
      setNtn("");
      setGst("");
      setCreditLimit("");
      setCreditTime("");
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

  // Edit Supplier
  const handleEdit = (supplier) => {
    setIsEdit(true);
    setEditId(supplier._id);
    setSupplierName(supplier.supplierName);
    setContactPerson(supplier.contactPerson);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setPhoneNumber(supplier.contactNumber || "");
    setMobileNumber(supplier.mobileNumber || "");
    setDesignation(supplier.designation || "");
    setNtn(supplier.ntn || "");
    setGst(supplier.gst || "");
    setPaymentTerms(
      supplier.paymentTerms === "Credit"
        ? "CreditCard"
        : supplier.paymentTerms || ""
    );
    setCreditLimit(supplier.creditLimit || "");
    setCreditTime(supplier.creditTime || "");
    setStatus(supplier.status);
    setIsSliderOpen(true);
  };

  // Delete Supplier
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

            setSupplierList(supplierList.filter((s) => s._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Supplier deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete supplier.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Supplier is safe 🙂",
            "error"
          );
        }
      });
  };

  // 🔹 Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // Filter suppliers by name, contact, or address
  const filteredSuppliers = supplierList.filter(
    (s) =>
      (s.supplierName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      String(s.contactNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentRecords = filteredSuppliers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSuppliers.length / recordsPerPage);
useEffect(() => {
  setCurrentPage(1)
}, [searchQuery])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />
      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Suppliers List</h1>
          <p className="text-gray-500 text-sm">Manage your supplier details</p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4 w-[300px]">
          <input
            type="text"
            placeholder="Search by name, contact, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/5 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
            onClick={handleAddSupplier}
          >
            + Add Supplier
          </button>
        </div>
      </div>

      {/* Supplier Table */}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            {/* ✅ Table Header (desktop only) */}
            <div className="hidden lg:grid  grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Sr</div>
              <div>Name</div>
              <div>Contact</div>
              <div>Address</div>
              <div>Payment</div>

              {userInfo?.isAdmin && (
                <div className={`${loading ? "" : "text-right"}`}>Actions</div>
              )}
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={supplierList.length > 0 ? supplierList.length : 5}
                  cols={userInfo?.isAdmin ? 6 : 7}
                  className="lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr]"
                />
              ) : supplierList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No suppliers found.
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No suppliers found.
                </div>
              ) : (
                currentRecords?.map((s, index) => (
                  <>
                    {/* ✅ Desktop Row */}
                    <div
                      key={s._id}
                      className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      <div className="text-gray-900">
                        {indexOfFirstRecord + index + 1}
                      </div>
                      <div className="text-gray-700">{s.supplierName}</div>
                      <div className="text-gray-600">{s.contactNumber}</div>
                      <div className="text-gray-600">{s.address}</div>
                      <div className="text-gray-600">
                        {s.paymentTerms}
                        {s.paymentTerms === "CreditCard" && s.creditLimit
                          ? ` (${s.creditLimit})`
                          : ""}
                      </div>

                      {userInfo?.isAdmin && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="text-red-600 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ✅ Mobile Card */}
                    <div
                      key={`mobile-${s._id}`}
                      className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {s.supplierName}
                      </h3>
                      <p className="text-sm text-gray-600">{s.contactPerson}</p>
                      <p className="text-sm text-gray-600">{s.email}</p>
                      <p className="text-sm text-gray-600">{s.phoneNumber}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {s.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {s.paymentTerms}{" "}
                        {s.paymentTerms === "CreditCard" && s.creditLimit
                          ? `(Limit: ${s.creditLimit})`
                          : ""}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          s.status ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {s.status ? "Active" : "Inactive"}
                      </p>

                      {userInfo?.isAdmin && (
                        <div className="mt-3 flex justify-end gap-3">
                          <button
                            className="text-blue-500"
                            onClick={() => handleEdit(s)}
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDelete(s._id)}
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
              <div className="flex justify-between items-center py-4 px-6 bg-white border-t rounded-b-xl mt-2 shadow-sm">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRecord + 1}–
                  {Math.min(indexOfLastRecord, supplierList.length)} of{" "}
                  {supplierList.length} suppliers
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

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Supplier" : "Add New Supplier"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setSupplierName("");
                  setContactPerson("");
                  setEmail("");
                  setAddress("");
                  setProductsSupplied("");
                  setPaymentTerms("");
                  setPhoneNumber("");
                  setDesignation("");
                  setNtn("");
                  setGst("");
                  setCreditLimit("");
                  setStatus(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              {/* Supplier Fields */}
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Enter supplier name"
                    type="text"
                    value={supplierName}
                    required
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                {/* <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    required
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. +1-212-555-1234"
                  />
                </div> */}
              </div>
              {/* <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    required
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 03001234567"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Email Address <span className="text-red-500">*</span>
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
                      // Allow only digits (0–9)
                      if (/^\d*$/.test(value)) {
                        setPhoneNumber(value);
                      }
                    }}
                    maxLength={11} // optional: limit to 11 digits (common for phone numbers)
                    className="w-full p-2 border rounded"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter address"
                  type="text"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Payment Terms */}

              <div>
                <label className="block text-gray-700 font-medium">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="CreditCard"
                      checked={paymentTerms === "CreditCard"}
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

              {paymentTerms === "CreditCard" && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Time Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditTime}
                      onChange={(e) => setCreditTime(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter time limit (days)"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-gray-700 font-medium">
                      Credit Cash Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setCreditLimit(value);

                        // Show error if greater than 5,000,000
                        if (value > 5000000) {
                          setCreditLimitError(
                            "You cannot add more than 5,000,000 credit cash limit."
                          );
                        } else {
                          setCreditLimitError("");
                        }
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Enter cash limit"
                    />

                    {/* Error message */}
                    {creditLimitError && (
                      <p className="text-red-500 text-sm mt-1">
                        {creditLimitError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}

              {/* Save Button */}

              <button
                className={`${
                  isEdit
                    ? "bg-newPrimary hover:bg-newPrimary/80"
                    : "bg-newPrimary hover:bg-newPrimary/80"
                } text-white px-4 py-2 rounded-lg w-full`}
                onClick={handleSave}
              >
                {isEdit ? "Update Supplier" : "Save Supplier"}
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
          .grid-cols-\[1fr_2fr_1.5fr_2fr_3fr_2fr_2fr_1fr_0.5fr\] {
            grid-template-columns: 1fr 2fr 1.5fr 2fr 2.5fr 1.5fr 1.5fr 1fr 0.5fr;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-\[1fr_2fr_1.5fr_2fr_3fr_2fr_2fr_1fr_0.5fr\] {
            grid-template-columns: 1fr 1.5fr 1fr 1.5fr 2fr 1fr 1fr 0.8fr 0.5fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DefineSupplier;
