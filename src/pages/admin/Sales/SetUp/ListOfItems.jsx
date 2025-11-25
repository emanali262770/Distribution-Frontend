import React, { useState, useEffect, useRef, useCallback } from "react";
import { HashLoader } from "react-spinners";
import gsap from "gsap";

import Swal from "sweetalert2";
import { ScaleLoader } from "react-spinners";
import axios from "axios";
import Barcode from "react-barcode";
import { SquarePen, Trash2 } from "lucide-react";

import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const ListOfItems = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [nextItemCategoryId, setNextItemCategoryId] = useState("001");
  const [itemUnitList, setItemUnitList] = useState([]);
  const [manufacturerList, setManufacturerList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [shelvesList, setShelvesList] = useState([]);
  const [expiryOption, setExpiryOption] = useState("NoExpiry");
  const [expiryDay, setExpiryDay] = useState("");
  // const [itemTypeName, setItemTypeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemList, setItemList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [itemCategory, setItemCategory] = useState({ id: "", name: "" });
  const [itemKind, setItemKind] = useState("Finished Goods");
  const [itemType, setItemType] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [details, setDetails] = useState("");
  const [manufacture, setManufacture] = useState("");
  const [supplier, setSupplier] = useState("");
  const [shelveLocation, setShelveLocation] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  // const [perUnit, setPerUnit] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sales, setSales] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  // const [reorder, setReorder] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  // const [image, setImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [itemTypeList, setItemTypeList] = useState([]);


  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const generateDummyBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };
  const [primaryBarcode, setPrimaryBarcode] = useState(generateDummyBarcode());
  // Utility to generate random barcode string
  const generateRandomBarcode = () => {
    const prefix = "PBC"; // you can change prefix
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    return `${prefix}-${randomPart}`;
  };

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

  // Item Detals Fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-details`
      );
      console.log("Details", res.data);

      setItemList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch item details", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // next gass pass id creation
  useEffect(() => {
    if (Array.isArray(itemList)) {
      const nextNo = (itemList.length + 1).toString().padStart(3, "0");
      setNextItemCategoryId(`${nextNo}`);
    } else {
      setNextItemCategoryId("ITEM-001");
    }
  }, [itemList]);

  // CategoryList Fetch
  const fetchCategoryList = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);
  // item Unit
  const fetchItemUnitList = useCallback(async () => {
    try {
      setIsSaving(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories/list`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitList();
  }, [fetchItemUnitList]);

  // Fetch itemTypes when category changes
  useEffect(() => {
    if (!itemCategory) return; // only call when category selected

    const fetchItemTypes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-details/category/${itemCategory.name
          }`
        );
        setItemTypeList(res.data);
      } catch (error) {
        console.error("Failed to fetch item types", error);
      }
    };

    fetchItemTypes();
  }, [itemCategory]);

  // Item Unit List Fetch
  const fetchItemUnitsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item-unit`
      );
      setItemUnitList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch item unit", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchItemUnitsList();
  }, [fetchItemUnitsList]);

  // console.log({ itemUnitList });

  // Manufacturer List Fetch
  const fetchManufacturerList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/manufacturers/list`
      );
      setManufacturerList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Manufacturer", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchManufacturerList();
  }, [fetchManufacturerList]);

  // Supplier List Fetch
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // Shelves List Fetch
  const fetchShelvesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/shelves`
      );
      setShelvesList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Shelves", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchShelvesList();
  }, [fetchShelvesList]);

  // Handlers
  const handleAddItem = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setItemCategory({ id: "", name: "" }); // ✅
    setItemType("");
    setItemName("");
    setDetails("");
    setManufacture("");
    setSupplier("");
    setItemUnit("");
    // setPerUnit("");
    setPrice("");
    setReorder("");
    setEnabled(true);
    // setImage(null);
    setImagePreview(null);
    setExpiryOption("NoExpiry");
    setExpiryDay("");
  };
  // form validation

  const validateForm = () => {
    let errors = [];

    if (!itemCategory.id) errors.push("Item Category is required");
    if (!itemName) errors.push("Item Name is required");

    // expiry ke liye special case
    // if (expiryOption === "HasExpiry" && !expiryDay) {
    //   errors.push("Expiry day is required when Has Expiry is selected");
    // }

    return errors;
  };
  // console.log("Item Kind ", itemKind);

  // Save or Update Item
  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: errors.join("<br/>"),
      });
      return;
    }
    setIsSaving(true);
    const payload = {
      itemId: editId ? itemCategoryId : `ITEM-${nextItemCategoryId}`,
      itemName,
      itemCategory: itemCategory.id,
      supplier,
      // shelveLocation,
      // itemUnit,
      // isEnable: enabled,
      // primaryBarcode,
      // secondaryBarcode: barcode,
      // itemKind,
      // hasExpiry: expiryOption === "HasExpiry" ? parseInt(expiryDay) || 0 : 0,
      // noHasExpiray: expiryOption === "NoExpiry"
    };

    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      if (isEdit && editId) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/item-details/${editId}`, payload, { headers });
        toast.success("Item List updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/item-details`, payload, { headers });
        toast.success("Item List added successfully");
      }

      // Refresh table
     

      // Close slider
      reState();
       fetchData(); // ✅ Add this line
    } catch (error) {
      console.error({error}, "Error saving item");
      setTimeout(() => {
        toast.error(error.response?.data?.message || "Something went wrong");
      }, 4000);
      
    } finally {
      setIsSaving(false);
    }
  };

  // Set All States Null
  const reState = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setEditId(null);
    setItemCategory("");
    setItemType("");
    setManufacture("");
    setItemName("");
    setDetails("");
    setSupplier("");
    setShelveLocation("");
    setItemUnit("");
    // setPerUnit("");
    // setPurchase("");
    // setSales("");
    // setStock("");
    setPrice("");
    setBarcode("");
    // setReorder("");
    setEnabled(false);
    // setImagePreview("");
    // setImage(null);
    setExpiryOption("NoExpiry");
    setExpiryDay("");
  };

  // Edit Item
  const handleEdit = (item) => {
    // console.log({ item });

    setIsEdit(true);
    setEditId(item._id);

    // Dropdowns
    setItemCategory({
      id: item?.itemCategory?._id || "",
      name: item?.itemCategory?.categoryName || "",
    });
    setManufacture(item?.manufacturer?._id || "");
    setSupplier(item?.supplier?._id || "");
    setShelveLocation(item?.shelveLocation?._id || "");
    setItemUnit(item?.itemUnit?._id || "");
    setItemType(item?.itemType?._id || "");
    setItemCategoryId(item?.itemId);
    // Normal fields
    setItemName(item?.itemName || "");
    // setPerUnit(item?.perUnit ? item.perUnit.toString() : "");
    // setPurchase(item.purchase ? item.purchase.toString() : "");
    // setSales(item.price.toString() ?? "");
    // setStock(item.stock ? item.stock.toString() : "");
    setBarcode(item?.secondaryBarcode || "");
    // setReorder(item.reorder ? item.reorder.toString() : "");
    setItemKind(item.itemKind || "");
    setPrimaryBarcode(generateDummyBarcode());

    // Expiry fields
    if (item.noHasExpiray === true) {
      setExpiryOption("NoExpiry");
      setExpiryDay("");
    } else if (item.hasExpiry && item.hasExpiry > 0) {
      setExpiryOption("HasExpiry");
      setExpiryDay(item.hasExpiry.toString());
    } else {
      // fallback if neither exists
      setExpiryOption("NoExpiry");
      setExpiryDay("");
    }

    // Enable/Disable
    setEnabled(item.isEnable !== undefined ? item.isEnable : true);

    // Image
    // setImagePreview(item?.itemImage?.url || "");
    // setImage(null);

    setIsSliderOpen(true);
  };

  // Delete Item
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
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/item-details/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${userInfo.token}`, // if you’re using auth
                },
              }
            );
            setItemList(itemList.filter((item) => item._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Item deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete item.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire("Cancelled", "Item is safe 🙂", "error");
        }
      });
  };

  // // Image Upload
  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImage(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // // Remove Image
  // const removeImage = () => {
  //   setImage(null);
  //   setImagePreview("");
  // };
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const categoryObj = categoryList.find((c) => c._id === selectedId);
    setItemCategory({
      id: selectedId,
      name: categoryObj?.categoryName || "",
    });
  };


  const filteredItems = itemList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(term) ||
      item.itemCategory?.categoryName?.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // you can change this

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredItems.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);



useEffect(() => {
 setCurrentPage(1)
}, [searchTerm])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Coomon header */}
      <CommanHeader />

      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}

      <div className="flex justify-between items-center mt-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">Items List</h1>
        </div>

        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Item Name or Type..."
              className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />
          </div>

          {/* Add Item Button */}
          <button
            className="h-10 bg-newPrimary text-white px-4 rounded-lg hover:bg-primaryDark"
            onClick={handleAddItem}
          >
            + Add Item
          </button>
        </div>
      </div>


      {/* Item Table */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-screen overflow-y-auto custom-scrollbar">
            <div className="inline-block w-full align-middle">
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_0.5fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>Sr</div>
                <div>Item Category</div>
                <div>Item Name</div>
                {userInfo?.isAdmin && <div className="">Actions</div>}
              </div>

              {/* Body */}
              <div className="flex flex-col divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton
                    rows={itemList.length || 5}
                    cols={userInfo?.isAdmin ? 4 : 6}
                    className="lg:grid-cols-[0.2fr_1fr_1fr_0.5fr]"
                  />
                ) : itemList.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No Items found.
                  </div>
                ) : (
                  currentRecords.map((item, index) => (
                    <div
                      key={item._id}
                      className="grid grid-cols-1 lg:grid-cols-[0.2fr_1fr_1fr_0.5fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      {indexOfFirstRecord + index + 1}
                      {/* Item Category (with icon) */}
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {item?.itemCategory?.categoryName || "-"}
                        </span>
                      </div>

                      {/* Item Name */}
                      <div className="text-gray-600">
                        {item.itemName || "-"}
                      </div>

                      {/* Actions */}
                      {userInfo?.isAdmin && (
                        <div className="flex justify-start gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-500 hover:underline"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:underline"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, itemList.length)} of{" "}
                    {itemList.length} records
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1
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
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages
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

      {/* Slider */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[700px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Item" : "Add a New Item"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setItemCategory("");
                  setItemName("");
                  setDetails("");
                  setManufacture("");
                  setSupplier("");
                  setShelveLocation("");
                  setItemUnit("");
                  // setPerUnit("");
                  setPrice("");
                  setBarcode("");
                  // setReorder("");
                  setEnabled(true);
                  // setImage(null);
                  // setImagePreview(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-6 bg-white rounded-xl shadow-md space-y-4">
              <div className="space-y-8">
                {/* Section 1 */}
                <div className="space-y-4">
                  <div className="flex gap-5">
                    {/* Item Category ID */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Category ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          editId ? itemCategoryId : `ITEM-${nextItemCategoryId}`
                        }
                        onChange={(e) => setItemCategoryId(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                        placeholder="Enter Category ID"
                      />
                    </div>
                    {/* Primary Barcode */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Primary Barcode <span className="text-red-500">*</span>
                      </label>

                      {primaryBarcode ? (
                        <div className="">
                          <Barcode value={primaryBarcode} height={30} />
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm mt-2">No barcode generated</p>
                      )}
                    </div>

                  </div>
                </div>
                {/* Section 2 */}
                <div className="border px-4 py-8 rounded-lg bg-formBgGray space-y-4">
                  <div className="flex gap-5">
                    {/* Item Category */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemCategory.id}
                        required
                        onChange={handleCategoryChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Category</option>
                        {categoryList.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Supplier */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Supplier
                      </label>
                      <select
                        value={supplier}
                        required
                        onChange={(e) => setSupplier(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Supplier</option>
                        {supplierList.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.supplierName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-[49%] min-w-0">
                      <label className="block text-gray-700 font-medium">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        required
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

              </div>
              {/* <div className="flex gap-20">
                <div>
                  <label className="block text-gray-700 font-medium">
                    Expiry Day
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="NoExpiry"
                        checked={expiryOption === "NoExpiry"}
                        onChange={(e) => setExpiryOption(e.target.value)}
                        className="form-radio"
                      />
                      No Expiry days
                    </label>
                    {expiryOption === "HasExpiry" ? (
                      <div className="flex-1 min-w-0">
                        {expiryOption === "HasExpiry" && (
                          <fieldset className="relative mt-1 border-2 border-blue-600 rounded-md px-3">
                            <legend className="px-1 text-sm text-blue-700">
                              Has Expiry Days{" "}
                              <span className="text-red-500">*</span>
                            </legend>
                            <input
                              type="number"
                              id="expiryDays"
                              value={expiryDay}
                              required
                              onChange={(e) => setExpiryDay(e.target.value)}
                              placeholder="Enter expiry days"
                              className="w-full p-2 focus:outline-none focus:ring-0 py-2"
                            />
                          </fieldset>
                        )}
                      </div>
                    ) : (
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="HasExpiry"
                          checked={expiryOption === "HasExpiry"}
                          onChange={(e) => setExpiryOption(e.target.value)}
                          className="form-radio"
                        />
                        Has Expiry days
                      </label>
                    )}
                  </div>
                </div>
              </div> */}


              {/* Save Button */}
              <button
                className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-blue-300"
                onClick={handleSave}
              >
                {isEdit ? "Update Item" : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOfItems;
