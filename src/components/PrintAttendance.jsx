import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Printdept.css";
import queryString from "query-string";

const PrintAttendance = () => {
  const parsedQuery = queryString.parse(window.location.search);

  // Parse back the `singleClassView` array
  const singleAttendanceView = JSON.parse(parsedQuery.singleAttendanceView);
  const {  dateTime } = parsedQuery;

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Attendance Table with College Information inside */}
      <table style={{ width: "90%", marginLeft: "60px" }} className="table">
        <thead>
          {/* College Information Row */}
          <tr>
            <th colSpan="3" style={{ textAlign: "center" }}>
              <strong>JYOTHI ENGINEERING COLLEGE, CHERUTHURUTHY</strong>
            </th>
          </tr>
          <tr>
            <th colSpan="3" style={{ textAlign: "center", padding: "5px" }}>
              <strong>
                Class : {singleAttendanceView[0].deptRoom.substring(0, 4)}
              </strong>{" "}
              |{" "}
              <strong>
                Room : {singleAttendanceView[0].deptRoom.slice(4)}
              </strong>
            </th>
          </tr>

          {/* Table Headers */}
          <tr>
            <th width="300" className="header-column">
              Sl No
            </th>
            <th className="header-column">Register Number</th>
            <th className="header-column">{dateTime.substring(0, 10)}</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {singleAttendanceView.map((item, index) => (
            <tr key={item.slNo}>
              <td>{index + 1}</td>
              <td className="class-column">{item.regNo}</td>
              <td></td>
            </tr>
          ))}
          <tr key="regabs">
            <td>
              <strong>Register number of absentees</strong>
            </td>
            <td colspan="2"></td>
          </tr>
          <tr key="facname">
            <td>
              <strong>Name of faculty</strong>
            </td>
            <td colspan="2"></td>
          </tr>
          <tr key="facsign">
            <td>
              <strong>Signature of faculty</strong>
            </td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default PrintAttendance;
