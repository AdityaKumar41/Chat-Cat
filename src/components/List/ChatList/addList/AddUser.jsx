import React, { useState, useEffect } from "react";
import "./AddUser.css";
import { IconSearch } from "@tabler/icons-react";
import ReactLoading from "react-loading"; // Import ReactLoading
import {
  arrayRemove,
  arrayUnion,
  collection,
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

const AddUser = () => {
  const [users, setUsers] = useState(null);
  const [addedUsers, setAddedUsers] = useState([]);
  const [loadingUserId, setLoadingUserId] = useState(null); // State to track loading
  const { currentUser } = useUserStore();

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
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          reciverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          reciverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      setAddedUsers((prev) => [...prev, user.id]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUserId(null); // Reset loading state
    }
  };

  const handleRemove = async (user) => {
    setLoadingUserId(user.id); // Set loading state
    const userChatRef = collection(db, "userschats");
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
          await updateDoc(doc(userChatRef, user.id), {
            chats: arrayRemove(userChat),
          });
        }
        if (currentUserChat) {
          await updateDoc(doc(userChatRef, currentUser.id), {
            chats: arrayRemove(currentUserChat),
          });
        }

        setAddedUsers((prev) => prev.filter((id) => id !== user.id));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUserId(null); 
    }
  };

  return (
    <div className="addUserContainer">
      <form onSubmit={handleSearch}>
        <div className="searchContainer">
          <IconSearch />
          <input
            type="search"
            placeholder="username"
            name="username"
            required
          />
        </div>
        <button type="submit">Search</button>
      </form>
      {users &&
        users.map((user) => (
          <div className="usersContainer" key={user.id}>
            <div className="details">
              <img src={user.imageUrl} alt="" />
              <span>{user.username}</span>
            </div>
            {loadingUserId === user.id ? (
              <button>
                <ReactLoading
                  type="bubbles"
                  color="#FFFFFF"
                  height={20}
                  width={35}
                  className="loader"
                />
              </button>
            ) : addedUsers.includes(user.id) ? (
              <button onClick={() => handleRemove(user)}>Remove</button>
            ) : (
              <button onClick={() => handleAdd(user)}>Add</button>
            )}
          </div>
        ))}
    </div>
  );
};

export default AddUser;
