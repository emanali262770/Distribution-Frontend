import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

import Swal from "sweetalert2";
import CommanHeader from "../../Components/CommanHeader";
import { SquarePen, Trash2 } from "lucide-react";
import TableSkeleton from "../../Components/Skeleton";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";

const SalesManInformation = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [qualification, setQualification] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [enable, setEnable] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/employees`;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filtered employees based on search term
  const filteredEmployees = employeeList?.filter(
    (emp) =>
      emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.departmentName &&
        emp.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.address &&
        emp.address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.city && emp.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination logic applied on filtered employees
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setLoading(true);
    setCurrentPage(pageNumber);
    setTimeout(() => setLoading(false), 300);
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

  // Fetch Department Table list
  const fetchDepartmentTableList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}`);
      setEmployeeList(res?.data);
    } catch (error) {
      console.error("Failed to fetch Supplier", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }, []);
  useEffect(() => {
    fetchDepartmentTableList();
  }, [fetchDepartmentTableList]);

  // Handlers
  const handleAddEmployee = () => {
    setIsSliderOpen(true);
    setIsEdit(false);
    setEditId(null);
    setEmployeeName("");
    setDepartment("");
    setAddress("");
    setCity("");
    setGender("");
    setPhoneNumber("");
    setNic("");
    setDob("");
    setQualification("");
    setBloodGroup("");
    setEnable(true);
  };

  // ✅ Salesman Form Validation
  const validateSalesmanForm = () => {
    const errors = [];

    if (!employeeName) errors.push("Employee Name is required");
    if (!gender) errors.push("Gender is required");
    if (!address) errors.push("Address is required");
    if (!city) errors.push("City is required");

    return errors;
  };

  const handleSave = async () => {
    const errors = validateSalesmanForm();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: errors.join("<br/>"),
      });
      return;
    }

    const { token } = userInfo || {};
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const newEmployee = {
      departmentName: department,
      employeeName,
      address,
      city,
      gender,
      mobile: phoneNumber,
      nicNo: nic,
      dob,
      qualification,
      bloodGroup,
      isEnable: enable,
    };

    try {
      setIsSaving(true);

      if (isEdit && editId) {
        await axios.put(`${API_URL}/${editId}`, newEmployee, { headers });
        toast.success("Employee updated successfully");
      } else {
        await axios.post(API_URL, newEmployee, { headers });
        toast.success("Employee added successfully");
      }

      fetchDepartmentTableList();
      setIsSliderOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error(error.response?.data?.message || "Failed to save employee");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (emp) => {
    setIsEdit(true);
    setEditId(emp._id);
    setEmployeeName(emp.employeeName);
    setDepartment(emp.departmentName || "");
    setAddress(emp.address);
    setCity(emp.city);
    setGender(emp.gender);
    setPhoneNumber(emp.mobile || "");
    setNic(emp.nicNo || "");
    setDob(emp.dob ? emp.dob.split("T")[0] : "");
    setQualification(emp.qualification);
    setBloodGroup(emp.bloodGroup);
    setEnable(emp.isEnable);
    setIsSliderOpen(true);
  };

  // Date formating
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const handleDelete = (id) => {
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
        text: "You want to delete this employee?",
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

            setEmployeeList(employeeList.filter((emp) => emp._id !== id));
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Employee has been deleted.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete department.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Employee is safe 🙂",
            "error"
          );
        }
      });
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [employeeList]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Common header */}
      <CommanHeader />
      {isSaving && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <ScaleLoader color="#1E93AB" size={60} />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-newPrimary">
            Salesman Information
          </h1>
          <p className="text-gray-500 text-sm">Manage your salesman details</p>
        </div>

        {/* Search + Add Button */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name, department, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 w-full md:w-[280px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-newPrimary"
          />
          <button
            className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/90"
            onClick={handleAddEmployee}
          >
            + Add Salesman
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* ✅ Table Header */}
            <div className="hidden lg:grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-6 bg-gray-100 py-3 px-6 text-xs font-semibold text-gray-600 uppercase sticky top-0 z-10 border-b border-gray-200">
              <div>Sr</div>
              <div>Name</div>
              <div>Department</div>
              <div>Phone</div>
              <div>NIC</div>
              <div>DOB</div>
              <div>Qualification</div>
              <div>Status</div>
              <div className={`${loading ? "" : "text-right"}`}>Actions</div>
            </div>

            {/* ✅ Table Body */}
            <div className="flex flex-col divide-y divide-gray-100 max-h-screen overflow-y-auto">
              {loading ? (
                <TableSkeleton
                  rows={employeeList.length > 0 ? employeeList.length : 5}
                  cols={9}
                  className="lg:grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
                />
              ) : employeeList.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No employee found.
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-white">
                  No employee found.
                </div>
              ) : (
                currentRecords.map((emp, index) => (
                  <div
                    key={emp._id}
                    className="grid grid-cols-[0.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-6 px-6 py-4 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="text-gray-900">
                      {indexOfFirstRecord + index + 1}
                    </div>

                    <div className="text-gray-700">
                      {emp?.employeeName || "-"}
                    </div>
                    <div className="text-gray-600">
                      {emp?.departmentName || "-"}
                    </div>
                    <div className="text-gray-600">{emp?.mobile || "-"}</div>
                    <div className="text-gray-600">{emp?.nicNo || "-"}</div>
                    <div className="text-gray-600">
                      {formatDate(emp.dob) || "-"}
                    </div>
                    <div className="text-gray-600">
                      {emp?.qualification || "-"}
                    </div>
                    <div className="font-semibold">
                      {emp?.isEnable ? (
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-[5px]">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-[5px]">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-blue-600 hover:underline"
                      >
                        <SquarePen size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-red-600 hover:underline"
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
                  {Math.min(indexOfLastRecord, employeeList.length)} of{" "}
                  {employeeList.length} records
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

      {/* Slider Form */}
      {isSliderOpen && (
        <div className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50">
          <div
            ref={sliderRef}
            className="relative w-full md:w-[800px] bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-newPrimary">
                {isEdit ? "Update Salesman" : "Add a New Salesman"}
              </h2>
              <button
                className="w-8 h-8 bg-newPrimary text-white rounded-full flex items-center justify-center hover:bg-newPrimary/70"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setEditId(null);
                  setEmployeeName("");
                  setDepartment("");
                  setAddress("");
                  setCity("");
                  setGender("");
                  setPhoneNumber("");
                  setNic("");
                  setDob("");
                  setQualification("");
                  setBloodGroup("");
                  setEnable(true);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Name <span className="text-red-500">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Address <span className="text-red-500">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>{" "}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Gender <span className="text-red-500">*</span>{" "}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        // allows only digits
                        setPhoneNumber(value);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">NIC</label>
                  <input
                    type="text"
                    value={nic}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits (0-9)
                      if (/^\d*$/.test(value)) {
                        setNic(value);
                      }
                    }}
                    className="w-full p-2 border rounded"
                    placeholder="Enter NIC"
                    inputMode="numeric" // shows number keypad on mobile
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-gray-700 font-medium">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              {/* Enable Toggle */}
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Enable</label>
                <button
                  type="button"
                  onClick={() => setEnable(!enable)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    enable ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      enable ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
                <span>{enable ? "Enabled" : "Disabled"}</span>
              </div>

              <button
                className="bg-newPrimary text-white px-4 py-2 rounded-lg hover:bg-newPrimary/80 w-full"
                onClick={handleSave}
              >
                {isEdit ? "Update Salesman" : "Save Salesman"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManInformation;
