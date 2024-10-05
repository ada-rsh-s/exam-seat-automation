import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Print.css";

const ClassPrint = () => {
  const { singleClassView, singleClassName, dateTime } = useAppContext();

  if (!singleClassView || singleClassView.length === 0) {
    return <p>No data available to display</p>;
  }

  const headerCount = singleClassView[0].length / 2;

  const headers = Array.from({ length: headerCount }, (_, i) => [
    `Seat No`,
    `Register No`,
  ]).flat();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <table className="table">
      <thead>
        <tr>
          <th colSpan={headers.length} style={{ textAlign: "center" }}>
            {singleClassName} ( {dateTime} )
          </th>
        </tr>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {singleClassView.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell === 0 ? '-' : cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClassPrint;
