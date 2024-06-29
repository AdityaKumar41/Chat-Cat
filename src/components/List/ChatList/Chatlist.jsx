import React, { useEffect, useState } from "react";
import { IconSearch, IconPlus, IconMinus } from "@tabler/icons-react";
import "./Chatlist.css";
import AddUser from "./addList/AddUser";
import { useUserStore } from "../../store/userStore";
import { db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
const Chatlist = () => {
  const [addMode, setAddmode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userschats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promisses = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.reciverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promisses);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );
    return () => unsub();
  }, [currentUser.id]);
  return (
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
      {chats?.map((chat) => (
        <div className="items" key={chat.chatId}>
          <img src={chat.user.imageUrl} alt="" />
          <div className="itemsInfo">
            <span>{chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
