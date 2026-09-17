import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

const API_URL = "http://localhost:8080/api/teachers";

function TeacherManagement() {
  const { getToken } = useAuth();

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    qualification: "",
    employmentStatus: "",
    subject: "",
    assignedClass: "",
    teachingHistory: "",
    active: true,
  };

  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // VIEW - Get all teachers
  const loadTeachers = async () => {
    try {
      const token = await getToken();

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load teachers");
      }

      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load teacher records");
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // CREATE + UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save teacher");
      }

      alert(
        editingId
          ? "Teacher updated successfully"
          : "Teacher created successfully"
      );

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await loadTeachers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Edit button
  const handleEdit = (teacher) => {
    setFormData({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      phoneNumber: teacher.phoneNumber || "",
      qualification: teacher.qualification || "",
      employmentStatus: teacher.employmentStatus || "",
      subject: teacher.subject || "",
      assignedClass: teacher.assignedClass || "",
      teachingHistory: teacher.teachingHistory || "",
      active: teacher.active ?? true,
    });

    setEditingId(teacher.id);
    setShowForm(true);
  };

  // DEACTIVATE
  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = await getToken();

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate teacher");
      }

      alert("Teacher deactivated successfully");

      await loadTeachers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Teacher Management</h1>

      <button onClick={() => setShowForm(true)}>
        Add New Teacher
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "20px",
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <input
            name="qualification"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={handleChange}
          />

          <input
            name="employmentStatus"
            placeholder="Employment Status"
            value={formData.employmentStatus}
            onChange={handleChange}
          />

          <input
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
          />

          <input
            name="assignedClass"
            placeholder="Assigned Class"
            value={formData.assignedClass}
            onChange={handleChange}
          />

          <textarea
            name="teachingHistory"
            placeholder="Teaching History"
            value={formData.teachingHistory}
            onChange={handleChange}
          />

          <div>
            <button type="submit">
              {editingId ? "Update Teacher" : "Create Teacher"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h2 style={{ marginTop: "30px" }}>Teacher Records</h2>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Qualification</th>
            <th>Subject</th>
            <th>Class</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No teachers found
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  {teacher.firstName} {teacher.lastName}
                </td>

                <td>{teacher.email}</td>

                <td>{teacher.qualification}</td>

                <td>{teacher.subject}</td>

                <td>{teacher.assignedClass}</td>

                <td>
                  {teacher.active ? "Active" : "Inactive"}
                </td>

                <td>
                  <button onClick={() => handleEdit(teacher)}>
                    Edit
                  </button>

                  {teacher.active && (
                    <button
                      onClick={() =>
                        handleDeactivate(teacher.id)
                      }
                      style={{ marginLeft: "8px" }}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherManagement;