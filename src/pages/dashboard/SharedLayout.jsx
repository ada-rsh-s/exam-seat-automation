import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import NavigationTab from "../../components/NavigationTab";
import Footer from "./Footer";
const Sharedlayout = () => {
  return (
    <>
      <Navbar />
      <NavigationTab />
      <Outlet />
      <Footer />
    </>
  );
};

export default Sharedlayout;
