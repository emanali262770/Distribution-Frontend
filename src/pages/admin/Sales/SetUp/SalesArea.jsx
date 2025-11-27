import React, { useState, useRef, useCallback, useEffect } from "react";
import CommanHeader from "../../Components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import { api } from "../../../../context/ApiService";
import TableSkeleton from "../../Components/Skeleton";
import { ScaleLoader } from "react-spinners";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const AreaPage = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);
  const [areaData, setAreaData] = useState({
    _id: "",
    areaName: "",
    areaDescription: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(areas.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = areas.slice(indexOfFirstRecord, indexOfLastRecord);
  useEffect(() => {
  setCurrentPage(1);
}, [areas]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Fetch Sales Areas
  const fetchSalesArea = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sales-area");
      setAreas(response); // ✅ fixed
      // console.log("Data", response);
    } catch (error) {
      console.error("Failed to fetch sales data", error);
    } finally {
      setLoading(false); // instead of setTimeout
    }
  }, []);

  useEffect(() => {
    fetchSalesArea();
  }, [fetchSalesArea]);

  // ✅ Submit Area
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true); // start saving
      // No need to set loading here; loader for table is separate

      if (isEditing) {
        await api.put(`/sales-area/${areaData._id}`, {
          salesArea: areaData.areaName,
          description: areaData.areaDescription,
        });
      } else {
        await api.post("/sales-area", {
          salesArea: areaData.areaName,
          description: areaData.areaDescription,
        });
      }

      await fetchSalesArea(); // refresh table
      resetForm(); // close slider & reset form
    } catch (error) {
      console.error("Failed to save area", error);
     toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSaving(false); // stop saving
    }
  };

  // ✅ Delete Area
  const handleDelete = async (areaId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this area?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E93AB",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-xl" },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/sales-area/${areaId}`);
      await fetchSalesArea();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Area has been deleted successfully.",
        confirmButtonColor: "#1E93AB",
        customClass: { popup: "rounded-xl" },
      });
    } catch (error) {
      console.error("Failed to delete area", error);

      Swal.fire({
        icon: "error",
        title: "Delete Error",
        html: "Failed to delete area. Please try again.",
        confirmButtonText: "OK",
        customClass: { popup: "rounded-xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit Area
  const handleEditClick = (area) => {
    setAreaData({
      _id: area?._id,
      areaName: area?.salesArea,
      areaDescription: area?.description,
    });
    setIsEditing(true);
    setIsSliderOpen(true); // no setTimeout needed
  };

  // ✅ Reset Form
  const resetForm = () => {
    setIsSliderOpen(false);
    setIsEditing(false);
    setAreaData({ _id: "", areaName: "", areaDescription: "" });
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <CommanHeader />
      {isSaving && (
              <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
                <ScaleLoader color="#1E93AB" size={60} />
              </div>
            )}
      <div className="px-6 mx-auto max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-newPrimary">Area Details</h1>
          <button
            onClick={() => setIsSliderOpen(true)}
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80"
          >
            + Add Area
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="inline-block min-w-[900px] w-full align-middle overflow-x-auto">
                {/* Header */}
                <div className="hidden lg:grid grid-cols-[20px_1fr_3fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
                  <div>SR#</div>
                  <div>Area Name</div>
                  <div>Area Description</div>
                  <div className={`${loading ? "" : "text-right"}`}>
                    Actions
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton
                      rows={areas.length > 0 ? areas.length : 5}
                      cols={4}
                      className="lg:grid-cols-[20px_1fr_3fr_1fr]"
                    />
                  ) : currentRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white">
                      No areas added yet.
                    </div>
                  ) : (
                    currentRecords.map((area, idx) => (
                      <div
                        key={area._id}
                        className="grid grid-cols-1 lg:grid-cols-[20px_1fr_3fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                      >
                        <div className="text-gray-600">
                          {indexOfFirstRecord + idx + 1}
                        </div>
                        <div className="text-gray-600">{area?.salesArea || "-"}</div>
                        <div className="text-gray-600">{area?.description || "-"}</div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(area)}
                            className="py-1 text-sm text-blue-600"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(area._id)}
                            className="py-1 text-sm text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 bg-white border-t">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to{" "}
                      {Math.min(indexOfLastRecord, areas.length)} of{" "}
                      {areas.length} records
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

        {/* Add/Edit Slider */}
        {isSliderOpen && (
          <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
            <div
              ref={sliderRef}
              className="relative w-full md:w-[600px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
             

              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-newPrimary">
                  {isEditing ? "Edit Area" : "Add Area"}
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Area Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={areaData.areaName}
                    onChange={(e) =>
                      setAreaData({ ...areaData, areaName: e.target.value })
                    }
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter area name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Area Description
                  </label>
                  <textarea
                    value={areaData.areaDescription}
                    onChange={(e) =>
                      setAreaData({
                        ...areaData,
                        areaDescription: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-newPrimary"
                    placeholder="Enter area description"
                    
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-newPrimary text-white px-4 py-3 rounded-lg hover:bg-newPrimary/80"
                  disabled={isSaving}
                >
                  {isEditing ? "Update Area" : "Save Area"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaPage;
