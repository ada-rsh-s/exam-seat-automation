import queryString from "query-string";
import { useLocation } from "react-router-dom";
import ClassPrint from "../../components/ClassPrint";
import PrintDept from "../../components/PrintDept";
import PrintNotice from "../../components/PrintNotice";
import PrintAttendance from "../../components/PrintAttendance";
const PrintData = () => {
  const location = useLocation();
  const { destination } = queryString.parse(location.search);

  switch (destination) {
    case "class":
      return <ClassPrint />;
    case "dept":
      return <PrintDept />;
    case "notice":
      return <PrintNotice />;
    case "attendance":
      return <PrintAttendance />;

    default:
      throw new Error("OOPS ! The page you are looking for is not found");
  }
};

export default PrintData;
