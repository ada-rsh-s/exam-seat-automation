import { useMemo, useCallback } from "react";
import { Segmented } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navtab.css";

const pathToTab = {
  "/": "Home",
  "/slots": "Slots",
  "/batches": "Batches",
  "/subjects": "Subjects",
  "/exam-halls": "Exam Halls",
};

const tabToPath = {
  "Home": "/",
  "Slots": "/slots",
  "Batches": "/batches",
  "Subjects": "/subjects",
  "Exam Halls": "/exam-halls",
};

const NavigationTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current tab based on pathname
  const currentTab = useMemo(() => {
    return pathToTab[location.pathname] || "Home";
  }, [location.pathname]);

  // Handle tab change - navigate to new route
  const handleChange = useCallback((value) => {
    const path = tabToPath[value];
    if (path && path !== location.pathname) {
      navigate(path);
    }
  }, [navigate, location.pathname]);

  return (
    <center>
      <Segmented
        className="navigationTab"
        value={currentTab}
        options={["Home", "Slots", "Batches", "Subjects", "Exam Halls"]}
        onChange={handleChange}
      />
    </center>
  );
};

export default NavigationTab;
