import React from "react";
import "./Details.css";
import {
  IconArrowUp,
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import { SignOutButton } from "@clerk/clerk-react";
const Details = () => {
  return (
    <div className="details">
      <div className="user">
        <img src="/avatar.png" alt="" />
        <div className="text">
          <h2>John doe</h2>
          <p>Lorem, ipsum dolorasd.</p>
        </div>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <div className="mainImg">
              <IconCaretUpFilled className="img" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privicy & Help</span>
            <div className="mainImg">
              <IconCaretUpFilled className="img" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photo</span>
            <div className="mainImg">
              <IconCaretDownFilled className="img" />
            </div>
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="/bg.jpg" alt="" />
                <span>photo2.png</span>
              </div>
              <div className="mainImg">
                <IconDownload className="img" />
              </div>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="/bg-image.jpg" alt="" />
                <span>photo3.png</span>
              </div>
              <div className="mainImg">
                <IconDownload className="img" />
              </div>
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="/bgeffect2.jpg" alt="" />
                <span>photo4.png</span>
              </div>
              <div className="mainImg">
                <IconDownload className="img" />
              </div>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Share File</span>
            <div className="mainImg">
              <IconShare className="img" />
            </div>
          </div>
          <button className="btn blockBtn">Block User!</button>
          <SignOutButton className="btn logoutBtn" />
        </div>
      </div>
    </div>
  );
};

export default Details;
