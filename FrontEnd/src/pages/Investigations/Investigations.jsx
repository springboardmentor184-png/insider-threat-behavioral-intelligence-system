import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Plus,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Eye
} from "lucide-react";
import "./Investigations.css";

const API_URL = "http://127.0.0.1:8000";
const INVESTIGATIONS_API = `${API_URL}/investigations`;

function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [filteredInvestigations, setFilteredInvestigations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] =
    useState(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    title: "",
    description: "",
    priority: "Medium",
    assigned_to: "",
    evidence: ""
  });

  useEffect(() => {
    loadInvestigations();
  }, []);

  useEffect(() => {
    filterInvestigations();
  }, [
    investigations,
    search,
    statusFilter,
    priorityFilter
  ]);

  const loadInvestigations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        INVESTIGATIONS_API
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.investigations || [];

      setInvestigations(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load investigations"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterInvestigations = () => {
    let result = [...investigations];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((item) =>
        `${item.title || ""} ${
          item.description || ""
        } ${item.assigned_to || ""}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (item) =>
          String(item.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (priorityFilter !== "All") {
      result = result.filter(
        (item) =>
          String(item.priority || "").toLowerCase() ===
          priorityFilter.toLowerCase()
      );
    }

    setFilteredInvestigations(result);
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const createInvestigation = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        INVESTIGATIONS_API,
        {
          ...formData,
          employee_id: formData.employee_id
            ? Number(formData.employee_id)
            : null
        }
      );

      setShowModal(false);

      setFormData({
        employee_id: "",
        title: "",
        description: "",
        priority: "Medium",
        assigned_to: "",
        evidence: ""
      });

      loadInvestigations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create investigation"
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${INVESTIGATIONS_API}/${id}`,
        { status }
      );

      loadInvestigations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update investigation"
      );
    }
  };

  const getPriorityClass = (priority) => {
    return String(priority || "Medium").toLowerCase();
  };

  const getStatusClass = (status) => {
    return String(status || "Open")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const getStats = () => {
    return {
      total: investigations.length,
      open: investigations.filter(
        (item) =>
          String(item.status || "").toLowerCase() ===
          "open"
      ).length,
      inProgress: investigations.filter(
        (item) =>
          String(item.status || "").toLowerCase() ===
          "in progress"
      ).length,
      resolved: investigations.filter(
        (item) =>
          String(item.status || "").toLowerCase() ===
          "resolved"
      ).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="investigations-page">
        <div className="investigations-loading">
          Loading investigations...
        </div>
      </div>
    );
  }

  return (
    <div className="investigations-page">
      <div className="investigations-header">
        <div>
          <h1>Investigations</h1>
          <p>
            Manage and investigate insider threat incidents
          </p>
        </div>

        <div className="investigations-header-actions">
          <button
            className="investigations-refresh"
            onClick={loadInvestigations}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="investigations-create"
            onClick={() => setShowModal(true)}
          >
            <Plus size={17} />
            New Investigation
          </button>
        </div>
      </div>

      {error && (
        <div className="investigations-error">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="investigation-stats">
        <div className="investigation-stat-card">
          <div className="investigation-stat-icon total">
            <ClipboardList size={22} />
          </div>

          <div>
            <span>Total Investigations</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="investigation-stat-card">
          <div className="investigation-stat-icon open">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <div className="investigation-stat-card">
          <div className="investigation-stat-icon progress">
            <Clock size={22} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>

        <div className="investigation-stat-card">
          <div className="investigation-stat-icon resolved">
            <CheckCircle size={22} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>
      </div>

      <div className="investigations-card">
        <div className="investigations-toolbar">
          <div>
            <h2>Investigation Cases</h2>
            <p>
              Review and manage security investigation cases
            </p>
          </div>

          <div className="investigation-filters">
            <div className="investigation-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search investigations..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="All">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {filteredInvestigations.length === 0 ? (
          <div className="investigations-empty">
            <ClipboardList size={46} />
            <h3>No investigations found</h3>
            <p>
              Create a new investigation or change your filters.
            </p>
          </div>
        ) : (
          <div className="investigation-table-wrapper">
            <table className="investigation-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Employee ID</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvestigations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="investigation-title">
                        <strong>
                          {item.title ||
                            "Untitled Investigation"}
                        </strong>

                        <span>
                          {item.description
                            ? item.description.length > 70
                              ? `${item.description.slice(
                                  0,
                                  70
                                )}...`
                              : item.description
                            : "No description"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {item.employee_id || "N/A"}
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${getPriorityClass(
                          item.priority
                        )}`}
                      >
                        {item.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`status-select ${getStatusClass(
                          item.status
                        )}`}
                        value={item.status || "Open"}
                        onChange={(event) =>
                          updateStatus(
                            item.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="Open">
                          Open
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                        <option value="Closed">
                          Closed
                        </option>
                      </select>
                    </td>

                    <td>
                      {item.assigned_to || "Unassigned"}
                    </td>

                    <td>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      <button
                        className="investigation-view"
                        onClick={() =>
                          setSelectedInvestigation(item)
                        }
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="investigation-modal-overlay">
          <div className="investigation-modal">
            <div className="investigation-modal-header">
              <div>
                <h2>New Investigation</h2>
                <p>
                  Create a new security investigation case
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="investigation-form"
              onSubmit={createInvestigation}
            >
              <div className="form-group">
                <label>Investigation Title</label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter investigation title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID</label>

                  <input
                    name="employee_id"
                    type="number"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    placeholder="Employee ID"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Critical">
                      Critical
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assigned To</label>

                <input
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  placeholder="Analyst or investigator name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the investigation"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Evidence</label>

                <textarea
                  name="evidence"
                  value={formData.evidence}
                  onChange={handleInputChange}
                  placeholder="Add evidence details"
                  rows="3"
                />
              </div>

              <div className="investigation-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                >
                  Create Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvestigation && (
        <div className="investigation-modal-overlay">
          <div className="investigation-details-modal">
            <div className="investigation-modal-header">
              <div>
                <h2>
                  {selectedInvestigation.title}
                </h2>

                <p>
                  Investigation Case #
                  {selectedInvestigation.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedInvestigation(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="investigation-details">
              <div className="detail-item">
                <span>Status</span>
                <strong>
                  {selectedInvestigation.status ||
                    "Open"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Priority</span>
                <strong>
                  {selectedInvestigation.priority ||
                    "Medium"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Employee ID</span>
                <strong>
                  {selectedInvestigation.employee_id ||
                    "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Assigned To</span>
                <strong>
                  {selectedInvestigation.assigned_to ||
                    "Unassigned"}
                </strong>
              </div>

              <div className="detail-full">
                <span>Description</span>
                <p>
                  {selectedInvestigation.description ||
                    "No description available."}
                </p>
              </div>

              <div className="detail-full">
                <span>Evidence</span>
                <p>
                  {selectedInvestigation.evidence ||
                    "No evidence added."}
                </p>
              </div>
            </div>

            <div className="investigation-details-footer">
              <button
                onClick={() =>
                  setSelectedInvestigation(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Investigations;