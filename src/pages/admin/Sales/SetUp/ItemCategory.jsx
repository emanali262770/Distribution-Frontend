import React, { useState, useEffect, useCallback, useRef } from "react";
import { HashLoader, ScaleLoader } from "react-spinners";
import gsap from "gsap";
import axios from "axios";
import Swal from "sweetalert2";

import { SquarePen, Trash2 } from "lucide-react";

import CommanHeader from "../../Components/CommanHeader";
import TableSkeleton from "../../Components/Skeleton";
import toast from "react-hot-toast";

const ItemCategory = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [isEnable, setIsEnable] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const sliderRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/categories`;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Initialize categories with static data
  // Supplier List Fetch
  const fetchCategoiresList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/categories`
      );
      setCategories(res.data); // store actual categories array
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);
  useEffect(() => {
    fetchCategoiresList();
  }, [fetchCategoiresList]);

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

  // Handlers
  const handleAddClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsEnable(true);
    setIsSliderOpen(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setIsEnable(category.isEnable);
    setIsSliderOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      toast.error("Category name cannot be empty.");
      return;
    }

    setIsSaving(true);

    const payload = { categoryName: trimmedName, isEnable };

    try {
      let res;
      if (editingCategory) {
        // 🔄 Update existing category
        res = await axios.put(`${API_URL}/${editingCategory._id}`, payload, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });

        setCategories(
          categories.map((c) => (c._id === editingCategory._id ? res.data : c))
        );
        toast.success("Category updated!");
      } else {
        // ➕ Add new category
        res = await axios.post(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        });

        setCategories([...categories, res.data]);
        toast.success("Category added!");
      }

      // Reset form state
      setIsSliderOpen(false);
      setCategoryName("");
      setIsEnable(true);
      fetchCategoiresList();
      setEditingCategory(null);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${editingCategory ? "update" : "add"} category.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnable = async (category) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: `Do you want to ${
          category.isEnable ? "disable" : "enable"
        } this category?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Yes, ${
          category.isEnable ? "disable" : "enable"
        } it!`,
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            // 🔄 Call API to toggle
            const res = await axios.put(
              `${API_URL}/${category._id}`,
              { isEnable: !category.isEnable }, // send only toggle field
              {
                headers: {
                  Authorization: `Bearer ${userInfo?.token}`,
                },
              }
            );

            // ✅ Update state with API response
            setCategories(
              categories.map((c) => (c._id === category._id ? res.data : c))
            );
            fetchCategoiresList();
            toast.success(
              `Category ${res.data.isEnable ? "enabled" : "disabled"}.`
            );
          } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "An error occurred");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Category status unchanged 🙂",
            "error"
          );
        }
      });
  };

  const handleDelete = async (categoryId) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
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
            // 🔥 Call DELETE API
            await axios.delete(`${API_URL}/${categoryId}`, {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            });

            // ✅ Update frontend state
            setCategories(categories.filter((c) => c._id !== categoryId));

            swalWithTailwindButtons.fire(
              "Deleted!",
              "Category deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error(error);
            toast.error("❌ Failed to delete category.");
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Category is safe 🙂",
            "error"
          );
        }
      });
  };

  // 🔍 Filter Categories
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔢 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Total pages based on filtered result (NOT original list)
  const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);

  // Records slicing based on filtered categories
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredCategories.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="px-6 mx-auto">
        {/* Common Header */}
        <CommanHeader />
        {isSaving && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
            <ScaleLoader color="#1E93AB" size={60} />
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-newPrimary">
              All Categories
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your category details
            </p>
          </div>

          <div className="flex gap-4">
            {/* 🔍 Search Bar */}
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
            />

            <button
              className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
              onClick={handleAddClick}
            >
              + Add Category
            </button>
          </div>
        </div>

        <div className="rounded-xl  border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* ✅ Table Header Style (sticky look) */}
              <div className="hidden lg:grid grid-cols-[80px_1fr_150px_150px_200px] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                <div>SR</div>
                <div>Name</div>
                <div>Status</div>
                <div>Created At</div>
                <div className="text-center">Actions</div>
              </div>

              {/* ✅ Table Body */}
              <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
                {loading ? (
                  // Skeleton shown while loading
                  <TableSkeleton
                    rows={categories.length > 0 ? categories.length : 5}
                    cols={userInfo?.isAdmin ? 5 : 6}
                    className="lg:grid-cols-[80px_1fr_150px_150px_200px]"
                  />
                ) : categories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No categories found.
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-white">
                    No categories found.
                  </div>
                ) : (
                  currentRecords.map((category, index) => (
                    <div
                      key={category._id}
                      className="grid grid-cols-1 lg:grid-cols-[80px_1fr_150px_150px_200px] gap-4 lg:gap-6 items-center px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                    >
                      {/* S.No */}
                      <div className="text-gray-700">
                        {indexOfFirstRecord + index + 1}
                      </div>

                      {/* Name */}
                      <div className="text-gray-700">
                        {category.categoryName}
                      </div>

                      {/* Status */}
                      <div className="font-semibold">
                        {category.isEnable ? (
                          <span className="text-green-600">Enabled</span>
                        ) : (
                          <span className="text-red-600">Disabled</span>
                        )}
                      </div>

                      {/* Created At */}
                      <div className="text-gray-500 truncate">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="text-center">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="px-3 py-1 text-sm rounded  text-blue-600 "
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleEnable(category)}
                          className={`px-3 py-1 text-sm rounded ${
                            category.isEnable
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {category.isEnable ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="px-3 py-1 text-sm rounded  text-red-600 "
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 bg-white border-t mt-2 rounded-b-xl">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, categories.length)} of{" "}
                    {categories.length} records
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
              className="relative w-full md:w-[500px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {editingCategory ? "Update Category" : "Add a New Category"}
                </h2>
                <button
                  className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setCategoryName("");
                    setIsEnable(true);
                    setEditingCategory(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="e.g. Electronics, Clothes"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Status</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEnable(!isEnable)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        isEnable ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          isEnable ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        isEnable ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isEnable ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80 transition-colors disabled:bg-newPrimary/50"
                >
                  {loading
                    ? editingCategory
                      ? "Updating..."
                      : "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Save Category"}
                </button>
              </form>
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
            .grid-cols-\[60px_2fr_1fr_2fr_1fr\] {
              grid-template-columns: 60px 1.5fr 0.8fr 1.5fr 0.8fr;
            }
          }
          @media (max-width: 640px) {
            .grid-cols-\[60px_2fr_1fr_2fr_1fr\] {
              grid-template-columns: 50px 1.2fr 0.6fr 1.2fr 0.6fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ItemCategory;
