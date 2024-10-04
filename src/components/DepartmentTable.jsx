import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const DepartmentTable = () => {
  const { deptView, attendanceView, dateTime, setSingleAttendance } =
    useAppContext();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (deptView.length > 0) {
      setData(deptView);
    }
  }, [deptView]);

  const formatItems = (items) => {
    return items
      .map((item, index) => {
        if (index % 2 === 0 && items[index + 1]) {
          return `${item} - ${items[index + 1]}`;
        }
        return null;
      })
      .filter(Boolean)
      .join("<br /><br />");
  };

  const formatCounts = (counts) => {
    return counts.join("<br /><br />");
  };

  const handleClick = (index) => {    
    setSingleAttendance(attendanceView[index]);
    navigate("/print?destination=attendance");
  };

  const filteredResults = filteredData(data, searchTerm);

  const columns = [
    {
      name: "Department",
      selector: (row) => row.dept,
      sortable: true,
      wrap: true,
    },
    {
      name: "Room",
      selector: (row) => (
        <div
          style={{ marginTop: "10px", marginBottom: "10px" }}
          dangerouslySetInnerHTML={{ __html: formatCounts(row.rooms) }}
        />
      ),
      wrap: true,
      width: "200px",
    },
    {
      name: "Roll Numbers",
      selector: (row) => (
        <div dangerouslySetInnerHTML={{ __html: formatItems(row.rollNums) }} />
      ),
      wrap: true,
      width: "500px",
    },
    {
      name: "Count",
      selector: (row) => (
        <div dangerouslySetInnerHTML={{ __html: formatCounts(row.count) }} />
      ),
      wrap: true,
      width: "100px",
    },
    {
      name: "Attendance",
      selector: (row) => (
        <>
          {row.indexes.map((index, idx) => (
            <Button
              key={idx} // Add a unique key for each button
              className="printbutton attendancebutton"
              onClick={() => handleClick(index, idx)} // Pass the index of the button
              type="primary"
            >
              {row.dept} Attendance Sheet {idx+1} {/* Use the index as the label */}
            </Button>
          ))}
        </>
      ),
      wrap: true,
    },
  ];

  let props = {
    tableName: "Department View",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
    dateTime,
  };

  return (
    <div className="dept-view">
      <TableContainer {...props} />
      <center>
        <Button
          className="printbutton"
          onClick={() => {
            navigate("/print?destination=dept");
          }}
        >
          PRINT
        </Button>
      </center>
    </div>
  );
};

export default DepartmentTable;
