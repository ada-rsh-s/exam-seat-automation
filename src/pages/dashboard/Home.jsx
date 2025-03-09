import { Alert, Spin } from "antd";
import DepartmentTable from "../../components/DepartmentTable";
import NoticeTable from "../../components/NoticeTable";
import TodayExam from "../../components/TodayExam";
import { useAppContext } from "../../context/AppContext";
import "../../styles/home.css";

function Home() {
  const { deptView, isLoading } = useAppContext();
   
  return (
    <div className="heightcontainer">
      <div className="tdye">
        <TodayExam />
        <Spin
          fullscreen={true}
          tip="Allocating students for current slot..Please Wait !"
          spinning={isLoading}
        />
        {Object.keys(deptView).length === 0 ? (
          <>
            <Alert
              style={{ width: "50%", margin: "0 auto", marginTop: "20px" }}
              type="info"
              message="No slots selected !"
              description="Select any slot to view the details"
            />
          </>
        ) : (
          <>
            <NoticeTable />
            <DepartmentTable />
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
