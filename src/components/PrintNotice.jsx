import { useEffect } from "react";
import { useAllocationStore } from "../stores";
import "../styles/Printdept.css";

const PrintNotice = () => {
  const noticeBoardView = useAllocationStore((state) => state.noticeBoardView);
  const dateTime = useAllocationStore((state) => state.dateTime);

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

  return (
    <div className="noticeBoard">
      <center>
        {" "}
        <h2>JYOTHI ENGINEERING COLLEGE</h2>
        <h3>SEATING ARRANGEMENTS</h3>
      </center>

      <table className="table">
        <thead>
          <tr>
            <th colSpan={3} style={{ textAlign: "center" }}>
              {dateTime}
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
