import React from "react";
import "./Login.css";
import { SignInButton } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="bgimage">
      <div>
        <img src="./Chatcat.png" width={100} height={5} alt="" />
      </div>
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold">Welcome to Chat cat</h1>
        <p>Your ultimate chatting experience</p>
      </div>
      <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-7 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          <SignInButton />
        </span>
      </button>
    </div>
  );
};

export default Login;
