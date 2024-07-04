import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import {
  IconVideo,
  IconInfoCircle,
  IconPhone,
  IconMoodHappyFilled,
  IconPhotoScan,
  IconCamera,
  IconMicrophone,
  IconPhotoX,
  IconFileFilled,
  IconX,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { db, storage } from "../../lib/firebase";
import {
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore";
import { Toaster, toast } from "sonner";
import { saveAs } from "file-saver";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [popupMedia, setPopupMedia] = useState(null);
  const emojiPickerRef = useRef(null);
  const {
    chatId,
    user,
    setChat,
    setChatStore,
    isCurrentUserBlocked,
    isReceiverBlocked,
  } = useChatStore();
  const { currentUser } = useUserStore();
  const notificationSoundRef = useRef(new Audio("./whatsapp_web.mp3"));

  const handleEmoji = (event) => {
    setMessage((prev) => prev + event.emoji);
  };

  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const endsWith = useRef(null);

  useEffect(() => {
    endsWith.current.scrollIntoView({ behavior: "smooth" });
    setChat(true);
  }, [chats?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChats(res.data());
      setChatStore(res.data().messages);
    });

    const resetUnreadCount = async () => {
      const userChatRef = doc(db, "userschats", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatRef);
      if (userChatsSnapshot.exists()) {
        const userChats = userChatsSnapshot.data();
        const chatIndex = userChats.chats.findIndex(
          (chat) => chat.chatId === chatId
        );

        if (chatIndex !== -1) {
          userChats.chats[chatIndex].unreadCount = 0;
          userChats.chats[chatIndex].isSeen = true;

          await updateDoc(userChatRef, {
            chats: userChats.chats,
          });

          const receiverChatRef = doc(db, "userschats", user.id);
          const receiverChatsSnapshot = await getDoc(receiverChatRef);
          if (receiverChatsSnapshot.exists()) {
            const receiverChats = receiverChatsSnapshot.data();
            const receiverChatIndex = receiverChats.chats.findIndex(
              (chat) => chat.chatId === chatId
            );

            if (receiverChatIndex !== -1) {
              receiverChats.chats[receiverChatIndex].isSeen = true;

              await updateDoc(receiverChatRef, {
                chats: receiverChats.chats,
              });
            }
          }
        }
      }
    };

    resetUnreadCount();

    return () => unSub();
  }, [chatId, currentUser.id, user?.id]);

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `chatFiles/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (message === "" && !file) return;

    let fileUrl = null;
    if (file) {
      fileUrl = URL.createObjectURL(file); // Optimistically show the image
    }

    const newMessage = {
      senderId: currentUser.id,
      message,
      file: fileUrl ? { url: fileUrl, type: file.type, name: file.name } : null,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update the chat for the sender
    setChats((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), newMessage],
    }));

    setMessage("");
    setFile(null);

    try {
      setLoading(true); // Start loading indicator
      if (file) {
        fileUrl = await uploadFile(file);
        toast.success("File uploaded successfully!");
      }

      // Update the message with the actual file URL
      newMessage.file = fileUrl
        ? { url: fileUrl, type: file.type, name: file.name }
        : null;

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(newMessage),
      });

      const userIds = [currentUser.id, user.id];

      for (const userId of userIds) {
        const userChatRef = doc(db, "userschats", userId);
        const userChatsSnapshot = await getDoc(userChatRef);
        if (userChatsSnapshot.exists()) {
          const userChats = userChatsSnapshot.data();
          const chatIndex = userChats.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChats.chats[chatIndex].lastMessage = message || "File";
            userChats.chats[chatIndex].isSeen = userId === currentUser.id;
            userChats.chats[chatIndex].updatedAt = new Date().toISOString();

            if (userId !== currentUser.id) {
              userChats.chats[chatIndex].unreadCount =
                (userChats.chats[chatIndex].unreadCount || 0) + 1;
            } else {
              userChats.chats[chatIndex].unreadCount = 0;
            }

            await updateDoc(userChatRef, {
              chats: userChats.chats,
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleFile = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const cancelFile = () => {
    setFile(null);
  };

  const handleMediaClick = (media) => {
    setPopupMedia(media);
  };

  const handleClosePopup = () => {
    setPopupMedia(null);
  };
  const handleDelete = async (file) => {
    try {
      const storageRef = ref(storage, file.url);

      // Delete the file from Firebase Storage
      await deleteObject(storageRef);
      const updatedMessages = chats.messages.filter(
        (msg) => !(msg.file && msg.file.url === file.url)
      );

      await updateDoc(doc(db, "chats", chatId), {
        messages: updatedMessages,
      });

      // Optimistically update the local state
      setChats((prevChats) => ({
        ...prevChats,
        messages: updatedMessages,
      }));

      toast.success("File deleted successfully!");

      handleClosePopup();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again later.");
    }
  };

  const renderMedia = (message) => {
    if (message.file) {
      if (message.file.type.startsWith("image/")) {
        return (
          <div className="media" onClick={() => handleMediaClick(message.file)}>
            <img src={message.file.url} alt="Image" />
          </div>
        );
      } else if (message.file.type.startsWith("audio/")) {
        return (
          <div className="media flex">
            <audio controls>
              <source src={message.file.url} type={message.file.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      } else if (message.file.type.startsWith("video/")) {
        return (
          <div className="media" onClick={() => handleMediaClick(message.file)}>
            <video controls>
              <source src={message.file.url} type={message.file.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      } else if (message.file.type === "application/pdf") {
        return (
          <div className="media flex items-center relative">
            <div className="media-icon">
              <IconFileFilled />
            </div>
            <div className="media-text">
              <a
                href={message.file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{message.file.name}</span>
              </a>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="userInfo">
          <img src={user?.imageUrl || "./avatar.png"} alt="" />
          <div className="text">
            <span>{user?.username}</span>
            <p>{user?.firstName || user?.fullName}</p>
          </div>
        </div>
        <div className="icons">
          {/* <IconPhone />
          <IconVideo /> */}
          <IconInfoCircle />
        </div>
      </div>
      <div className="center">
        {!chats ? (
          <>
            <Skeleton
              count={1}
              height="60px"
              width="80%"
              className="messages s-right"
              baseColor="#00000026"
              highlightColor="rgba(0, 0, 0, 0.537)"
            />
            <Skeleton
              count={1}
              height="60px"
              width="80%"
              className="messages s-left"
              baseColor="#00000026"
              highlightColor="rgba(0, 0, 0, 0.537)"
            />
            <Skeleton
              count={1}
              height="60px"
              width="80%"
              className="messages s-right"
              baseColor="#00000026"
              highlightColor="rgba(0, 0, 0, 0.537)"
            />
            <Skeleton
              count={1}
              height="60px"
              width="80%"
              className="messages s-left"
              baseColor="#00000026"
              highlightColor="rgba(0, 0, 0, 0.537)"
            />
          </>
        ) : (
          chats.messages.map((chat, index) => (
            <div
              className={`messages ${
                chat.senderId === currentUser.id ? "own" : ""
              } relative`}
              key={chat.createdAt}
            >
              {chat.senderId !== currentUser.id && (
                <img src={user?.imageUrl || "./avatar.png"} alt="" />
              )}
              <div className="texts">
                {renderMedia(chat)}
                <p>{chat?.message}</p>
                <span className="absolute">
                  {new Date(chat.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {/* {chat.senderId === currentUser.id && (
                  <IconTrash
                    onClick={() => handleDelete(chat)}
                    className="delete-btn absolute -top-1 -right-1  p-1.5 cursor-pointer"
                  />
                )} */}
              </div>
            </div>
          ))
        )}
        <div ref={endsWith}></div>
      </div>
      <div className="bottom relative">
        {file && (
          <div
            className={`file-preview flex  absolute top-0 max-w-80 ${
              file.type.startsWith("image/") ? "items-start" : "items-center"
            }`}
          >
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Selected"
                className="max-w-28 h-24 mr-2"
              />
            ) : file.type.startsWith("audio/") ? (
              <IconMicrophone className="mr-2" />
            ) : file.type.startsWith("video/") ? (
              <IconCamera className="mr-2" />
            ) : file.type === "application/pdf" ? (
              <IconFileFilled className="mr-2" />
            ) : (
              <IconFileFilled className="mr-2" />
            )}
            <span className="text-sm">{file.name}</span>

            <div
              className="cancel ml-2 bg-zinc-500 rounded-lg p-0.5"
              onClick={cancelFile}
            >
              <IconX width={15} height={15} />
            </div>
          </div>
        )}
        <form className="flex items-center w-full gap-3">
          <div className="icons">
            <label htmlFor="file">
              <IconPhotoScan style={{ cursor: "pointer" }} />
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              accept="image/*, audio/*, video/*, application/pdf"
              onChange={handleFile}
              disabled={isReceiverBlocked || isCurrentUserBlocked}
            />
          </div>
          <input
            type="text"
            className={`${isCurrentUserBlocked && "cursor-not-allowed"}`}
            placeholder={`${
              isCurrentUserBlocked ? "You are blocked!" : "Type a message"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isReceiverBlocked || isCurrentUserBlocked}
          />
          <div className="emoji">
            <IconMoodHappyFilled
              onClick={() => setOpen((prev) => !prev)}
              className="emojipick"
            />
            <div className="picker" ref={emojiPickerRef}>
              <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
          <button
            className={`sendBtn ${
              isCurrentUserBlocked && "cursor-not-allowed"
            }`}
            onClick={handleSend}
            type="submit"
            disabled={isReceiverBlocked || isCurrentUserBlocked}
          >
            Send
          </button>
        </form>
      </div>
      {popupMedia && (
        <div className="popup-media" onClick={handleClosePopup}>
          <a className="absolute top-2 right-5" href={popupMedia.url} download>
            <IconDownload />
          </a>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            {popupMedia.type.startsWith("image/") && (
              <img src={popupMedia.url} alt="Popup Media" />
            )}
            {popupMedia.type.startsWith("video/") && (
              <video controls>
                <source src={popupMedia.url} type={popupMedia.type} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div
            className="absolute top-2 right-16 cursor-pointer"
            onClick={() => handleDelete(popupMedia)}
          >
            <IconTrash />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
