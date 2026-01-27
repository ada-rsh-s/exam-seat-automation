import { useEffect } from "react";
import { useAllocationStore } from "../stores";
import "../styles/Printdept.css";

const PrintDept = () => {
  const deptView = useAllocationStore((state) => state.deptView);
  const dateTime = useAllocationStore((state) => state.dateTime);

  /**
   * Parse dateTime string to extract session info
   * Format: "DD-MM-YYYY - DD-MM-YYYY | hh:mm A - hh:mm A"
   * Returns FN (Forenoon) or AN (Afternoon)
   */
  const parseDateTime = (dtString) => {
    if (!dtString) return { dateRange: "", session: "" };

    const parts = dtString.split(" | ");
    const dateRange = parts[0] || "";
    const timeRange = parts[1] || "";

    // Determine session based on time - FN (Forenoon) or AN (Afternoon)
    let session = "";
    if (timeRange) {
      const startTime = timeRange.split(" - ")[0];
      if (startTime) {
        const hour = parseInt(startTime.split(":")[0]);
        const isPM = startTime.toLowerCase().includes("pm");
        const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
        session = hour24 < 12 ? "FN" : "AN";
      }
    }

    return { dateRange, timeRange, session };
  };

  const createItemPairs = (items) => {
    let pairs = [];
    for (let i = 0; i < items.length - 1; i += 2) {
      pairs.push(`${items[i]} - ${items[i + 1]}`);
    }
    if (items.length % 2 !== 0) {
      pairs.push(`${items[items.length - 1]} - ${items[items.length - 1]}`);
    }
    return pairs;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { dateRange, timeRange, session } = parseDateTime(dateTime);

  return (
    <div className="print-container">
      {/* College Header */}
      <div className="college-header">
        <h2 className="college-name">JYOTHI ENGINEERING COLLEGE (AUTONOMOUS), CHERUTHURUTHY</h2>
        <h3 className="exam-title">DEPARTMENT-WISE SEATING ARRANGEMENTS</h3>
      </div>

      {deptView.length >= 0 && (
        <table className="table">
          <thead>
            {/* Date and Session Row */}
            <tr>
              <th colSpan={4}>
                {dateRange} {session && `(${session})`} {timeRange && `| ${timeRange}`}
              </th>
            </tr>
            <tr>
              <th>Department</th>
              <th>Room</th>
              <th>Roll Numbers</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {deptView.map((item, index) => {
              const pairs = createItemPairs(item.rollNums);
              return item.rooms.map((room, roomIndex) => (
                <tr key={`${index}-${roomIndex}`}>
                  {roomIndex === 0 ? (
                    <td className="class-column" rowSpan={item.rooms.length}>
                      {item.dept}
                    </td>
                  ) : null}
                  <td>{room}</td>
                  <td>{pairs[roomIndex] || "-"}</td>
                  <td>{item.count[roomIndex] || "-"}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintDept;
