import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";

const ExamHallTable = () => {
  const { fetchExamHalls, allotExamHall } = useAppContext();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [preselectedRows, setPreselectedRows] = useState([]);

  useEffect(() => {
    fetchExamHalls().then((fetchedData) => {
      setData(fetchedData);
      const defaultSelectedRows = fetchedData.filter(
        (row) => row.alloted == true
      );
      setPreselectedRows(defaultSelectedRows);
    });
  }, [fetchExamHalls]);

  const filteredResults = filteredData(data, searchTerm);

  const columns = [
    {
      name: "Exam Halls",
      selector: (row) => row.Hall,
      sortable: true,
      wrap: true,
    },
    {
      name: "Capacity",
      selector: (row) => row.Capacity,
      sortable: true,
      wrap: true,
    },
  ];

  const handleRowSelected = async (state) => {
    await allotExamHall(state.selectedRows);
  };

  let props = {
    tableName: "Exam Halls",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
    selectableRows: true,
    selectableRowSelected: (row) => {
      return preselectedRows.some((selected) => selected.Hall === row.Hall);
    },
    handleRowSelected,
  };

  return (
    <>
    
      <TableContainer {...props} />
    </>
  );
};

export default ExamHallTable;
