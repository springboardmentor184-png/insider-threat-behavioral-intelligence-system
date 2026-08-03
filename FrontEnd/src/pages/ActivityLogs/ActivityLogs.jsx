import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Activity,
  Monitor,
  FileText
} from "lucide-react";

import "./ActivityLogs.css";

const API_URL = "http://127.0.0.1:8000";

function ActivityLogs() {

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, search, typeFilter]);


  const loadLogs = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        loginResponse,
        fileResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/login-activity/`),
        axios.get(`${API_URL}/file-access/`)
      ]);

      const loginData =
        Array.isArray(loginResponse.data)
          ? loginResponse.data
          : [];

      const fileData =
        Array.isArray(fileResponse.data)
          ? fileResponse.data
          : [];


      const loginLogs = loginData.map(item => ({

        ...item,

        log_type:
          item.activity?.toLowerCase().includes("logoff")
            ? "Log Off"
            : item.activity?.toLowerCase().includes("logon")
              ? "Log On"
              : "Login",

        username:
          item.username ||
          item.user ||
          "-",

        device:
          item.pc ||
          "-",

        event:
          item.activity ||
          "Login Activity",

        event_time:
          item.login_time

      }));


      const fileLogs = fileData.map(item => ({

        ...item,

        log_type: "File Access",

        username:
          item.username ||
          item.user ||
          "-",


        device:
          item.pc ||
          "-",


        event:
          item.filename ||
          "File Access",


        event_time:
          item.access_time

      }));


      const combinedLogs = [
        ...loginLogs,
        ...fileLogs
      ].sort((a, b) =>
        new Date(b.event_time || 0) -
        new Date(a.event_time || 0)
      );


      setLogs(combinedLogs);

    }
    catch (error) {

      console.log(error);

      setError(
        "Unable to load activity logs"
      );

    }
    finally {

      setLoading(false);

    }

  };


  const filterLogs = () => {

    let result = [...logs];


    if (search.trim()) {

      const query =
        search.toLowerCase();

      result =
        result.filter(log =>
          String(log.username)
            .toLowerCase()
            .includes(query)

          ||

          String(log.device)
            .toLowerCase()
            .includes(query)

          ||

          String(log.event)
            .toLowerCase()
            .includes(query)
        );

    }


    if (typeFilter !== "All") {

      result =
        result.filter(log =>
          log.log_type === typeFilter
        );

    }


    setFilteredLogs(result);

  };


  const formatDate = (date) => {

    if (!date)
      return "-";

    return new Date(date)
      .toLocaleString();

  };


  const totalActivities =
    logs.length;

  const loginActivities =
    logs.filter(
      log =>
        log.log_type === "Login"
    ).length;

  const logOnActivities =
    logs.filter(
      log =>
        log.log_type === "Log On"
    ).length;

  const fileAccessEvents =
    logs.filter(
      log =>
        log.log_type === "File Access"
    ).length;


  if (loading) {

    return (
      <div className="activity-logs-page">

        <div className="activity-loading">
          Loading activity logs...
        </div>

      </div>
    );

  }


  return (

    <div className="activity-logs-page">

      <div className="activity-header">

        <div>

          <h1>
            Activity Logs
          </h1>

          <p>
            Monitor employee login and file access activities
          </p>

        </div>


        <button
          className="activity-refresh-button"
          onClick={loadLogs}
        >

          <RefreshCw size={16}/>
          Refresh

        </button>

      </div>


      {
        error &&

        <div className="activity-error">
          {error}
        </div>
      }


      <div className="activity-summary">


        <div className="activity-summary-card">

          <div className="activity-summary-icon">
            <Activity size={22}/>
          </div>

          <div>

            <span>
              Total Activities
            </span>

            <strong>
              {totalActivities}
            </strong>

          </div>

        </div>



        <div className="activity-summary-card">

          <div className="activity-summary-icon login">
            <Monitor size={22}/>
          </div>

          <div>

            <span>
              Login Events
            </span>

            <strong>
              {loginActivities + logOnActivities}
            </strong>

          </div>

        </div>



        <div className="activity-summary-card">

          <div className="activity-summary-icon file">
            <FileText size={22}/>
          </div>

          <div>

            <span>
              File Access
            </span>

            <strong>
              {fileAccessEvents}
            </strong>

          </div>

        </div>


      </div>


      <div className="activity-content">


        <div className="activity-toolbar">


          <div className="activity-search">

            <Search size={18}/>

            <input
              placeholder="Search user, device, file..."
              value={search}
              onChange={
                e => setSearch(e.target.value)
              }
            />

          </div>



          <select
            value={typeFilter}
            onChange={
              e => setTypeFilter(e.target.value)
            }
          >

            <option value="All">
              All Activity Types
            </option>

            <option value="Login">
              Login
            </option>

            <option value="Log On">
              Log On
            </option>

            <option value="Log Off">
              Log Off
            </option>

            <option value="File Access">
              File Access
            </option>

          </select>


        </div>



        <div className="activity-table-wrapper">


          <table className="activity-table">


            <thead>

              <tr>

                <th>
                  Type
                </th>

                <th>
                  User
                </th>

                <th>
                  Device
                </th>

                <th>
                  Activity/File
                </th>

                <th>
                  Date & Time
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filteredLogs.map((log,index)=>(

                  <tr key={index}>

                    <td>

                      <span
                        className={`activity-type ${
                          log.log_type === "Login"
                            ? "login"
                            :
                          log.log_type === "Log On"
                            ? "logon"
                            :
                          log.log_type === "Log Off"
                            ? "logoff"
                            :
                            "file"
                        }`}
                      >

                        {log.log_type}

                      </span>

                    </td>

                    <td>
                      {log.username}
                    </td>

                    <td>
                      {log.device}
                    </td>

                    <td>
                      {log.event}
                    </td>

                    <td>
                      {formatDate(log.event_time)}
                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>


        </div>


      </div>


    </div>

  );

}


export default ActivityLogs;