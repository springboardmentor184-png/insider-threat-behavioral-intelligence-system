import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";

import "./RiskAnalysis.css";


function RiskAnalysis() {
  const [riskData, setRiskData] =
    useState({
      summary: {
        total_employees: 0,
        critical_risk: 0,
        high_risk: 0,
        medium_risk: 0,
        low_risk: 0,
        average_risk_score: 0,
      },
      employees: [],
      risk_trend: [],
      risk_distribution: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [level, setLevel] =
    useState("All");


  const loadRiskData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/risk/analysis"
          );

        const data =
          response.data || {};

        setRiskData({
          summary:
            data.summary || {
              total_employees: 0,
              critical_risk: 0,
              high_risk: 0,
              medium_risk: 0,
              low_risk: 0,
              average_risk_score: 0,
            },
          employees:
            Array.isArray(
              data.employees
            )
              ? data.employees
              : Array.isArray(
                  data
                )
                ? data
                : [],
          risk_trend:
            Array.isArray(
              data.risk_trend
            )
              ? data.risk_trend
              : [],
          risk_distribution:
            Array.isArray(
              data.risk_distribution
            )
              ? data.risk_distribution
              : [],
        });

      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.detail ||
          requestError
            ?.message ||
          "Unable to load risk analysis"
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(
    () => {
      loadRiskData();
    },
    []
  );


  const getEmployeeName =
    (employee) => {
      return (
        employee
          ?.employee_name ||
        employee
          ?.name ||
        employee
          ?.user ||
        "Unknown Employee"
      );
    };


  const getEmployeeId =
    (employee) => {
      return (
        employee
          ?.employee_id ||
        employee
          ?.id ||
        employee
          ?.user ||
        "N/A"
      );
    };


  const getRiskScore =
    (employee) => {
      const score =
        Number(
          employee
            ?.risk_score
        );

      if (
        Number.isNaN(
          score
        )
      ) {
        return 0;
      }

      return Math.max(
        0,
        Math.min(
          score,
          100
        )
      );
    };


  const getRiskLevel =
    (employee) => {
      return (
        employee
          ?.risk_level ||
        "Low"
      );
    };


  const employees =
    useMemo(
      () => {
        const employeeList =
          Array.isArray(
            riskData
              ?.employees
          )
            ? riskData
                .employees
            : [];

        return employeeList
          .filter(
            (employee) => {
              const employeeName =
                getEmployeeName(
                  employee
                );

              const employeeId =
                getEmployeeId(
                  employee
                );

              const text =
                `${employeeName} ${employeeId}`
                  .toLowerCase();

              const matchesSearch =
                text.includes(
                  search
                    .toLowerCase()
                    .trim()
                );

              const matchesLevel =
                level ===
                  "All" ||
                getRiskLevel(
                  employee
                )
                  .toLowerCase() ===
                level
                  .toLowerCase();

              return (
                matchesSearch &&
                matchesLevel
              );
            }
          );
      },
      [
        riskData,
        search,
        level,
      ]
    );


  const getRiskClass =
    (riskLevel) => {
      return (
        riskLevel ||
        "Low"
      )
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );
    };


  const summary =
    riskData
      ?.summary || {
        total_employees: 0,
        critical_risk: 0,
        high_risk: 0,
        medium_risk: 0,
        low_risk: 0,
        average_risk_score: 0,
      };


  const riskDistribution =
    Array.isArray(
      riskData
        ?.risk_distribution
    )
      ? riskData
          .risk_distribution
      : [];


  const riskTrend =
    Array.isArray(
      riskData
        ?.risk_trend
    )
      ? riskData
          .risk_trend
      : [];


  const pieColors = [
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#16a34a",
  ];


  return (
    <div className="risk-page">

      <div className="risk-header">

        <div>

          <h1>
            Risk Analysis
          </h1>

          <p>
            Monitor employee
            behavioral risk,
            anomalies, and
            security indicators
          </p>

        </div>


        <button
          type="button"
          className="risk-refresh"
          onClick={
            loadRiskData
          }
          disabled={
            loading
          }
        >

          <RefreshCw
            size={17}
            className={
              loading
                ? "risk-spin"
                : ""
            }
          />

          Refresh Analysis

        </button>

      </div>


      {error && (

        <div className="risk-error">

          <AlertTriangle
            size={19}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      <div className="risk-summary-grid">

        <div className="risk-summary-card">

          <div className="risk-card-icon blue">

            <Users
              size={23}
            />

          </div>

          <div>

            <span>
              Employees Analyzed
            </span>

            <strong>

              {
                summary
                  .total_employees ||
                riskData
                  .employees
                  .length
              }

            </strong>

          </div>

        </div>


        <div className="risk-summary-card">

          <div className="risk-card-icon red">

            <ShieldAlert
              size={23}
            />

          </div>

          <div>

            <span>
              Critical Risk
            </span>

            <strong>

              {
                summary
                  .critical_risk ||
                0
              }

            </strong>

          </div>

        </div>


        <div className="risk-summary-card">

          <div className="risk-card-icon orange">

            <AlertTriangle
              size={23}
            />

          </div>

          <div>

            <span>
              High Risk
            </span>

            <strong>

              {
                summary
                  .high_risk ||
                0
              }

            </strong>

          </div>

        </div>


        <div className="risk-summary-card">

          <div className="risk-card-icon green">

            <ShieldCheck
              size={23}
            />

          </div>

          <div>

            <span>
              Average Risk Score
            </span>

            <strong>

              {
                Number(
                  summary
                    .average_risk_score ||
                  0
                ).toFixed(
                  1
                )
              }

            </strong>

          </div>

        </div>

      </div>


      <div className="risk-chart-grid">

        <div className="risk-chart-card">

          <div className="risk-chart-heading">

            <div>

              <h2>
                Risk Trend
              </h2>

              <p>
                Risk score trend
                over the last
                seven days
              </p>

            </div>

            <BarChart3
              size={20}
            />

          </div>


          <div className="risk-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={
                  riskTrend
                }
              >

                <defs>

                  <linearGradient
                    id="riskArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0.02}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />


                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />


                <YAxis
                  domain={[
                    0,
                    100,
                  ]}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />


                <Tooltip />


                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#riskArea)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        <div className="risk-chart-card">

          <div className="risk-chart-heading">

            <div>

              <h2>
                Risk Distribution
              </h2>

              <p>
                Employees grouped
                by risk level
              </p>

            </div>

          </div>


          <div className="risk-pie-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    riskDistribution
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={91}
                  paddingAngle={3}
                >

                  {
                    riskDistribution
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <Cell
                            key={
                              item
                                .name ||
                              index
                            }
                            fill={
                              pieColors[
                                index %
                                pieColors
                                  .length
                              ]
                            }
                          />

                        )
                      )
                  }

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>


          <div className="risk-legend">

            {
              riskDistribution
                .map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={
                        item
                          .name ||
                        index
                      }
                    >

                      <span
                        style={{
                          background:
                            pieColors[
                              index %
                              pieColors
                                .length
                            ],
                        }}
                      />

                      <p>

                        {
                          item
                            .name
                        }

                      </p>

                      <strong>

                        {
                          item
                            .value
                        }

                      </strong>

                    </div>

                  )
                )
            }

          </div>

        </div>

      </div>


      <div className="risk-table-card">

        <div className="risk-table-top">

          <div>

            <h2>
              Employee Risk Scores
            </h2>

            <p>

              {
                employees
                  .length
              }

              {" "}

              employees displayed

            </p>

          </div>


          <div className="risk-filters">

            <label>

              <Search
                size={17}
              />

              <input
                type="text"
                value={
                  search
                }
                onChange={
                  (
                    event
                  ) =>
                    setSearch(
                      event
                        .target
                        .value
                    )
                }
                placeholder={
                  "Search employee"
                }
              />

            </label>


            <select
              value={
                level
              }
              onChange={
                (
                  event
                ) =>
                  setLevel(
                    event
                      .target
                      .value
                  )
              }
            >

              <option value="All">
                All
              </option>

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


        <div className="risk-table-wrapper">

          <table className="risk-table">

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Risk Score
                </th>

                <th>
                  Risk Level
                </th>

                <th>
                  Anomalies
                </th>

                <th>
                  Alerts
                </th>

                <th>
                  Risk Factors
                </th>

              </tr>

            </thead>


            <tbody>

              {
                loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="risk-loading"
                    >

                      Loading risk
                      analysis...

                    </td>

                  </tr>

                ) : employees
                  .length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="risk-loading"
                    >

                      No employee
                      risk data found

                    </td>

                  </tr>

                ) : (

                  employees
                    .map(
                      (
                        employee,
                        index
                      ) => {

                        const name =
                          getEmployeeName(
                            employee
                          );

                        const id =
                          getEmployeeId(
                            employee
                          );

                        const score =
                          getRiskScore(
                            employee
                          );

                        const riskLevel =
                          getRiskLevel(
                            employee
                          );

                        const factors =
                          Array.isArray(
                            employee
                              ?.risk_factors
                          )
                            ? employee
                                .risk_factors
                            : [];


                        return (

                          <tr
                            key={
                              `${id}-${index}`
                            }
                          >

                            <td>

                              <div className="risk-employee">

                                <div>

                                  {
                                    name
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()
                                  }

                                </div>

                                <section>

                                  <strong>

                                    {
                                      name
                                    }

                                  </strong>

                                  <span>

                                    ID:
                                    {" "}

                                    {
                                      id
                                    }

                                  </span>

                                </section>

                              </div>

                            </td>


                            <td>

                              <div className="risk-score">

                                <span>

                                  {
                                    score
                                      .toFixed(
                                        1
                                      )
                                  }

                                </span>

                                <div>

                                  <i
                                    style={{
                                      width:
                                        `${score}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </td>


                            <td>

                              <span
                                className={
                                  `risk-level ${getRiskClass(
                                    riskLevel
                                  )}`
                                }
                              >

                                {
                                  riskLevel
                                }

                              </span>

                            </td>


                            <td>

                              {
                                employee
                                  ?.activity_summary
                                  ?.anomaly_count ??
                                employee
                                  ?.anomaly_count ??
                                employee
                                  ?.anomaly ??
                                0
                              }

                            </td>


                            <td>

                              {
                                employee
                                  ?.activity_summary
                                  ?.alert_count ??
                                employee
                                  ?.alert_count ??
                                0
                              }

                            </td>


                            <td>

                              <div className="risk-factor-list">

                                {
                                  factors
                                    .length >
                                  0 ? (

                                    factors
                                      .slice(
                                        0,
                                        2
                                      )
                                      .map(
                                        (
                                          factor,
                                          factorIndex
                                        ) => (

                                          <span
                                            key={
                                              factor
                                                ?.factor ||
                                              factor
                                                ?.name ||
                                              factorIndex
                                            }
                                          >

                                            {
                                              factor
                                                ?.factor ||
                                              factor
                                                ?.name ||
                                              String(
                                                factor
                                              )
                                            }

                                          </span>

                                        )
                                      )

                                  ) : (

                                    <span>

                                      No factors

                                    </span>

                                  )
                                }

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )

                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


export default RiskAnalysis;