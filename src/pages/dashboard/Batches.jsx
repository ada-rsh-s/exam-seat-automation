import "../../styles/Table.css";
import BatchesTable from "../../components/BatchesTable";
import { Button, FloatButton } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Batches = () => {
  const navigate = useNavigate();


  const handleFloatButtonClick = () => {
    navigate("/addform?destination=batchesform");
  };

  return (
    <div className="heightcontainer">
      <BatchesTable />

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

export default Batches;
