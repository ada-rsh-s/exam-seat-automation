import { PlusCircleOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
import ExamHallTable from "../../components/ExamHallTable";
import "../../styles/Table.css";

const ExamHalls = () => {
  const navigate = useNavigate();

  const handleFloatButtonClick = () => {
    navigate("/addform?destination=examhallform");
  };

  return (
        <div className="heightcontainer">

      <ExamHallTable />

      <FloatButton
        style={{
          width: "43px",
          height: "43px",
        }}
        tooltip={<div>Add</div>}
        icon={
          <PlusCircleOutlined
            style={{marginLeft:"-3.2px",marginTop:"0.5px", fontSize: "25px" }} 
          />
        }
        onClick={handleFloatButtonClick}
      />
    </div>
  );
};

export default ExamHalls;
