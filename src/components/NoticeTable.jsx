import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import queryString from "query-string";

const NoticeTable = () => {
  const {
    noticeBoardView,
    dateTime,
    classroomView,
    setSingleClassView,
    classNames,
  } = useAppContext();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (noticeBoardView.length > 0) {
      setData(noticeBoardView);
    }
  }, [noticeBoardView]);

  const filteredResults = filteredData(data, searchTerm);

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

  const formatCount = (counts) => {
    return counts ? counts.join("<br /><br />") : "0";
  };
  const handleClick = (index) => {
    const classroomData = {
      destination: "class",
      singleClassView: JSON.stringify(classroomView[index]), // Convert 2D array to JSON string
      singleClassName: classNames[index],
      dateTime,
    };

    // Stringify classroomData into query parameters
    const queryParams = queryString.stringify(classroomData);

    // setSingleClassView(classroomView[index],classNames[index]);
    window.open(`/print?${queryParams}`, "_blank", "noopener,noreferrer");
  };

  const columns = [
    {
      name: "Class",
      selector: (row) => row.class,
      sortable: true,
      wrap: true,
    },
    {
      name: "Register No",
      selector: (row) => (
        <div
          style={{ marginTop: "10px", marginBottom: "10px" }}
          dangerouslySetInnerHTML={{ __html: formatItems(row.items) }}
        />
      ),
      wrap: true,
    },
    {
      name: "Count",
      selector: (row) => (
        <div dangerouslySetInnerHTML={{ __html: formatCount(row.count) }} />
      ),
      wrap: true,
    },
    {
      name: "Hall arrangement",
      selector: (row) => (
        <Button
          className="printbutton"
          onClick={() => handleClick(row.index)}
          key={row.index}
          type="primary"
        >
          Print Hall
        </Button>
      ),
      wrap: true,
    },
  ];

  let props = {
    tableName: "Notice Board",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
    dateTime,
  };

  return (
    <>
      <TableContainer {...props} />
      <center>
        <Button
          className="printbutton"
          onClick={() => {
            navigate("/print?destination=notice");
          }}
        >
          PRINT
        </Button>
      </center>
    </>
  );
};

export default NoticeTable;
