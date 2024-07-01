import React from "react";
import { IconEdit, IconUserCircle, IconDots } from "@tabler/icons-react";
import "./Userinfo.css";
import { UserButton } from "@clerk/clerk-react";
import { useUserStore } from "../../store/userStore";
const Userinfo = () => {
  const { currentUser } = useUserStore();
  return (
    <div className="userinfo">
      <div className="userIcons">
        <div className="user">
          <UserButton className={"userButton"} />
          <h3>{currentUser?.username}</h3>
        </div>
      </div>
      <div className="icons">
        <IconDots size={30} strokeWidth={1} />
      </div>
    </div>
  );
};

export default Userinfo;
