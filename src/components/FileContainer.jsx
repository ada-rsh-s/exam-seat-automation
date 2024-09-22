import { QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Popconfirm, Progress, Upload } from "antd";
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useAppContext } from "../context/AppContext";
import FlexContainer from "./FlexContainer";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";

const FileContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { destination } = queryString.parse(location.search);

  const [workbook, setWorkbook] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(true);
  const cancelToken = useRef(true); // Ref to manage cancellation

  const { uploadSubFile, uploadExamhallFile } = useAppContext();

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      setWorkbook(workbook);
    };

    reader.readAsArrayBuffer(file);
    return false;
  };

  const updateProgress = (percent) => {
    setProgress(percent);
  };

  const handleUpload = async () => {
    try {
      if (workbook) {
        setUploading(false);
        cancelToken.current = true;
        if (destination === "subjectsform") {
          await uploadSubFile(workbook, updateProgress, cancelToken);
          setTimeout(() => navigate("/subjects"), 600);
        } else if (destination === "examhallform") {
          await uploadExamhallFile(workbook, updateProgress, cancelToken);
          setTimeout(() => navigate("/exam-halls"), 600);
        }
        setUploading(true);

        setProgress(0);
        setWorkbook(null);
        localStorage.removeItem("depts");
        localStorage.removeItem("selectedYear");
      }
    } catch (error) {
      setUploading(true);

      console.error("Error uploading file:", error);
    }
  };

  const handleCancel = () => {
    cancelToken.current = false; // Cancel the upload
  };

  return (
    <>
      <div className="file-form">
        {destination === "subjectsform" ? (
          <h3>Add Subjects</h3>
        ) : (
          <h3>Add Exam Halls</h3>
        )}
        <FlexContainer>
          <Upload
            className="upload-btn"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            accept=".xlsx, .xls"
          >
            <Button>
              {!workbook ? "Select Subject Workbook" : "Change Workbook"}
            </Button>
          </Upload>
          &nbsp;
          {destination === "subjectsform" ? (
            <>
              {!workbook ? (
                <Alert
                  message="The file should only have columns named DEPT	| SEM | SLOT | COURSE CODE | COURSE NAME |	L	| T	| P |	HOURS | CREDIT  "
                  type="info"
                />
              ) : (
                <Alert message="File Selected" type="success" />
              )}
            </>
          ) : (
            <>
              {!workbook ? (
                <Alert
                  message="The file should only have  columns named Semester | Classroom | No:of desks | Department"
                  type="info"
                />
              ) : (
                <Alert message="File Selected" type="success" />
              )}
            </>
          )}
        </FlexContainer>
        <br />
        <Popconfirm
          onConfirm={handleUpload}
          onCancel={handleCancel}
          title="All current academic data including batches will be deleted !"
          description="Are you sure you want to submit?"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
        >
          <Button disabled={!workbook}>Submit</Button>
        </Popconfirm>

        {!uploading && (
          <Progress
            percent={progress}
            percentPosition={{ align: "center", type: "outer" }}
            size={[400, 10]}
          />
        )}
      </div>
    </>
  );
};

export default FileContainer;
