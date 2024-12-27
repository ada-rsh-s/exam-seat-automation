import { EditOutlined } from "@ant-design/icons";
import { Button, DatePicker, Popconfirm, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";

const { RangePicker } = DatePicker;

const SlotsTable = () => {
  const { fetchSlots, updateSlots } = useAppContext();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {    
    fetchSlots().then((data) => {      
      setData(data);
    });
  }, [fetchSlots]);

  const filteredResults = filteredData(data, searchTerm);

  const handleEdit = (key) => {
    setEditingKey(key);
    const record = data.find((item) => item.Slot === key);
    setEditData({ ...record }); 
  };

  const handleSave = async () => {
    const newData = data.map((item) =>
      item.Slot === editingKey ? editData : item
    );

    await updateSlots(newData);
    setData(newData);
    setEditingKey("");
    setEditData({}); // Clear editData
  };

  const handleChange = (value, field) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (value) => {
    setEditData((prev) => ({
      ...prev,
      Date: value, 
    }));
  };

  const columns = [
    {
      name: "Slot",
      selector: (row) => row.Slot,
      wrap: true,
      sortable: true,
      width: "100px",
    },
    {
      name: "Exams",
      selector: (row) =>
        editingKey === row.Slot ? (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder={`Add Exams for ${row.Slot}`}
            value={editData.Exams}
            onChange={(value) => handleChange(value, "Exams")}
            options={editData.options.map((exam) => ({
              value: exam,
              label: exam,
            }))}
          />
        ) : (
          row.Exams.join(" ║ ")
        ),
      wrap: true,
      width: "700px",
      sortable: true,
    },
    {
      name: "Date & Time",
      selector: (row) =>
        editingKey === row.Slot ? (
          <RangePicker
            size="large"
            showTime={{ format: "hh:mm A" }}
            value={editData.Date}
            onChange={handleDateRangeChange}
            format="DD-MM-YYYY hh:mm A"
            style={{ width: "400px", height: "50px" }}
          />
        ) : row.Date ? (
          dayjs(row.Date[0]).format("DD-MM-YYYY hh:mm A") +
          " to " +
          dayjs(row.Date[1]).format("DD-MM-YYYY hh:mm A")
        ) : (
          "No Date & Time Allotted"
        ),
      wrap: true,
      width: "450px",

      sortable: true,
    },
    {
      name: "Edit",
      selector: (row) =>
        editingKey === row.Slot ? (
          <span>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
            <Popconfirm
              title="Cancel editing?"
              onConfirm={() => {
                setEditingKey("");
                setEditData({}); // Clear editData on cancel
              }}
            >
              <Button type="primary" style={{ marginLeft: 8 }} danger>
                Cancel
              </Button>
            </Popconfirm>
          </span>
        ) : (
          <Button type="link" onClick={() => handleEdit(row.Slot)}>
            <EditOutlined />
          </Button>
        ),
      sortable: false,
    },
  ];

  let props = {
    tableName: "Slots",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
  };

  return <TableContainer {...props} />;
};

export default SlotsTable;
