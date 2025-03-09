import { PlusCircleOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
import SubjectsTable from "../../components/SubjectsTable";
import "../../styles/Table.css";

const Subjects = () => {
  const navigate = useNavigate();

  const handleFloatButtonClick = () => {
    navigate("/addform?destination=subjectsform");
  };

  return (
    <div className="heightcontainer">
      <SubjectsTable />

      <FloatButton
        style={{
          width: "43px",
          height: "43px",
        }}
        tooltip={<div>Add</div>}
        icon={
          <PlusCircleOutlined
            style={{
              marginLeft: "-3.2px",
              marginTop: "0.5px",
              fontSize: "25px",
            }}
          />
        }
        onClick={handleFloatButtonClick}
      />
    </div>
  );
};

export default Subjects;
