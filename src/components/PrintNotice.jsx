import { useEffect } from "react";
import { useAllocationStore } from "../stores";
import "../styles/Printdept.css";

const PrintNotice = () => {
  const noticeBoardView = useAllocationStore((state) => state.noticeBoardView);
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
        <h3 className="exam-title">SEATING ARRANGEMENTS</h3>
      </div>

      <table className="table">
        <thead>
          {/* Date and Session Row */}
          <tr>
            <th colSpan={3}>
              {dateRange} {session && `(${session})`} {timeRange && `| ${timeRange}`}
            </th>
          </tr>
          <tr>
            <th>Class</th>
            <th>Register No</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {noticeBoardView.map(
            ({ class: className, items, count }, classIndex) => {
              const pairs = createItemPairs(items);
              const rowSpan = pairs.length || 1;

              return pairs.length > 0 ? (
                pairs.map((pair, pairIndex) => (
                  <tr key={`${className}-${pairIndex}`}>
                    {pairIndex === 0 && (
                      <td rowSpan={rowSpan} className="class-column">
                        {className}
                      </td>
                    )}
                    <td>{pair}</td>
                    <td>{count[pairIndex] || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr key={classIndex}>
                  <td className="class-column">{className}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintNotice;
