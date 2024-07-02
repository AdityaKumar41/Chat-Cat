import React, { useEffect, useState } from "react";
import "./Details.css";
import {
  IconCaretDownFilled,
  IconDownload,
  IconFileFilled,
  IconFileTypePdf,
  IconHeadphonesFilled,
  IconShare,
  IconVideo,
} from "@tabler/icons-react";
import { SignOutButton } from "@clerk/clerk-react";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const Details = () => {
  const {
    user,
    isReceiverBlocked,
    isCurrentUserBlocked,
    changeBlock,
    chatStore,
    setUser,
  } = useChatStore();
  const { currentUser } = useUserStore();
  const [mediaFiles, setMediaFiles] = useState([]);

  
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

  useEffect(() => {
    if (chatStore) {
      const media = chatStore
        .filter((msg) => msg.file && msg.file.url)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMediaFiles(media);
    }
  }, [chatStore]);

  return (
    <div className="details">
      <div className="user">
        <img src={user?.imageUrl || "/avatar.png"} alt="" />
        <div className="text">
          <h2>{user?.username}</h2>
          <p>{`${user?.firstName || user?.fullName || "unknown"} ${
            user?.lastName || ""
          }`}</p>
        </div>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <div className="mainImg">
              <IconCaretDownFilled className="img" />
            </div>
          </div>
          <div className="photos">
            {isReceiverBlocked ? (
              <p>
                You cannot view shared photos as you have blocked this user.
              </p>
            ) : (
              mediaFiles.map((file, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    {file.file.type.startsWith("image") ? (
                      <img src={file.file.url} alt={file.file.name} />
                    ) : file.file.type.startsWith("audio") ? (
                      <IconHeadphonesFilled size={42} className="iconsI" />
                    ) : file.file.type.startsWith("video") ? (
                      <IconVideo size={42} className="iconsI" />
                    ) : file.file.type.startsWith("application/pdf") ? (
                      <IconFileTypePdf size={42} className="iconsI" />
                    ) : (
                      <IconFileFilled size={42} className="iconsI" />
                    )}
                    <span>{file.file.name}</span>
                  </div>
                  <div className="mainImg">
                    <a href={file.file.url} download>
                      <IconDownload className="img" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Share File</span>
            <div className="mainImg">
              <IconShare className="img" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="btn blockBtn"
              onClick={handleBlock}
              disabled={isCurrentUserBlocked}
            >
              {isCurrentUserBlocked
                ? "You are blocked!"
                : isReceiverBlocked
                ? "Unblock"
                : "Block"}
            </button>
            <SignOutButton className="btn logoutBtn" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
