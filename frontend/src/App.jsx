import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/employees`;
const IMAGE_BASE = `${import.meta.env.VITE_API_URL}/uploads/`;

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", department: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setEmployees(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const image = e.target.files[0];
    setFile(image || null);
    setPreview(image ? URL.createObjectURL(image) : "");
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.mobile || !form.department) {
      return "Please complete all fields.";
    }
    if (!/^[0-9]{7,15}$/.test(form.mobile)) {
      return "Mobile number must be 7 to 15 digits.";
    }
    if (!editingId && !file) {
      return "Profile image is required.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("mobile", form.mobile);
    formData.append("department", form.department);
    if (file) {
      formData.append("profileImage", file);
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const res = await fetch(url, { method, body: formData });
    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Unable to save employee.");
      return;
    }

    setForm({ name: "", email: "", mobile: "", department: "" });
    setFile(null);
    setPreview("");
    setEditingId(null);
    setError("");
    fetchEmployees();
  };

  const handleEdit = (employee) => {
    setForm({
      name: employee.name,
      email: employee.email,
      mobile: employee.mobile,
      department: employee.department,
    });
    setPreview(employee.profileImage ? `${IMAGE_BASE}${employee.profileImage}` : "");
    setFile(null);
    setEditingId(employee._id);
    setError("");
    setShowList(true);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Employee Management</h1>
          <p className="subtitle">Manage your modern workforce directory</p>
        </div>
        <button 
          type="button" 
          className="toggle-list-btn" 
          onClick={() => setShowList(!showList)}
        >
          {showList ? "📁 Hide Directory" : "👁️ View Directory"}
          <span className="badge">{employees.length}</span>
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Form Panel */}
        <section className="form-panel">
          <h2>{editingId ? "✏️ Edit Employee" : "➕ Add Employee"}</h2>
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} placeholder="John cena" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} placeholder="johncena@gmail.com" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input name="mobile" value={form.mobile} placeholder="1234567890" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} placeholder="Engineering" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
            </div>

            {preview && (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="avatar-preview" />
              </div>
            )}

            <button type="submit" className={`submit-btn ${editingId ? "edit-mode" : ""}`}>
              {editingId ? "Update" : "Add"} Employee
            </button>

            {error && <div className="error-message">⚠️ {error}</div>}
          </form>
        </section>

        {/* Directory List Panel */}
        {showList && (
          <section className="list-panel">
            <h2>Team Directory</h2>
            {employees.length === 0 ? (
              <div className="empty-state">
                <p>No employees on record yet.</p>
                <span>Fill out the form to add your first member.</span>
              </div>
            ) : (
              <div className="card-grid">
                {employees.map((employee) => (
                  <div key={employee._id} className="employee-card">
                    <div className="card-body">
                      <img
                        className="card-avatar"
                        src={employee.profileImage ? `${IMAGE_BASE}${employee.profileImage}` : "https://via.placeholder.com/90"}
                        alt={employee.name}
                      />
                      <div className="card-info">
                        <h3>{employee.name}</h3>
                        <span className="dept-tag">{employee.department}</span>
                        <p className="email-text">{employee.email}</p>
                        <p className="mobile-text">{employee.mobile}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button type="button" className="btn-edit" onClick={() => handleEdit(employee)}>Edit</button>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(employee._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;