import { useEffect, useState } from "react";
import "../styles/Printdept.css";
import queryString from "query-string";

const PrintAttendance = () => {
  const parsedQuery = queryString.parse(window.location.search);

  const singleAttendanceView = JSON.parse(parsedQuery.singleAttendanceView);
  const { dateTime } = parsedQuery;
  const [dateArray, setDateArray] = useState([]);

  useEffect(() => {
    const dateRange = dateTime.split(" | ")[0];
    const [startDate, endDate] = dateRange
      .split(" - ")
      .map((date) => date.split("-").reverse().join("-"));

    const generatedDates = [];
    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear().toString().slice(-2);
      generatedDates.push(`${day}-${month}-${year}`);
    }
    setDateArray(generatedDates);
  }, [dateTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <table style={{ width: "90%", marginLeft: "60px" }} className="table">
        <thead>
          <tr>
            <th colSpan={2 + dateArray.length} style={{ textAlign: "center" }}>
              <strong>JYOTHI ENGINEERING COLLEGE, CHERUTHURUTHY</strong>
            </th>
          </tr>
          <tr>
            <th
              colSpan={2 + dateArray.length}
              style={{ textAlign: "center", padding: "5px" }}
            >
              <strong>
                Class: {singleAttendanceView[0].deptRoom.substring(0, 4)}
              </strong>{" "}
              |{" "}
              <strong>Room: {singleAttendanceView[0].deptRoom.slice(4)}</strong>
            </th>
          </tr>
          <tr>
            <th width="250" className="header-column">
              Sl No
            </th>
            <th width="200" className="header-column">Register Number</th>
            {dateArray.map((date) => (
              <th key={date} className="header-column">
                {date}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {singleAttendanceView.map((item, index) => (
            <tr key={item.slNo}>
              <td>{index + 1}</td>
              <td className="class-column">{item.regNo}</td>
              {dateArray.map((date) => (
                <td key={`${item.regNo}-${date}`} className="class-column"></td>
              ))}
            </tr>
          ))}
          <tr key="regabs">
            <td>
              <strong>Register number of absentees</strong>
            </td>
            <td></td>

            {dateArray.map((_, idx) => (
              <td key={`regabs-${idx}`}></td>
            ))}
          </tr>
          <tr key="facname">
            <td>
              <strong>Name of faculty</strong>
            </td>
            <td> </td>
            {dateArray.map((_, idx) => (
              <td key={`facname-${idx}`}></td>
            ))}{" "}
          </tr>
          <tr key="facsign">
            <td>
              <strong>Signature of faculty</strong>
            </td>
            <td> </td>
            {dateArray.map((_, idx) => (
              <td key={`facsign-${idx}`}></td>
            ))}{" "}
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default PrintAttendance;
