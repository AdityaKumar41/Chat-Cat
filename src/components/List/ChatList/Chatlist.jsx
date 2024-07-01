import React, { useEffect, useRef, useState } from "react";
import { IconSearch, IconPlus, IconMinus } from "@tabler/icons-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Chatlist.css";
import AddUser from "./addList/AddUser";
import { useUserStore } from "../../store/userStore";
import { db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../store/chatStore";
import NoUser from "../../Empty/NoUser";

const Chatlist = () => {
  const [addMode, setAddmode] = useState(false);
  const [chats, setChats] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat, chatId, selectedChat } = useChatStore();
  const addUserRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (addUserRef.current && !addUserRef.current.contains(event.target)) {
      setAddmode(false);
    }
  };

  useEffect(() => {
    if (addMode) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [addMode]);

  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChat(true);
      const unsub = onSnapshot(
        doc(db, "userschats", currentUser.id),
        async (res) => {
          const items = res.data()?.chats || [];

          const promises = items.map(async (item) => {
            const userDocRef = doc(db, "users", item.reciverId);
            const userDocSnap = await getDoc(userDocRef);

            const user = userDocSnap.data();
            return { ...item, user };
          });
          const chatData = await Promise.all(promises);
          setChats(
            chatData.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            )
          );
          setLoadingChat(false); // Set loading to false after data is fetched
        }
      );

      return () => unsub();
    };

    fetchChats();
  }, [currentUser?.id]);

  const handleSelectUser = async (chat) => {
    changeChat(chat.chatId, chat.user);

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].unreadCount = 0;
    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userschats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <div className="chatlist">
        <div className="search">
          <div className="userSearch">
            <IconSearch />
            <input type="search" placeholder="Search" />
          </div>
          <div className="addUser" onClick={() => setAddmode((prev) => !prev)}>
            {addMode ? (
              <IconMinus strokeWidth={2} />
            ) : (
              <IconPlus strokeWidth={2} />
            )}
          </div>
        </div>
        {loadingChat ? (
          <>
            <Skeleton
              count={8}
              height="60px"
              width="100%"
              baseColor="#00000026"
              highlightColor="rgba(0, 0, 0, 0.537)"
            />
          </>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              className="items"
              key={chat.chatId}
              onClick={() => handleSelectUser(chat)}
            >
              {!chat.isSeen && !selectedChat && (
                <div className="badge">{chat.unreadCount}+</div>
              )}
              <img src={chat.user.imageUrl} alt="" />
              <div className="itemsInfo">
                <span>{chat.user.username}</span>
                <p>
                  {chat.lastMessage.length > 30
                    ? `${chat.lastMessage.substring(0, 30)}...`
                    : chat.lastMessage}
                </p>
              </div>
            </div>
          ))
        ) : (
          <NoUser />
        )}

        {addMode && (
          <div ref={addUserRef}>
            <AddUser />
          </div>
        )}
      </div>
    </>
  );
};

export default Chatlist;
