import React from "react";
import "./Details.css";
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import { SignOutButton } from "@clerk/clerk-react";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const Details = () => {
  const { user, isReceiverBlocked, isCurrentUserBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blockedUsers: isReceiverBlocked
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });

      changeBlock();
    } catch (error) {
      console.error("Error updating block status:", error);
    }
  };

  return (
    <div className="details">
      <div className="user">
        <img src={user?.imageUrl || "/avatar.png"} alt="" />
        <div className="text">
          <h2>{user?.username}</h2>
          <p>{`${user?.firstName || user?.fullName} ${
            user?.lastName || ""
          }`}</p>
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
            <span>Privacy & Help</span>
            <div className="mainImg">
              <IconCaretUpFilled className="img" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
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
          <button className="btn blockBtn" onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "Unblock"
              : isReceiverBlocked
              ? "You are blocked!"
              : "Block"}
          </button>
          <SignOutButton className="btn logoutBtn" />
        </div>
      </div>
    </div>
  );
};

export default Details;
