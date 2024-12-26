import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button } from "antd";
import { Popconfirm } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Form } from "antd";
import { InputNumber } from "antd";
import { Select } from "antd";

const BatchesTable = () => {
  const {
    fetchBatches,
    fetchAcademicYear,
    updateAcademicYear,
    academicYear,
    updateBatches,
  } = useAppContext();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchAcademicYear();
  }, []);

  useEffect(() => {
    if (academicYear) {
      fetchBatches(academicYear).then((data) => {
        setData(data);
      });
    }
  }, [fetchBatches, academicYear]);

  const handleEdit = (key) => {
    setEditingKey(key);
    const record = data.find((item) => item.deptName === key);

    setEditData({ ...record });
  };

  const handleSave = async () => {
    const newData = data.map((item) =>
      item.deptName === editingKey ? editData : item
    );

    await updateBatches(newData);
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

  const filteredResults = filteredData(data, searchTerm);
  const columns = [
    {
      name: "Dept",
      selector: (row) => row.deptName,
      sortable: true,
      wrap: true,
      width: "100px",
    },
    {
      name: "Subjects",
      selector: (row) =>
        editingKey === row.deptName ? (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder={`Add Exams for ${row.deptName}`}
            value={editData.exams}
            onChange={(value) => handleChange(value, "exams")}
            options={editData.options.map((exam) => ({
              value: exam,
              label: exam,
            }))}
          />
        ) : (
          row.exams.join(" ║ ")
        ),
      sortable: true,
      width: "400px",
      wrap: true,
    },
    {
      name: "Reg",
      selector: (row) =>
        editingKey == row.deptName ? (
          <Form.Item
            initialValue={editData.regStrength}
            rules={[
              {
                required: true,
                message: "Please enter Regular Strength",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={500}
              placeholder="Regular Strength"
              style={{ width: "100%" }}
              value={editData.regStrength}
              onChange={(value) => handleChange(value, "regStrength")}
            />
          </Form.Item>
        ) : (
          row.regStrength || 0
        ),
      sortable: true,
      wrap: true,
      width: "100px",
    },
    {
      name: "LET",
      selector: (row) =>
        editingKey == row.deptName ? (
          <Form.Item
            initialValue={editData.letStrength}
            rules={[
              {
                required: true,
                message: "Please enter Let Strength",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={500}
              placeholder="Let Strength"
              style={{ width: "100%" }}
              value={editData.letStrength}
              onChange={(value) => handleChange(value, "letStrength")}
            />
          </Form.Item>
        ) : (
          row.letStrength || 0
        ),
      sortable: true,
      wrap: true,
      width: "100px",
    },
    {
      name: "Dropped",
      selector: (row) =>
        editingKey == row.deptName ? (
          <Form.Item
            initialValue={editData.drop}
            rules={[
              {
                required: true,
                message: "Please add Dropped students",
              },
            ]}
          >
            <Select
              style={{ minWidth: "200px" }}
              mode="tags"
              placeholder="Add Dropped students"
              value={editData.drop}
              onChange={(value) => handleChange(value, "drop")}
            />
          </Form.Item>
        ) : (
          row.drop?.join(" , ") || "NIL"
        ),
      sortable: true,
      wrap: true,
    },
    {
      name: "Rejoined",
      selector: (row) =>
        editingKey == row.deptName ? (
          <Form.Item
            initialValue={editData.rejoin}
            rules={[
              {
                required: true,
                message: "Please add Rejoined students",
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ minWidth: "200px" }}
              placeholder="Add Rejoined students"
              value={editData.rejoin}
              onChange={(value) => handleChange(value, "rejoin")}
            />
          </Form.Item>
        ) : (
          row.rejoin?.join(" , ") || "NIL"
        ),
      sortable: true,
      wrap: true,
    },
    {
      name: "Edit",
      selector: (row) =>
        editingKey === row.deptName ? (
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
          <Button type="link" onClick={() => handleEdit(row.deptName)}>
            <EditOutlined />
          </Button>
        ),
      sortable: false,
    },
  ];

  const disabledDate = (currentDate) => {
    const currentYear = dayjs().year();
    return currentDate.year() < currentYear;
  };

  const yearChanged = async (date) => {
    await updateAcademicYear(date, academicYear);
  };

  let props = {
    tableName: "Batches",
    columns,
    filteredResults,
    searchTerm,
    setSearchTerm,
    academicYear,
    yearChanged,
    disabledDate,
  };

  return (
    <>
      <TableContainer {...props} />
    </>
  );
};

export default BatchesTable;
