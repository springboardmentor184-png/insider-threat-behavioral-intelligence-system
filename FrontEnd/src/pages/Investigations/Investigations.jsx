import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  User,
  Activity,
  FileText
} from "lucide-react";

import api from "../../services/api";
import "./Investigations.css";

function Investigations() {

  const [investigations, setInvestigations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);


  const loadInvestigations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/investigations/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.investigations || [];

      setInvestigations(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load investigations"
      );

      setInvestigations([]);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadInvestigations();
  }, []);


  const updateInvestigationStatus = async (
    investigationId,
    newStatus
  ) => {

    try {

      const response = await api.put(
        `/investigations/${investigationId}`,
        {
          status: newStatus
        }
      );


      setInvestigations(prev =>
        prev.map(item =>
          item.id === investigationId
            ? {
                ...item,
                ...response.data,
                status:
                  response.data.status ||
                  newStatus
              }
            : item
        )
      );


    } catch (err) {

      console.error(err);

      setError(
        "Unable to update investigation status"
      );

      loadInvestigations();
    }

  };


  const filteredInvestigations = useMemo(() => {

    const query =
      search.trim().toLowerCase();


    return investigations.filter(item => {

      const text = `
        ${item.user || ""}
        ${item.name || ""}
        ${item.title || ""}
        ${item.description || ""}
        ${item.status || ""}
        ${item.assigned_to || ""}
      `.toLowerCase();


      const matchesSearch =
        !query ||
        text.includes(query);


      const matchesStatus =
        statusFilter === "All" ||
        String(item.status || "")
          .toLowerCase() ===
        statusFilter.toLowerCase();


      return matchesSearch && matchesStatus;

    });


  }, [
    investigations,
    search,
    statusFilter
  ]);



  const getStatusClass = (status) => {

    return String(status || "Open")
      .toLowerCase()
      .replace(/\s+/g, "-");

  };


  const stats = useMemo(() => {

    return {

      total: investigations.length,

      open:
        investigations.filter(
          item =>
            item.status?.toLowerCase() === "open"
        ).length,


      inProgress:
        investigations.filter(
          item =>
            item.status?.toLowerCase() === "in progress"
        ).length,


      resolved:
        investigations.filter(
          item =>
            item.status?.toLowerCase() === "resolved"
        ).length

    };

  }, [investigations]);



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

          <h1>
            Investigations
          </h1>

          <p>
            Review employee behavior and security investigations
          </p>

        </div>


        <button
          className="investigations-refresh"
          onClick={loadInvestigations}
        >

          <RefreshCw size={16}/>

          Refresh

        </button>

      </div>



      {error && (

        <div className="investigations-error">

          {error}

          <button onClick={() => setError("")}>
            <X size={16}/>
          </button>

        </div>

      )}



      <div className="investigation-stats">


        <div className="investigation-stat-card">
          <ClipboardList size={22}/>
          <div>
            <span>Total Investigations</span>
            <strong>{stats.total}</strong>
          </div>
        </div>


        <div className="investigation-stat-card">
          <AlertTriangle size={22}/>
          <div>
            <span>Open Cases</span>
            <strong>{stats.open}</strong>
          </div>
        </div>


        <div className="investigation-stat-card">
          <Clock size={22}/>
          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>


        <div className="investigation-stat-card">
          <CheckCircle size={22}/>
          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>


      </div>




      <div className="investigations-card">


        <div className="investigations-toolbar">


          <h2>
            Employee Investigation Cases
          </h2>



          <div className="investigation-filters">


            <div className="investigation-search">

              <Search size={17}/>

              <input
                placeholder="Search employee..."
                value={search}
                onChange={
                  e => setSearch(e.target.value)
                }
              />

            </div>



            <select
              value={statusFilter}
              onChange={
                e => setStatusFilter(e.target.value)
              }
            >

              <option value="All">
                All Status
              </option>

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


          </div>


        </div>





        <table className="investigation-table">


          <thead>

            <tr>

              <th>Employee</th>
              <th>Risk Score</th>
              <th>Anomaly Score</th>
              <th>Login Events</th>
              <th>File Events</th>
              <th>Status</th>
              <th>Action</th>

            </tr>

          </thead>



          <tbody>


          {filteredInvestigations.map(item => (


            <tr key={item.id || item.employee_id}>


              <td>

                <strong>
                  {item.name ||
                  item.user ||
                  "Unknown"}
                </strong>

              </td>


              <td>
                {Number(item.risk_score || 0).toFixed(2)}
              </td>


              <td>
                {Number(item.anomaly_score || 0).toFixed(2)}
              </td>


              <td>
                {item.login_count || 0}
              </td>


              <td>
                {item.file_access_count || 0}
              </td>


              <td>

                <select
                  className={
                    `status-select ${getStatusClass(item.status)}`
                  }

                  value={
                    item.status || "Open"
                  }

                  onChange={
                    e =>
                    updateInvestigationStatus(
                      item.id,
                      e.target.value
                    )
                  }

                >

                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>


                </select>


              </td>


              <td>

                <button
                  className="investigation-view"
                  onClick={() =>
                    setSelectedInvestigation(item)
                  }
                >

                  <Eye size={15}/>
                  View

                </button>


              </td>


            </tr>


          ))}


          </tbody>


        </table>


      </div>





      {selectedInvestigation && (

        <div className="investigation-modal-overlay">


          <div className="investigation-details-modal">


            <button
              onClick={() =>
                setSelectedInvestigation(null)
              }
            >

              <X/>

            </button>


            <h2>

              {
                selectedInvestigation.name ||
                selectedInvestigation.user
              }

            </h2>


            <p>
              Employee ID:
              {selectedInvestigation.employee_id}
            </p>


            <p>
              <User size={14}/>
              User:
              {selectedInvestigation.user}
            </p>


            <p>
              Risk Score:
              {Number(
                selectedInvestigation.risk_score || 0
              ).toFixed(2)}
            </p>


            <p>
              Anomaly Score:
              {Number(
                selectedInvestigation.anomaly_score || 0
              ).toFixed(2)}
            </p>


            <p>
              <Activity size={14}/>
              Login Events:
              {selectedInvestigation.login_count || 0}
            </p>


            <p>
              <FileText size={14}/>
              File Events:
              {selectedInvestigation.file_access_count || 0}
            </p>


            <p>
              Status:
              {selectedInvestigation.status}
            </p>


            <button
              onClick={() =>
                setSelectedInvestigation(null)
              }
            >
              Close
            </button>


          </div>


        </div>

      )}



    </div>

  );

}


export default Investigations;