import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";
import FlexContainer from "./FlexContainer";

const initialState = {
  username: "",
  email: "",
  password: "",
  isMember: true,
};      

const LoginForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [values, setValues] = useState(initialState);

  const toggleMember = () => {
    setValues({
      ...values,
      isMember: !values.isMember,
    });
  };
  const {
    user,
    isLoading,
    setupUser,
  } = useAppContext();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };


  const onFinish = () => {
    const { username, email, password, isMember } = values;

    const currentUser = { username, email, password };
    if (isMember) {
      setupUser({
        currentUser,
        endPoint: "login",
      });
    } else {
      setupUser({
        currentUser,
        endPoint: "register",
      });
    }
  };

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [user, navigate]);

  return (
    <>
      <div className="txtb">
        {values.isMember ? <h3>Login</h3> : <h3>Register</h3>}
        <Form
          form={form}
          name="horizontal_login"
          layout="horizontal"
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your Email!" }]}
            className="coloroverwrite"
          >
            <Input
              className="coloroverwrite"
              prefix={<MailOutlined />}
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="Email"
              // required
            />
          </Form.Item>

          {!values.isMember && (
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
              className="coloroverwrite"
            >
              <Input
                className="coloroverwrite"
                prefix={<UserOutlined />}
                type="text"
                name="username"
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            className="coloroverwrite"
          >
            <Input.Password
              className="coloroverwrite"
              prefix={<LockOutlined />}
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Password"
              autocomplete="new-password"
              required
            />
          </Form.Item>

          <Form.Item>
            <Button
              className="loginbutton"
              disabled={isLoading}
              type="primary"
              htmlType="submit"
            >
              {isLoading
                ? "Please Wait 🌞"
                : values.isMember
                ? "Login"
                : "Register"}
            </Button>
          </Form.Item>
{/* 
          <FlexContainer>
            {values.isMember ? "Not a member yet ? " : "Already a member ? "}
            <p onClick={toggleMember} className="member-btn">
              {values.isMember ? "Register Now!" : "Login Here"}
            </p>
          </FlexContainer> */}
        </Form>
      </div>
    </>
  );
};

export default LoginForm;
