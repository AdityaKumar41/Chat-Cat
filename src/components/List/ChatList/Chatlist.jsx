import React, { useState } from "react";
import { IconSearch, IconPlus, IconMinus } from "@tabler/icons-react";
import "./Chatlist.css";
const Chatlist = () => {
  const [addMode, setAddmode] = useState(false);
  return (
    <div className="chatlist">
      <div className="search">
        <div className="userSearch">
          <IconSearch />
          <input type="text" placeholder="Search" />
        </div>
        <div className="addUser" onClick={() => setAddmode((prev) => !prev)}>
          {addMode ? (
            <IconMinus strokeWidth={2} />
          ) : (
            <IconPlus strokeWidth={2} />
          )}
        </div>
      </div>
      <div className="items">
        <img src="/avatar.png" alt="" />
        <div className="itemsInfo">
          <span>John Doe</span>
          <p>Hello</p>
        </div>
      </div>
      <div className="items">
        <img src="/avatar.png" alt="" />
        <div className="itemsInfo">
          <span>John Doe</span>
          <p>Hello</p>
        </div>
      </div>
      <div className="items">
        <img src="/avatar.png" alt="" />
        <div className="itemsInfo">
          <span>John Doe</span>
          <p>Hello</p>
        </div>
      </div>
    </div>
  );
};

export default Chatlist;
