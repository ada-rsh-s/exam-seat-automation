import { useEffect, useState } from "react";
import { useAllocationStore } from "../stores";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import queryString from "query-string";

const DepartmentTable = () => {
  const deptView = useAllocationStore((state) => state.deptView);
  const attendanceView = useAllocationStore((state) => state.attendanceView);
  const dateTime = useAllocationStore((state) => state.dateTime);

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
    const attendData = {
      destination: "attendance",
      singleAttendanceView: JSON.stringify(attendanceView[index]),
      dateTime,
    };

    const queryParams = queryString.stringify(attendData);
    window.open(`/print?${queryParams}`, "_blank", "noopener,noreferrer");
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
              key={idx}
              className="printbutton attendancebutton"
              onClick={() => handleClick(index, idx)}
              type="primary"
            >
              {row.dept} Attendance Sheet {idx + 1}
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
