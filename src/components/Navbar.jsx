import { Space, Dropdown, ConfigProvider } from "antd";
import { useAuthStore } from "../stores";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Navbar.css";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const items = [
    {
      key: "0",
      danger: true,
      label: "Logout",
      icon: <UserOutlined />,
      onClick: () => logout(),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: "#07314a",
          colorBgContainer: "#f0f9ff",
          colorBgElevated: "#f0f9ff",
        },
      }}
    >
      <div className="navbar">
        <img className="brandLogo" srcSet="../Logo.png" alt="" />
        <h2 className="appName">AsientoMatic</h2>
        <Dropdown
          menu={{
            items,
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <p className="welcomeName">Welcome, {user?.username}</p>
              <DownOutlined className="dropdownicon" />
            </Space>
          </a>
        </Dropdown>
      </div>
    </ConfigProvider>
  );
};

export default Navbar;
