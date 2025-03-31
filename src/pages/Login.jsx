import LoginForm from "../components/LoginForm";
import LoginVector from "../components/LoginVector";
import "../styles/Login.css";
import Footer from "./dashboard/Footer";

const Login = () => {
  return (
    <>
      <LoginVector />
      <div className="login">
        <div className="loginVector">
          <img srcSet="../loginVector.png" alt="" />
          <p>Organize exams with ease!</p>
        </div>
        <div className="loginDivider"></div>
        <LoginForm />
      </div>
      
      <Footer />
    </>
  );
};

export default Login;
