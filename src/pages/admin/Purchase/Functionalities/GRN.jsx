import React, { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Loader, SquarePen, Trash2, X } from "lucide-react";
import axios from "axios";
import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import ViewModel from "../../../../helper/ViewModel";
import { ScaleLoader } from "react-spinners";

const GRN = () => {
  const [grns, setGrns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [supplierError, setSupplierError] = useState("");
  const [itemError, setItemError] = useState("");

  const [records, setRecords] = useState([]);
  const [salesmanList, setSalesmanList] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState("");
  const [balance, setBalance] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState(0);
  const [description, setDescription] = useState("");
  const [gatePassOptions, setGatePassOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grnId, setGrnId] = useState("");
  const [date, setDate] = useState("");
  const [gatePassIn, setGatePassIn] = useState("");
  const [supplier, setSupplier] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [isView, setIsView] = useState(false);
  const [editingGrn, setEditingGrn] = useState(null);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const sliderRef = useRef(null);
  const [nextGRNId, setNextGrnId] = useState("001");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 🔹 Fetch Salesman List
  const fetchSalesmen = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSalesmanList(res.data || []);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      setTimeout(() => {
        toast.error("Failed to load salesmen");
      }, 2000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);
  // console.log({salesmanList});

  // 🔹 Fetch Item Options
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details/order-taker`
      );
      setItemOptions(res.data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setTimeout(() => {
        toast.error("Failed to load items");
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    fetchSalesmen();
    fetchItems();
  }, [fetchSalesmen, fetchItems]);
  console.log(itemOptions);

  // 🔹 Handle Salesman Select
  const handleSalesmanChange = (e) => {
    const salesmanId = e.target.value;
    setSelectedSalesman(salesmanId);

    const selected = salesmanList.find((s) => s._id === salesmanId);

    if (selected) {
      // 🔥 Check limit & show inline error
      if (selected.payableBalance >= 5000000) {
        setSupplierError(
          "Supplier credit/cash limit exceeded (50 lakh). Please change supplier."
        );

        // Reset data if needed
        setSelectedSalesman("");
        setBalance("");
        setPhone("");
        setAddress("");

        return;
      }

      // If OK → clear error
      setSupplierError("");

      // existing code
      setBalance(selected.payableBalance || 0);
      setPhone(selected.contactNumber || "-");
      setAddress(selected.address || "-");
    }
  };

  const handleItemsChange = (e) => {
    const itemId = e.target.value;
    setItem(itemId);

    // const selected = itemOptions.find((opt) => opt._id === itemId);
    // if (selected) {
    //   setRate(selected.purchase || 0); // ✅ auto set rate from purchase field
    // }
  };

  // Fetch GRNs
  const fetchGrns = useCallback(async () => {
    try {
      setLoading(true);
      const { token } = userInfo || {};
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/grn`, {
        headers,
      });
      // console.log("GRN API Response:", res.data); // Debug API response
      const transformedGrns = res.data.data.map((grn) => ({
        _id: grn._id,
        grnId: grn.grnId || "-",
        grnDate: formatDate(grn.grnDate) || "-",
        supplier: {
          supplierName: grn.Supplier?.supplierName || "-",
        },
        items:
          grn.products?.map((p) => ({
            item: p.item,
            qty: p.qty,
            rate: p.rate,
            total: p.total,
          })) || [],
        totalAmount: grn.totalAmount || 0, // ✅ added totalAmount
      }));

      setGrns(transformedGrns);
    } catch (error) {
      console.error("Failed to fetch GRNs:", error);
      setTimeout(() => {
        toast.error(error.response?.data?.error || "Failed to fetch GRNs.");
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  }, []);

  useEffect(() => {
    fetchGrns();
  }, [fetchGrns]);

  // Next GRN ID
  useEffect(() => {
    if (grns.length > 0) {
      const maxNo = Math.max(
        ...currentRecords.map((r) => {
          const match = r.grnId?.match(/GRN-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      setNextGrnId((maxNo + 1).toString().padStart(3, "0"));
    } else {
      setNextGrnId("001");
    }
  }, [grns]);

  // Handlers for form and table actions
  const handleAddClick = () => {
    setEditingGrn(null);
    setGrnId("");
    setDate(new Date().toLocaleDateString("en-CA"));
    setGatePassIn("");
    setSelectedSalesman(""); // ✅ clear selected supplier dropdown
    setBalance(""); // ✅ clear balance
    setPhone(""); // ✅ clear phone
    setAddress(""); // ✅ clear address
    setItemsList([]);
    setItem("");
    setQty("");
    setRate("");
    setItemError("")
    setSupplierError("")
    setDescription("");
    setDiscount(0);
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (grn) => {
    console.log(grn);

    // ✅ Fix date formatting (already correct)
    const formattedDate = (() => {
      const parts = grn.grnDate.split("-");
      const day = parts[0];
      const month = new Date(`${parts[1]} 1, ${parts[2]}`).getMonth() + 1;
      const year = parts[2];
      return `${year}-${month.toString().padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
    })();

    setEditingGrn(grn);
    setGrnId(grn.grnId);
    setDate(formattedDate);

    // ✅ Supplier section (unchanged)
    const selectedSupplier = salesmanList.find(
      (s) => s.supplierName === grn.supplier?.supplierName
    );
    setSelectedSalesman(selectedSupplier?._id || "");
    setSupplier(grn.supplier?.supplierName || "");
    setAddress(selectedSupplier?.address || "-");
    setPhone(selectedSupplier?.phoneNumber || "-");
    setBalance(selectedSupplier?.payableBalance || 0);

    // ✅ Items section (unchanged)
    setItemsList(
      (grn.items || []).map((it) => ({
        item: it.item,
        qty: it.qty,
        rate: it.rate || 0,
        total: it.total || it.qty * (it.rate || 0),
      }))
    );

    // ✅ This line ensures totalAmount (3000) appears correctly in summary section
    setDiscount(
      (grn.items || []).reduce((sum, i) => sum + i.total, 0) -
        (grn.totalAmount || 0)
    );

    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSalesman) {
      toast.error("Please select a salesman.");
      return;
    }

    // 🔸 Step 2: Validate items list
    if (itemsList.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }
    setIsSaving(true);
    // 🔸 Step 3: Build request payload
    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 🧮 Calculate totals
    const grossTotal = itemsList.reduce((sum, i) => sum + i.total, 0);
    const payableAmount = grossTotal - (discount || 0);

    const newGrn = {
      grnDate: date,
      supplierId: selectedSalesman,
      products: itemsList.map((item) => ({
        item: item.item,
        qty: item.qty,
        rate: item.rate,
        total: item.total,
      })),
      totalAmount: payableAmount,
    };

    // console.log({ newGrn });

    // 🔸 Step 4: API call
    try {
      if (editingGrn) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/grn/${editingGrn._id}`,
          newGrn,
          { headers }
        );
        Swal.fire("Updated!", "GRN updated successfully.", "success");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/grn`, newGrn, {
          headers,
        });
        Swal.fire("Added!", "GRN added successfully.", "success");
      }

      fetchGrns();
      setIsSliderOpen(false);
      setItemsList([]);
      setDiscount(0);
    } catch (error) {
      console.error("Error saving GRN:", error);
      toast.error(error.response?.data?.error || "Failed to save GRN.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
  };

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
            const { token } = userInfo || {};
            const headers = {
              Authorization: `Bearer ${token}`,
            };
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/grn/${id}`,
              { headers }
            );
            setGrns(grns.filter((g) => g._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "GRN deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete GRN.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "GRN is safe 🙂", "error");
        }
      });
  };

  const handleView = (grn) => {
    setSelectedGrn(grn);
    setIsView(true);
  };
  const handleRemoveItem = (index) => {
    setItemsList((prev) => prev.filter((_, i) => i !== index));
    setDiscount(0); // ✅ reset discount after removing an item
  };

  // Filter GRNs by GRN ID or Supplier Name
  const filteredGrns = grns.filter(
    (grn) =>
      grn.grnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplier?.supplierName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Pagination based on filtered records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredGrns.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Update total pages based on filtered results
  const totalPages = Math.ceil(filteredGrns.length / recordsPerPage);

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
            <div>
              <h1 className="text-2xl font-bold text-newPrimary">
                Goods Received Note Details
              </h1>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by GRN ID or supplier"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
              />
              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
                onClick={handleAddClick}
              >
                + Add GRN
              </button>
            </div>
          </div>

          <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="inline-block min-w-[1200px] w-full align-middle">
                  <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_0.2fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                    <div>Sr</div>
                    <div>GRN ID</div>
                    <div>GRN Date</div>
                    <div>Supplier</div>
                    <div>Total Amount</div>
                    <div className={`${loading ? "" : "text-right"}`}>
                      Actions
                    </div>
                  </div>

                  <div className="flex flex-col divide-y divide-gray-100">
                    {loading ? (
                      <TableSkeleton
                        rows={grns.length || 5}
                        cols={6}
                        className="lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_0.2fr]"
                      />
                    ) : filteredGrns.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-white">
                        No GRNs found.
                      </div>
                    ) : (
                      currentRecords.map((grn, i) => (
                        <div
                          key={grn._id}
                          className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_0.2fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                        >
                          <div className="text-gray-600">
                            {indexOfFirstRecord + i + 1}
                          </div>
                          <div className="text-gray-600">
                            {grn.grnId || "-"}
                          </div>
                          <div className="text-gray-600">
                            {grn.grnDate || "-"}
                          </div>
                          <div className="text-gray-600">
                            {grn.supplier?.supplierName || "-"}
                          </div>

                          <div className="text-gray-500">
                            {grn.totalAmount || "-"}
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                            onClick={() => handleEditClick(grn)}
                            className="py-1 text-sm rounded text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                           
                            <button
                              onClick={() => handleDelete(grn._id)}
                              className="py-1 text-sm text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                             <button
                              onClick={() => handleView(grn)}
                              className="text-amber-600 hover:bg-amber-50 rounded"
                              title="View GRN"
                            >
                              <Eye size={18} />
                            </button>
                            {/* <button
                            onClick={() => handleView(grn)}
                            className="text-amber-600 hover:underline"
                          >
                            <Eye size={18} />
                          </button> */}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                      <p className="text-sm text-gray-600">
                        Showing {indexOfFirstRecord + 1} to{" "}
                        {Math.min(indexOfLastRecord, grns.length)} of{" "}
                        {grns.length} GRNs
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
          </div>

          {isSliderOpen && (
            <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
              <div
                ref={sliderRef}
                className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                {isSaving && (
                  <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[60]">
                    <ScaleLoader color="#1E93AB" size={60} />
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                  <h2 className="text-xl font-bold text-newPrimary">
                    {editingGrn ? "Update GRN" : "Add a New GRN"}
                  </h2>
                  <button
                    className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                    onClick={() => {
                      setIsSliderOpen(false);
                      setGrnId("");
                      setDate("");
                      setGatePassIn("");
                      setSupplier("");
                      setAddress("");
                      setPhone("");
                      setItemsList([]);
                      setItem("");
                      setQty("");
                      setDescription("");
                      setIsEnable(true);
                      setEditingGrn(null);
                    }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        GRN ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingGrn ? grnId : `GRN-${nextGRNId}`}
                        onChange={(e) => setGrnId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        placeholder="Enter GRN ID"
                        readOnly={!!editingGrn}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        disabled
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSalesman}
                        onChange={handleSalesmanChange}
                        className="w-full outline-none p-3 border rounded-md focus:ring-2 focus:ring-newPrimary"
                      >
                        <option value="">Select Supplier</option>
                        {salesmanList.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.supplierName}
                          </option>
                        ))}
                      </select>
                      {supplierError && (
                        <p className="text-red-500 whitespace-nowrap text-sm mt-1">
                          {supplierError}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Balance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={balance}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary bg-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* items section */}
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                    <div className="flex gap-4">
                      {/* Item Dropdown */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Item
                        </label>
                        <select
                          value={item}
                          onChange={handleItemsChange}
                          className="w-full outline-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                        >
                          <option value="">Select Item</option>
                          {itemOptions.map((opt) => (
                            <option key={opt._id} value={opt._id}>
                              {opt.itemName}
                            </option>
                          ))}
                        </select>
                        {itemError && (
                          <p className="text-red-500 whitespace-nowrap text-sm mt-1">
                            {itemError}
                          </p>
                        )}
                      </div>

                      {/* Rate */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Rate
                        </label>
                        <input
                          type="number"
                          value={rate}
                          onChange={(e) =>
                            setRate(parseFloat(e.target.value) || 0)
                          }
                          className="w-full outline-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter rate"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={qty}
                          min={1}
                          onChange={(e) =>
                            setQty(parseFloat(e.target.value) || 0)
                          }
                          className="w-full outline-none p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-newPrimary"
                          placeholder="Enter quantity"
                        />
                      </div>

                      {/* Total (auto calc) */}
                      <div className="flex-1 min-w-0">
                        <label className="block text-gray-700 font-medium mb-2">
                          Total
                        </label>
                        <input
                          type="number"
                          value={qty && rate ? qty * rate : ""}
                          readOnly
                          className="w-full outline-none p-3 border border-gray-300 rounded-md bg-gray-100"
                          placeholder="Auto Total"
                        />
                      </div>

                      {/* Add Button */}
                      <div className={`${itemError?"items-center":"items-end"} flex `}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!item || !qty || !rate) {
                              toast.error("Please fill all fields");
                              return;
                            }

                            const selectedItem = itemOptions.find(
                              (opt) => opt._id === item
                            );
                            const total = qty * rate;
                            // 🔥 CALCULATE CURRENT + NEW TOTAL
                            const currentTotal = itemsList.reduce(
                              (sum, i) => sum + i.total,
                              0
                            );
                            const newPayable = currentTotal + total;

                            // 🔥 Check supplier limit (50 lakh)
                            if (balance + newPayable >= 5000000) {
                              setItemError(
                                "Supplier limit exceeded It must be less than 50 lakh. Reduce rate or quantity."
                              );
                              return; // ❌ STOP adding item
                            }

                            // Clear error if OK
                            setItemError("");

                            const newItem = {
                              item: selectedItem?.itemName || "Unknown",
                              qty,
                              rate,
                              total,
                            };

                            setItemsList((prev) => [...prev, newItem]);
                            setItem("");
                            setQty("");
                            setRate("");
                            setDiscount(0);
                          }}
                          className="w-20 h-12 bg-newPrimary text-white rounded-lg hover:bg-newPrimary/80 transition"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Items Table */}
                    {itemsList.length > 0 && (
                      <div className="overflow-x-auto">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                              <tr>
                                <th className="px-4 py-2 border border-gray-300">
                                  Sr #
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Item
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Qty
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Rate
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Total
                                </th>
                                <th className="px-4 py-2 border border-gray-300">
                                  Remove
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm">
                              {itemsList.map((it, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 text-center"
                                >
                                  <td className="px-4 py-2 border border-gray-300">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {it.item}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {it.qty}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {it.rate}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    {it.total}
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      className="text-red-600 hover:bg-red-100 rounded-full  transition"
                                      title="Remove Item"
                                    >
                                      <X size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Summary Section */}
                    {itemsList.length > 0 && (
                      <div className="mt-4 border-t pt-4 flex justify-between items-start text-sm text-gray-700">
                        {/* LEFT SIDE: Total Items + Total Qty */}
                        <div>
                          <p className="font-semibold">
                            Total Items:{" "}
                            <span className="font-normal">
                              {itemsList.length}
                            </span>
                          </p>
                          <p className="font-semibold">
                            Total Qty:{" "}
                            <span className="font-normal">
                              {itemsList.reduce((sum, i) => sum + i.qty, 0)}
                            </span>
                          </p>
                        </div>

                        {/* RIGHT SIDE: Total Amount + Discount + Payable */}
                        <div className="text-right">
                          <p className="font-semibold">
                            Total Amount:{" "}
                            <span className="font-normal">
                              {itemsList
                                .reduce((sum, i) => sum + i.total, 0)
                                .toLocaleString()}
                            </span>
                          </p>

                          <div className="flex items-center justify-end gap-2 mt-1">
                            <label className="font-semibold">Discount:</label>
                            <input
                              type="number"
                              value={discount}
                              onChange={(e) =>
                                setDiscount(parseFloat(e.target.value) || 0)
                              }
                              className="w-28 p-2 border rounded-md text-right"
                              placeholder="0"
                            />
                          </div>

                          <p className="font-semibold mt-1">
                            Payable:{" "}
                            <span className="font-bold text-green-600">
                              {(
                                itemsList.reduce((sum, i) => sum + i.total, 0) -
                                (discount || 0)
                              ).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                  >
                    {loading
                      ? "Saving..."
                      : editingGrn
                      ? "Update GRN"
                      : "Save GRN"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {isView && selectedGrn && (
            <ViewModel
              data={selectedGrn}
              type="grn"
              onClose={() => setIsView(false)}
            />
          )}

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

export default GRN;
