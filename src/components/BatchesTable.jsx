import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useBatchStore } from "../stores";
import { filteredData } from "../utils/dataSearch";
import TableContainer from "./TableContainer";
import { Button, Popconfirm, Form, InputNumber, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";

const BatchesTable = () => {
  const fetchBatches = useBatchStore((state) => state.fetchBatches);
  const fetchAcademicYear = useBatchStore((state) => state.fetchAcademicYear);
  const updateAcademicYear = useBatchStore((state) => state.updateAcademicYear);
  const academicYear = useBatchStore((state) => state.academicYear);
  const updateBatches = useBatchStore((state) => state.updateBatches);

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchAcademicYear();
  }, [fetchAcademicYear]);

  useEffect(() => {
    if (academicYear) {
      fetchBatches(academicYear).then((batchData) => {
        setData(batchData);
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
      name: "Start",
      selector: (row) =>
        editingKey === row.deptName ? (
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please enter Starting Roll No",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={row.regStrength}
              value={editData.start}
              placeholder="Staring Roll No"
              style={{ width: "100%" }}
              onChange={(value) => handleChange(value, "start")}
            />
          </Form.Item>
        ) : (
          row.start || 0
        ),
      sortable: true,
      wrap: true,
      width: "100px",
    },
    {
      name: "Reg",
      selector: (row) =>
        editingKey === row.deptName ? (
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please enter Regular Strength",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={0}
              max={500}
              value={editData.regStrength}
              placeholder="Regular Strength"
              style={{ width: "100%" }}
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
        editingKey === row.deptName ? (
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please enter Let Strength",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={0}
              max={500}
              placeholder="Let Strength"
              value={editData.letStrength}
              style={{ width: "100%" }}
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
        editingKey === row.deptName ? (
          <Form.Item
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
              value={editData.drop}
              placeholder="Add Dropped students"
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
        editingKey === row.deptName ? (
          <Form.Item
            rules={[
              {
                required: true,
                message: "Please add Rejoined students",
              },
            ]}
          >
            <Select
              mode="tags"
              value={editData.rejoin}
              style={{ minWidth: "200px" }}
              placeholder="Add Rejoined students"
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
    return currentDate.year() < currentYear - 1;
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
