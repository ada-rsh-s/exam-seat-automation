import { TeamOutlined } from "@ant-design/icons";
import "../../styles/Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-container">
      <p className="footer-text">AsientoMatic © 2025</p>
      <Link to="/developer-credits" className="footer-link">
        <TeamOutlined />
        Meet the Developers
      </Link>
    </footer>
  );
};

export default Footer;
