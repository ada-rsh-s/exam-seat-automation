import { useEffect, useState } from "react";
import "../styles/Printdept.css";
import queryString from "query-string";

const PrintAttendance = () => {
  const parsedQuery = queryString.parse(window.location.search);

  const singleAttendanceView = JSON.parse(parsedQuery.singleAttendanceView);
  const { dateTime } = parsedQuery;
  const [dateSessionArray, setDateSessionArray] = useState([]);

  /**
   * Determine session type based on time string
   * Returns FN (Forenoon) or AN (Afternoon)
   */
  const getSessionType = (timeStr) => {
    if (!timeStr) return "";
    const hour = parseInt(timeStr.split(":")[0]);
    const isPM = timeStr.toLowerCase().includes("pm");
    const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
    return hour24 < 12 ? "FN" : "AN";
  };

  useEffect(() => {
    if (!dateTime) return;

    const parts = dateTime.split(" | ");
    const dateRange = parts[0] || "";
    const timeRange = parts[1] || "";

    const [startDateStr, endDateStr] = dateRange
      .split(" - ")
      .map((date) => date.split("-").reverse().join("-"));

    // Get session type from time
    const startTime = timeRange.split(" - ")[0] || "";
    const sessionType = getSessionType(startTime);

    const generatedDates = [];
    for (
      let d = new Date(startDateStr);
      d <= new Date(endDateStr);
      d.setDate(d.getDate() + 1)
    ) {
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear().toString().slice(-2);
      generatedDates.push({
        date: `${day}-${month}-${year}`,
        session: sessionType,
      });
    }
    setDateSessionArray(generatedDates);
  }, [dateTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Extract class and room info
  const classInfo = singleAttendanceView[0]?.deptRoom?.substring(0, 4) || "";
  const roomInfo = singleAttendanceView[0]?.deptRoom?.slice(4) || "";

  return (
    <div className="print-container attendance-sheet">
      {/* College Header */}
      <div className="college-header">
        <h2 className="college-name">JYOTHI ENGINEERING COLLEGE (AUTONOMOUS), CHERUTHURUTHY</h2>
        <h3 className="exam-title">ATTENDANCE SHEET</h3>
        <p className="class-room-info">
          <strong>Class: {classInfo}</strong> | <strong>Room: {roomInfo}</strong>
        </p>
      </div>

      {/* Main Table - Student Data Only */}
      <table style={{ width: "95%", margin: "0 auto" }} className="table">
        <thead>
          <tr>
            <th width="60">Sl No</th>
            <th width="180">Register Number</th>
            {dateSessionArray.map(({ date, session }, idx) => (
              <th key={`header-${idx}`}>
                {date} ({session})
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {singleAttendanceView.map((item, index) => (
            <tr key={item.slNo}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td className="class-column">{item.regNo}</td>
              {dateSessionArray.map((_, idx) => (
                <td key={`${item.regNo}-${idx}`}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Section */}
      <div className="attendance-footer" style={{ width: "95%", margin: "0 auto" }}>
        {/* Absentee Register Numbers Section */}
        <table className="table footer-table">
          <tbody>
            <tr>
              <td width="240">
                <strong>Register No. of Absentees</strong>
              </td>
              {dateSessionArray.map((_, idx) => (
                <td key={`abs-${idx}`}></td>
              ))}
            </tr>
            <tr>
              <td width="240">
                <strong>Name of Faculty</strong>
              </td>
              {dateSessionArray.map((_, idx) => (
                <td key={`fac-${idx}`}></td>
              ))}
            </tr>
            <tr>
              <td width="240">
                <strong>Signature of Faculty</strong>
              </td>
              {dateSessionArray.map((_, idx) => (
                <td key={`sig-${idx}`} className="signature-cell"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintAttendance;
