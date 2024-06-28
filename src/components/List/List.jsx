import React from "react";
import "./List.css";
import Userinfo from "./Userinfo/Userinfo";
import Chatlist from "./ChatList/Chatlist";

const List = () => {
  return (
    <div className="list">
      <Userinfo></Userinfo>
      <Chatlist></Chatlist>
    </div>
  );
};

export default List;
