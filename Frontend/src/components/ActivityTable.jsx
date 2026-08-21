import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeeService";

function ActivityTable() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // Load Employees
  // =====================================================

  useEffect(() => {
    fetchEmployees();
  }, []);


  const fetchEmployees = async () => {

    try {

      const data = await getEmployees();

      // =================================================
      // Show Top 5 Highest-Risk Employees
      // Sorted using the actual risk score
      // =================================================

      const topRiskEmployees = data
        .filter(
          (employee) =>
            Number(employee.risk_score || 0) > 0
        )
        .sort(
          (a, b) =>
            Number(b.risk_score || 0) -
            Number(a.risk_score || 0)
        )
        .slice(0, 5);

      setEmployees(topRiskEmployees);

    } catch (error) {

      console.error(
        "Error fetching employees:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // Risk Level Classification
  //
  // 0 - 39   = Low
  // 40 - 69  = Medium
  // 70 - 89  = High
  // 90 - 100 = Critical
  // =====================================================

  const getRiskLevel = (score) => {

    const riskScore = Number(score || 0);

    if (riskScore < 40) {
      return "Low";
    }

    if (riskScore < 70) {
      return "Medium";
    }

    if (riskScore < 90) {
      return "High";
    }

    return "Critical";
  };


  // =====================================================
  // Loading State
  // =====================================================

  if (loading) {

    return (

      <div className="table-card">

        <h4>
          Top 5 Highest-Risk Employees
        </h4>

        <p>
          Loading...
        </p>

      </div>

    );

  }


  // =====================================================
  // Render
  // =====================================================

  return (

    <div className="table-card">

      <h4>
        🚨 Top 5 Highest-Risk Employees
      </h4>


      <table className="activity-table">

        <thead>

          <tr>

            <th>
              Employee ID
            </th>

            <th>
              Employee
            </th>

            <th>
              Department
            </th>

            <th>
              Role
            </th>

            <th>
              Risk Score
            </th>

            <th>
              Risk Level
            </th>

          </tr>

        </thead>


        <tbody>

          {employees.map((employee) => {

            const riskLevel =
              getRiskLevel(
                employee.risk_score
              );

            return (

              <tr
                key={employee.id}
              >

                <td>
                  {employee.employee_id}
                </td>

                <td>
                  {employee.full_name}
                </td>

                <td>
                  {employee.department}
                </td>

                <td>
                  {employee.role}
                </td>


                <td>

                  <strong>
                    {employee.risk_score}
                  </strong>

                </td>


                <td>

                  <span
                    className={`badge badge-${riskLevel.toLowerCase()}`}
                  >

                    {riskLevel}

                  </span>

                </td>

              </tr>

            );

          })}


          {employees.length === 0 && (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center"
                }}
              >

                No employees found.

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

}


export default ActivityTable;