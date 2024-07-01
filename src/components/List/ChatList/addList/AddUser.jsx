import React, { useState, useEffect } from "react";
import "./AddUser.css";
import { IconSearch } from "@tabler/icons-react";
import ReactLoading from "react-loading"; // Import ReactLoading
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../store/userStore";
import { useChatStore } from "../../../store/chatStore";

const AddUser = () => {
  const [users, setUsers] = useState(null);
  const [addedUsers, setAddedUsers] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const { currentUser } = useUserStore();
  const { resetUser } = useChatStore();

  useEffect(() => {
    const fetchAddedUsers = async () => {
      try {
        const userChatRef = doc(db, "userschats", currentUser.id);
        const userChatDoc = await getDoc(userChatRef);
        if (userChatDoc.exists()) {
          const userChats = userChatDoc.data().chats || [];
          setAddedUsers(userChats.map((chat) => chat.reciverId));
        }
      } catch (err) {
        console.error("Error fetching added users:", err);
      }
    };

    fetchAddedUsers();
  }, [currentUser.id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim().toLowerCase();

    try {
      const userRef = collection(db, "users");
      const q = query(
        userRef,
        where("username", ">=", username),
        where("username", "<", username + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsers(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleAdd = async (user) => {
    setLoadingUserId(user.id); // Set loading state
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userschats");

    try {
      // Check if a chat between the two users already exists
      const currentUserChatDoc = await getDoc(doc(userChatRef, currentUser.id));
      const userChatDoc = await getDoc(doc(userChatRef, user.id));
      let existingChatId = null;

      if (currentUserChatDoc.exists()) {
        const currentUserChats = currentUserChatDoc.data().chats || [];
        const existingChat = currentUserChats.find(
          (chat) => chat.reciverId === user.id
        );
        if (existingChat) {
          existingChatId = existingChat.chatId;
        }
      }

      if (userChatDoc.exists()) {
        const userChats = userChatDoc.data().chats || [];
        const existingChat = userChats.find(
          (chat) => chat.reciverId === currentUser.id
        );
        if (existingChat) {
          existingChatId = existingChat.chatId;
        }
      }

      if (!existingChatId) {
        // Create a new chat if no existing chat is found
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });
        existingChatId = newChatRef.id;
      }

      // Update the user chats with the chat ID, create document if not exists
      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: existingChatId,
          lastMessage: "",
          reciverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      }).catch(async (error) => {
        if (error.code === "not-found") {
          await setDoc(doc(userChatRef, user.id), {
            chats: [
              {
                chatId: existingChatId,
                lastMessage: "",
                reciverId: currentUser.id,
                updatedAt: Date.now(),
              },
            ],
          });
        } else {
          throw error;
        }
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: existingChatId,
          lastMessage: "",
          reciverId: user.id,
          updatedAt: Date.now(),
        }),
      }).catch(async (error) => {
        if (error.code === "not-found") {
          await setDoc(doc(userChatRef, currentUser.id), {
            chats: [
              {
                chatId: existingChatId,
                lastMessage: "",
                reciverId: user.id,
                updatedAt: Date.now(),
              },
            ],
          });
        } else {
          throw error;
        }
      });

      setAddedUsers((prev) => [...prev, user.id]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUserId(null);
      // resetUser();
    }
  };

  const handleRemove = async (user) => {
    setLoadingUserId(user.id); // Set loading state
    const userChatRef = collection(db, "userschats");
    const chatRef = collection(db, "chats");

    try {
      // Fetch the user's current chats
      const userChatDoc = await getDoc(doc(userChatRef, user.id));
      const currentUserChatDoc = await getDoc(doc(userChatRef, currentUser.id));

      if (userChatDoc.exists() && currentUserChatDoc.exists()) {
        const userChats = userChatDoc.data().chats || [];
        const currentUserChats = currentUserChatDoc.data().chats || [];

        const userChat = userChats.find(
          (chat) => chat.reciverId === currentUser.id
        );
        const currentUserChat = currentUserChats.find(
          (chat) => chat.reciverId === user.id
        );

        // Remove chat object from both users' chat lists
        if (userChat) {
          const updatedUserChats = userChats.filter(
            (chat) => chat.reciverId !== currentUser.id
          );
          await updateDoc(doc(userChatRef, user.id), {
            chats: updatedUserChats,
          });
        }
        if (currentUserChat) {
          const updatedCurrentUserChats = currentUserChats.filter(
            (chat) => chat.reciverId !== user.id
          );
          await updateDoc(doc(userChatRef, currentUser.id), {
            chats: updatedCurrentUserChats,
          });
        }

        // Check if both users have been removed from the chat
        const chatIdToDelete = userChat?.chatId || currentUserChat?.chatId;
        if (chatIdToDelete) {
          const remainingChatsSnapshot = await getDocs(
            query(
              collection(db, "userschats"),
              where("chats", "array-contains", {
                chatId: chatIdToDelete,
              })
            )
          );

          // If no users reference this chat anymore, delete the chat document
          if (remainingChatsSnapshot.empty) {
            await deleteDoc(doc(chatRef, chatIdToDelete));
          }
        }

        // Do not delete the userschats documents, just update them
        setAddedUsers((prev) => prev.filter((id) => id !== user.id));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUserId(null);
      resetUser();
    }
  };

  return (
    <div className="addUserContainer">
      <form onSubmit={handleSearch}>
        <div className="searchContainer">
          <IconSearch />
          <input type="search" placeholder="username" name="username" />
        </div>
        <button className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-6 bg-[#0070f3] rounded-xl text-white font-light transition duration-200 ease-linear">
          Search
        </button>
      </form>
      <div className="mainAddContainer">
        {users &&
          users.map((user) => (
            <div className="usersContainer" key={user.id}>
              <div className="details">
                <img src={user.imageUrl} alt="" />
                <span>{user.username}</span>
              </div>
              {loadingUserId === user.id ? (
                <button className="px-8 py-2.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200">
                  <ReactLoading
                    type="bubbles"
                    color="#FFFFFF"
                    height={20}
                    width={35}
                    className="loader"
                  />
                </button>
              ) : addedUsers.includes(user.id) ? (
                <button
                  onClick={() => handleRemove(user)}
                  className="px-4 py-2 rounded-xl border border-neutral-600 text-black bg-white hover:bg-gray-100 transition duration-200"
                >
                  Remove
                </button>
              ) : user.id === currentUser.id ? (
                <button
                  disabled
                  className="px-8 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200 cursor-not-allowed"
                >
                  You
                </button>
              ) : (
                <button
                  onClick={() => handleAdd(user)}
                  className="px-8 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200"
                >
                  Add
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AddUser;
