import React from "react";
import "./Login.css";
import { SignInButton } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div>
      <SignInButton />
    </div>
  );
};

export default Login;
