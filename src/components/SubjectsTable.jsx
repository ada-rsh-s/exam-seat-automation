import { useEffect, useState } from "react";
import { useSubjectStore } from "../stores";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";

const SubjectsTable = () => {
  const fetchSubjects = useSubjectStore((state) => state.fetchSubjects);

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubjects().then((subjectsData) => {
      setData(subjectsData);
    });
  }, [fetchSubjects]);

  const filteredResults = filteredData(data, searchTerm);

  const columns = [
    {
      name: "Semester",
      selector: (row) => row.SEM,
      sortable: true,
      wrap: true,
    },
    {
      name: "Department",
      selector: (row) => row.DEPT,
      sortable: true,
      wrap: true,
    },
    {
      name: "Course Code",
      selector: (row) => row["COURSE CODE"],
      sortable: true,
      wrap: true,
    },
    {
      name: "Course Name",
      selector: (row) => row["COURSE NAME"],
      sortable: true,
      wrap: true,
      width: "600px",
    },
    {
      name: "Slot",
      selector: (row) => row.SLOT,
      sortable: true,
      wrap: true,
    },
    {
      name: "Credit",
      selector: (row) => row.CREDIT,
      sortable: true,
      wrap: true,
    },
  ];

  let props = {
    tableName: "Subjects",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
  };

  return (
    <>
      <TableContainer {...props} />
    </>
  );
};

export default SubjectsTable;
