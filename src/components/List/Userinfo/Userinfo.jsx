import React from "react";
import { IconEdit, IconUserCircle, IconDots } from "@tabler/icons-react";
import "./Userinfo.css";
const Userinfo = () => {
  return (
    <div className="userinfo">
      <div className="userIcons">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <h3>John doe</h3>
        </div>
      </div>
      <div className="icons">
        <IconEdit size={30} strokeWidth={1} />
        <IconDots size={30} strokeWidth={1} />
      </div>
    </div>
  );
};

export default Userinfo;
