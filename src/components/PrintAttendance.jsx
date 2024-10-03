import { useAppContext } from "../context/AppContext";
import "../styles/Printdept.css";

const PrintAttendance = () => {
  const { singleAttendanceView, dateTime } = useAppContext();
  console.log(singleAttendanceView);

  return (
    <>
      {/* Attendance Table with College Information inside */}
      <table style={{ width: "90%", marginLeft: "60px" }} className="table">
        <thead>
          {/* College Information Row */}
          <tr>
            <th colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
              <h2>JYOTHI ENGINEERING COLLEGE, CHERUTHURUTHY</h2>
            </th>
          </tr>
          <tr>
            <th colSpan="3" style={{ textAlign: "center", padding: "5px" }}>
              <strong>
                Class : {singleAttendanceView[0].deptRoom.substring(0, 4)}
              </strong>{" "}
              | <strong>Room : {singleAttendanceView[0].deptRoom.slice(4)}</strong>
            </th>
          </tr>

          {/* Table Headers */}
          <tr>
            <th className="header-column">Sl No</th>
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
        </tbody>
      </table>
    </>
  );
};

export default PrintAttendance;
