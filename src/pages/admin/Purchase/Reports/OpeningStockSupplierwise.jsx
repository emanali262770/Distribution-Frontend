import { Loader, SaveIcon, Search, XCircle } from "lucide-react";
import React, { useState, useCallback, useEffect, useRef } from "react";

import CommanHeader from "../../Components/CommanHeader";
import axios from "axios";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";
import { set } from "date-fns";

const OpeningStock = () => {
  const [itemCategory, setItemCategory] = useState("");
  const [itemType, setItemType] = useState("");
  const [supplier, setSupplier] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [itemNameList, setItemNameList] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [editingStockIndex, setEditingStockIndex] = useState(null);
  const [showCategoryError, setShowCategoryError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const tableRef = useRef(null);
  const [showZeroStock, setShowZeroStock] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: "",
    itemType: "",
    itemSearch: "",
  });

  // Refresh the Page called api
  // Refresh the Page called api
  // Fetch all items initially
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/item-details`
        );
        setItemNameList(res.data);
      } catch (error) {
        console.error("Failed to fetch items", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchAllItems();
  }, [isClearing]); // refresh if clearing form

  // CategoryList Fetch
  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategoryList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // CategoryList Fetch
  const fetchSupplierList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/suppliers`
      );
      setSupplierList(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, []);
  useEffect(() => {
    fetchSupplierList();
  }, [fetchSupplierList]);

  // Fetch itemTypes when category changes
  // useEffect(() => {
  //   if (!itemCategory || isClearing) return; // only call when category selected

  //   const fetchItemTypes = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await axios.get(
  //         `${
  //           import.meta.env.VITE_API_BASE_URL
  //         }/item-type/category/${itemCategory}`
  //       );
  //       setItemTypeList(res.data);
  //     } catch (error) {
  //       console.error("Failed to fetch item types", error);
  //     } finally {
  //       setTimeout(() => setLoading(false), 1000);
  //     }
  //   };

  //   fetchItemTypes();
  // }, [itemCategory, isClearing]);

  // when itemType Select then Table repaint according api response
  useEffect(() => {
    if (!itemCategory) return; // do nothing if no category selected

    const fetchItemsByCategory = async () => {
      setLoading(true); // show loader
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/item-details/category/${itemCategory}`
        );
        setItemNameList(res.data); // update table data
      } catch (error) {
        console.error("Failed to fetch items by category", error);
        setItemNameList([]); // clear table on error
      } finally {
        setTimeout(() => setLoading(false), 500); // hide loader
      }
    };

    fetchItemsByCategory();
  }, [itemCategory]);

  // Track editing state per cell
  const [editing, setEditing] = useState({});

  const handleChange = (index, field, value) => {
    const updated = [...itemNameList];
    updated[index][field] = value;
    setItemNameList(updated);
  };

  const handleBlur = (index, field) => {
    setEditing((prev) => ({ ...prev, [`${index}-${field}`]: false }));
  };

  const handleFocus = (index, field) => {
    setEditing((prev) => ({ ...prev, [`${index}-${field}`]: true }));
  };

  // ✅ Hide Action when clicking outside the table
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setEditingStockIndex(null);
      }
    };

    // ✅ use capture phase so it triggers before React bubbling
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  // ✅ Filter + Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // Filter items by category, type, or item
  const filteredItems = itemNameList.filter((item) => {
    const matchesCategory = itemCategory
      ? item?.itemCategory?.categoryName?.toLowerCase() ===
        itemCategory.toLowerCase()
      : true;

    const matchesSearch =
      (item?.itemName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item?.itemCategory?.categoryName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // ✅ Filter based on stock zero / non-zero
    const matchesStock = showZeroStock ? true : parseFloat(item.stock) !== 0;

    return matchesCategory && matchesSearch && matchesStock;
  });

  const currentRecords = filteredItems.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemCategory,searchQuery]);

  useEffect(() => {
    if (!itemCategory) {
      setShowCategoryError(true);
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      {/* Common Header */}
      <CommanHeader />
      {loading ? (
        <div className="w-full flex justify-center items-center h-screen">
          <Loader size={70} color="#1E93AB" className=" animate-spin" />
        </div>
      ) : (
        <div className=" space-y-6">
          <h1 className="text-2xl font-bold text-newPrimary">Stock Position</h1>

          {/* Form */}
          <div className="border rounded-lg shadow bg-white p-6 w-full">
            <div className="flex">
              <div className="grid grid-cols-3 gap-6 items-end w-full">
                {/* Category */}
                <div className="w-full">
                  <label className="block text-gray-700 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => {
                      setItemCategory(e.target.value);
                      setShowCategoryError(false); // hide message after selecting
                    }}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    <option value="">Select Category</option>
                    {categoryList.map((cat, idx) => (
                      <option key={cat._id} value={cat.categoryName}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {showCategoryError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a category before proceeding.
                    </p>
                  )}
                </div>

                {/* Item Type */}
                {/* <div className="w-full">
                  <label className="block text-gray-700 font-medium mb-1">
                    Item Type
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    disabled={!itemCategory}
                    className={`w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200 
                    ${!itemCategory ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select Item Type</option>
                    {itemTypeList.map((type) => (
                      <option key={type._id} value={type.itemTypeName}>
                        {type.itemTypeName}
                      </option>
                    ))}
                  </select>
                </div> */}
              </div>

              <div className="w-[350px] justify-end mt-12">
                {/* Search Bar */}
                <div className="w-[350]">
                  <input
                    type="text"
                    placeholder="Search by category, type, or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="stockFilter"
                value="withZero"
                checked={showZeroStock}
                onChange={() => {
                  setLoading(true); // show loader
                  setShowZeroStock(true);
                  setTimeout(() => setLoading(false), 300); // hide loader after short delay
                }}
                className="w-4 h-4"
              />
              With Zero
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="stockFilter"
                value="withoutZero"
                checked={!showZeroStock}
                onChange={() => {
                  setLoading(true); // show loader
                  setShowZeroStock(false);
                  setTimeout(() => setLoading(false), 300); // hide loader after short delay
                }}
                className="w-4 h-4"
              />
              Without Zero
            </label>
          </div>

          {/* Table */}

          {/* TABLE / CARDS */}

          <div
            ref={tableRef}
            className="rounded-xl shadow border  border-gray-200 overflow-hidden"
          >
            <div className="overflow-y-auto lg:overflow-x-auto max-h-[800px]">
              <div className="min-w-[1000px]">
                {/* ✅ Table Header */}
                <div
                  className={`hidden lg:grid ${
                    editingStockIndex !== null
                      ? "grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                      : "grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                  } gap-4 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200`}
                >
                  <div>Sr</div>
                  <div>Category</div>

                  <div>Item</div>
                  <div>Stock</div>
                  {editingStockIndex !== null && <div>Action</div>}
                </div>

                {/* ✅ Table Body */}
                <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
                  {loading ? (
                    <TableSkeleton
                      rows={itemNameList.length > 0 ? itemNameList.length : 5}
                      cols={editingStockIndex !== null ? 8 : 7}
                      className={`${
                        editingStockIndex !== null
                          ? "lg:grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                          : "lg:grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                      }`}
                    />
                  ) : itemNameList.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No items found.
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No items found.
                    </div>
                  ) : (
                    currentRecords.map((rec, index) => (
                      <div
                        key={rec.code}
                        className={`grid ${
                          editingStockIndex !== null
                            ? "grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                            : "grid-cols-[0.5fr_1fr_1fr_1fr_0.1fr_auto]"
                        } items-center gap-4 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition`}
                      >
                        <div>{indexOfFirstRecord + index + 1}</div>
                        <div>{rec?.itemCategory?.categoryName || "-"}</div>

                        <div className="font-medium text-gray-900">
                          {rec.itemName || "-"}
                        </div>

                        {/* Editable Stock */}
                        <div className="text-gray-600">
                          {editing[`${index}-stock`] ? (
                            <input
                              type="number"
                              value={rec.stock}
                              onChange={(e) =>
                                handleChange(index, "stock", e.target.value)
                              }
                              onBlur={() => {
                                handleBlur(index, "stock");
                                setEditingStockIndex(index);
                              }}
                              autoFocus
                              className="w-20 border rounded p-1"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                handleFocus(index, "stock");
                                setEditingStockIndex(index);
                              }}
                              className="cursor-pointer"
                            >
                              {rec.stock || "-"}
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        {editingStockIndex === index && (
                          <div className="flex gap-3 justify-end">
                            <button
                              className="text-newPrimary hover:bg-green-50 rounded p-1"
                              onClick={async () => {
                                try {
                                  await axios.put(
                                    `${
                                      import.meta.env.VITE_API_BASE_URL
                                    }/item-details/${rec._id}/stock`,
                                    { stock: rec.stock },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${userInfo?.token}`,
                                      },
                                    }
                                  );
                                  console.log(
                                    "✅ Stock updated successfully:",
                                    rec.itemName,
                                    rec.stock
                                  );
                                  setEditingStockIndex(null);
                                  toast.success("Stock updated successfully");
                                } catch (error) {
                                  toast.success(
                                    error.response?.data?.message ||
                                      "Failed to update stock"
                                  );
                                  console.error(
                                    "Failed to update stock:",
                                    error
                                  );
                                }
                              }}
                            >
                              <SaveIcon size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, itemNameList.length)} of{" "}
                      {itemNameList.length} items
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
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
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
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
      )}
    </div>
  );
};

export default OpeningStock;
