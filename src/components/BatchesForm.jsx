import React, { useState, useEffect, useRef } from "react";
import { Button, Select, Form, Popconfirm } from "antd";
import { useAppContext } from "../context/AppContext";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { InputNumber } from "antd";
import FlexContainer from "../components/FlexContainer";

const BatchesForm = () => {
  const navigate = useNavigate();
  const { batchesForm, fetchExamOptions } = useAppContext();

  const [depts, setDepts] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const hasLoaded = useRef(false);
  const [form] = Form.useForm();

  const handleYearChange = async (value) => {
    setSelectedYear(value);
    try {
      const fetchedDepts = await fetchExamOptions(value); 
      setDepts(fetchedDepts);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleFieldChange = (field, value, deptName) => {
    setDepts((prevDepts) =>
      prevDepts.map((dept) =>
        dept.name === deptName ? { ...dept, [field]: value } : dept
      )
    );
  };

  const allFieldsFilled = () => {
    const yearValid =
      /^(first_years|second_years|third_years|fourth_years)$/.test(
        selectedYear
      );

    const isDroppedValid = (dropArray) =>
      dropArray.every((student) =>
        /^(LJEC|JEC)\d{2}[A-Z]{2}\d{3}$/.test(student)
      );

    const isRejoinedValid = (rejoinArray) =>
      rejoinArray.every((student) =>
        /^(LJEC|JEC)\d{2}[A-Z]{2}\d{3}$/.test(student)
      );

    return (
      yearValid &&
      depts.length > 0 &&
      depts.every(
        (dept) =>
          dept.initialValues.length > 0 &&
          dept.reg &&
          dept.let &&
          isDroppedValid(dept.drop) &&
          isRejoinedValid(dept.rejoin)
      )
    );
  };

  const submitForm = async () => {
    try {
      await batchesForm(depts);
      localStorage.removeItem("depts");
      localStorage.removeItem("selectedYear");

      setDepts([]);
      setSelectedYear(null);
      form.resetFields();

      setTimeout(() => navigate("/batches"), 600);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const storedDepts = localStorage.getItem("depts");
    const storedYear = localStorage.getItem("selectedYear");

    if (storedDepts) {
      setDepts(JSON.parse(storedDepts));
    }

    if (storedYear) {
      setSelectedYear(storedYear);
      form.setFieldsValue({ Year: storedYear });
    }
  }, [form]);

  useEffect(() => {
    if (hasLoaded.current) {
      localStorage.setItem("depts", JSON.stringify(depts));
      localStorage.setItem("selectedYear", selectedYear);
    } else {
      hasLoaded.current = true;
    }
  }, [depts, selectedYear]);

  return (
    <>
      <Form
        className="batches-form"
        form={form}
        layout="vertical"
        name="basic"
        style={{ maxWidth: "100%" }}
        autoComplete="on"
      >
        {" "}
        <h3>Select Year</h3>
        <Form.Item
          name="Year"
          initialValue={selectedYear}
          rules={[
            { required: true, message: "Please select the year !" },
            {
              pattern: /^(first_years|second_years|third_years|fourth_years)$/,
              message: "Please select the year !",
            },
          ]}
        >
          <Select
            style={{ width: "25%" }}
            placeholder="Select Year"
            onChange={handleYearChange}
            options={[
              { value: "first_years", label: "First Year" },
              { value: "second_years", label: "Second Year" },
              { value: "third_years", label: "Third Year" },
              { value: "fourth_years", label: "Fourth Year" },
            ]}
          />
        </Form.Item>
        {selectedYear &&
          depts.map((dept, i) => (
            <div key={i}>
              <h3>{dept.name}</h3>
              <Form.Item
                name={dept.name}
                initialValue={dept.initialValues}
                rules={[
                  {
                    required: true,
                    message: `Please add exams for ${dept.name}`,
                  },
                ]}
              >
                <Select
                  mode="tags"
                  style={{ width: "90%" }}
                  placeholder={`Add Exams for ${dept.name}`}
                  onChange={(value) =>
                    handleFieldChange("initialValues", value, dept.name)
                  }
                  options={dept.options.map((exam) => ({
                    value: exam,
                    label: exam,
                  }))}
                />
              </Form.Item>

              <FlexContainer>
                <Form.Item
                  label="Regular Strength"
                  name={`reg${dept.name}`}
                  initialValue={dept.reg}
                  // initialValue={dept.reg || 20}
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
                    style={{ width: "200px", marginRight: "40px" }}
                    value={dept.reg}
                    // value={dept.reg || 20}
                    onChange={(value) =>
                      handleFieldChange("reg", value, dept.name)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="LET Strength"
                  name={`let${dept.name}`}
                  initialValue={dept.let}
                  // initialValue={dept.let || 20}
                  rules={[
                    { required: true, message: "Please enter LET Strength" },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    max={40}
                    placeholder="LET Strength"
                    style={{ width: "200px", marginRight: "40px" }}
                    value={dept.let}
                    // value={dept.let || 20}
                    onChange={(value) =>
                      handleFieldChange("let", value, dept.name)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Dropped Students"
                  name={`drop${dept.name}`}
                  initialValue={dept.drop}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          value.every((student) =>
                            /^(LJEC|JEC)\d{2}[A-Z]{2}\d{3}$/.test(student)
                          )
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Please enter valid Register NO!")
                        );
                      },
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Dropped Students"
                    style={{ width: "400px", marginRight: "40px" }}
                    onChange={(value) =>
                      handleFieldChange("drop", value, dept.name)
                    }
                    options={[]}
                  />
                </Form.Item>

                <Form.Item
                  label="Rejoined Students"
                  name={`rejoin${dept.name}`}
                  initialValue={dept.rejoin}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          value.every((student) =>
                            /^(LJEC|JEC)\d{2}[A-Z]{2}\d{3}$/.test(student)
                          )
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Please enter valid Register NO !")
                        );
                      },
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Rejoined Students"
                    style={{ width: "400px", marginRight: "40px" }}
                    onChange={(value) =>
                      handleFieldChange("rejoin", value, dept.name)
                    }
                    options={[]}
                  />
                </Form.Item>
              </FlexContainer>
            </div>
          ))}
        <Form.Item>
          <Popconfirm
            onConfirm={allFieldsFilled() ? submitForm : null}
            // onConfirm={!allFieldsFilled() ? submitForm : null}
            title="Current year exams data will be overwritten!"
            description="Are you sure you want to submit?"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              type="primary"
              htmlType="submit"
              disabled={allFieldsFilled()}
            >
              Submit
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    </>
  );
};

export default BatchesForm;
