import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/teachers";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  qualification: "",
  employmentStatus: "ACTIVE",
  subject: "",
  assignedClass: "",
  teachingHistory: "",
  performanceNotes: "",
  availability: "",
  active: true,
};

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load all teachers
  const loadTeachers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load teacher records.");
      }

      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Clear messages
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Add or update teacher
  const handleSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    // Basic frontend validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.qualification.trim()
    ) {
      setErrorMessage(
        "First name, last name, email and qualification are required."
      );
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result === "string"
            ? result
            : "Unable to save teacher information."
        );
      }

      if (editingId) {
        setSuccessMessage("Teacher information updated successfully.");
      } else {
        setSuccessMessage("Teacher added successfully.");
      }

      setFormData(emptyForm);
      setEditingId(null);

      await loadTeachers();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit teacher
  const handleEdit = (teacher) => {
    clearMessages();

    setEditingId(teacher.id);

    setFormData({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      phoneNumber: teacher.phoneNumber || "",
      qualification: teacher.qualification || "",
      employmentStatus: teacher.employmentStatus || "ACTIVE",
      subject: teacher.subject || "",
      assignedClass: teacher.assignedClass || "",
      teachingHistory: teacher.teachingHistory || "",
      performanceNotes: teacher.performanceNotes || "",
      availability: teacher.availability || "",
      active: teacher.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    clearMessages();
  };

  // Deactivate teacher
  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this teacher?"
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/${id}/deactivate`, {
        method: "PUT",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result === "string"
            ? result
            : "Unable to deactivate teacher."
        );
      }

      setSuccessMessage("Teacher deactivated successfully.");

      await loadTeachers();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-management">

      <h1>Teacher Management</h1>

      {/* Messages */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Add / Update Teacher Form */}
      <section>
        <h2>
          {editingId ? "Update Teacher" : "Add New Teacher"}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <h3>Personal Information</h3>

          <div>
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div>
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>

          <div>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          {/* Employment Information */}
          <h3>Employment Information</h3>

          <div>
            <label>Qualification *</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. BSc Mathematics"
              required
            />
          </div>

          <div>
            <label>Employment Status</label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Subject and Class Assignment */}
          <h3>Subject & Class Assignment</h3>

          <div>
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
            />
          </div>

          <div>
            <label>Assigned Class</label>
            <input
              type="text"
              name="assignedClass"
              value={formData.assignedClass}
              onChange={handleChange}
              placeholder="e.g. Grade 10-A"
            />
          </div>

          <div>
            <label>Availability</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g. Monday-Friday 8AM-3PM"
            />
          </div>

          {/* Teacher Profile */}
          <h3>Teacher Profile</h3>

          <div>
            <label>Teaching History</label>
            <textarea
              name="teachingHistory"
              value={formData.teachingHistory}
              onChange={handleChange}
              placeholder="Enter teaching history"
              rows="4"
            />
          </div>

          <div>
            <label>Performance Notes</label>
            <textarea
              name="performanceNotes"
              value={formData.performanceNotes}
              onChange={handleChange}
              placeholder="Enter performance notes"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div>
            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Teacher"
                : "Add Teacher"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Teacher Records */}
      <section>
        <h2>Teacher Records</h2>

        {loading && teachers.length === 0 && (
          <p>Loading teacher records...</p>
        )}

        {!loading && teachers.length === 0 && (
          <p>No teachers found.</p>
        )}

        {teachers.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Employment</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      {teacher.firstName} {teacher.lastName}
                    </td>

                    <td>{teacher.email}</td>

                    <td>{teacher.phoneNumber || "-"}</td>

                    <td>{teacher.qualification || "-"}</td>

                    <td>
                      {teacher.employmentStatus || "-"}
                    </td>

                    <td>{teacher.subject || "-"}</td>

                    <td>{teacher.assignedClass || "-"}</td>

                    <td>{teacher.availability || "-"}</td>

                    <td>
                      {teacher.active ? "Active" : "Inactive"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(teacher)}
                      >
                        Edit
                      </button>

                      {teacher.active && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(teacher.id)
                          }
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

export default TeacherManagement;