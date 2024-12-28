import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button } from "antd";
import { Popconfirm } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { InputNumber } from "antd";
import { Form } from "antd";

const ExamHallTable = () => {
  const { fetchExamHalls, allotExamHall, updateExamHalls } = useAppContext();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [preselectedRows, setPreselectedRows] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchExamHalls().then((fetchedData) => {
      setData(fetchedData);
      const defaultSelectedRows = fetchedData.filter(
        (row) => row.alloted == true
      );
      setPreselectedRows(defaultSelectedRows);
    });
  }, [fetchExamHalls]);

  const handleEdit = (key) => {
    setEditingKey(key);
    const record = data.find((item) => item.Hall === key);

    setEditData({ ...record });
  };

  const handleSave = async () => {
    const { Hall, rowcol, currCapacity } = editData;

    console.log(editData);

    if (
      Hall.replace(/\s/g, "") === "WAB412" ||
      Hall.replace(/\s/g, "") === "EAB310"
    ) {
      const desks = currCapacity;
      let columns = 3;

      while (columns < desks) {
        const rows = Math.floor(desks / columns);
        if (rows > columns) {
          columns += 2;
        } else {
          break;
        }
      }

      columns -= 2;
      rowcol[0] = Math.floor(desks / columns);
      rowcol[1] = columns;
    } else {
      editData.currCapacity = editData.currCapacity * 2;

      rowcol[0] = Math.floor(currCapacity);
      rowcol[1] = 2;
    }

    const newData = data.map((item) =>
      item.Hall === editingKey ? editData : item
    );
    console.log(newData);

    await updateExamHalls(newData);
    setData(newData);
    setEditingKey("");
    setEditData({});
  };

  const handleChange = (value, field) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredResults = filteredData(data, searchTerm);

  const columns = [
    {
      name: "Exam Halls",
      selector: (row) => row.Hall,
      sortable: true,
      wrap: true,
    },
    {
      name: "Current Capacity",
      selector: (row) =>
        editingKey == row.Hall ? (
          <Form.Item
            initialValue={editData.currCapacity}
            rules={[
              {
                required: true,
                message: "Please enter Capacity",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={0}
              max={
                row.Hall.replace(/\s/g, "") === "WAB412" ||
                row.Hall.replace(/\s/g, "") === "EAB310"
                  ? row.accCapacity
                  : row.accCapacity / 2
              }
              placeholder="Current Capacity"
              style={{ width: "100%", marginTop: "20px" }}
              value={editData.currCapacity}
              onChange={(value) => handleChange(value, "currCapacity")}
            />
          </Form.Item>
        ) : (
          row.currCapacity || 0
        ),
      sortable: true,
      wrap: true,
    },
    {
      name: "Actual Capacity",
      selector: (row) => row.accCapacity,
      sortable: true,
      wrap: true,
    },
    {
      name: "Edit",
      selector: (row) =>
        editingKey === row.Hall ? (
          <span>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
            <Popconfirm
              title="Cancel editing?"
              onConfirm={() => {
                setEditingKey("");
                setEditData({});
              }}
            >
              <Button type="primary" style={{ marginLeft: 8 }} danger>
                Cancel
              </Button>
            </Popconfirm>
          </span>
        ) : (
          <Button type="link" onClick={() => handleEdit(row.Hall)}>
            <EditOutlined />
          </Button>
        ),
      sortable: false,
    },
  ];

  const handleRowSelected = async (state) => {
    const newSelectedRows = state.selectedRows;

    if (!newSelectedRows || newSelectedRows.length === 0) {
      return;
    }
    const newSelectedRowsIds = newSelectedRows.map((row) => row.Hall);

    if (
      JSON.stringify(newSelectedRowsIds) !==
      JSON.stringify(preselectedRows.map((row) => row.Hall))
    ) {
      setPreselectedRows(newSelectedRows);
      const newData = data.map((item) => ({
        ...item,
        alloted: newSelectedRowsIds.includes(item.Hall),
      }));

      setData(newData);
      await allotExamHall(newSelectedRows);
    }
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
    search: true,
  };

  return (
    <>
      <TableContainer {...props} />
    </>
  );
};

export default ExamHallTable;
