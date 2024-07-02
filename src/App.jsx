import React, { useEffect, useRef } from "react";
import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import Details from "./components/Details/Details";
import Login from "./components/login/Login";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { useUserStore } from "./components/store/userStore";
import { useChatStore } from "./components/store/chatStore";
import Empty from "./components/Empty/Empty";
import LoadingBar from "react-top-loading-bar";

const App = () => {
  // Prevent the context menu from appearing
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const { user, isLoaded } = useUser();
  const { currentUser, isLoading, fetchUserInfo, resetUserInfo } =
    useUserStore();
  const { chatId } = useChatStore();
  const loadingBarRef = useRef(null);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        loadingBarRef.current.continuousStart();
        fetchUserInfo(user.id).then(() => {
          loadingBarRef.current.complete();
        });
      } else {
        resetUserInfo();
        loadingBarRef.current.complete();
      }
    }
  }, [user, isLoaded, fetchUserInfo, resetUserInfo]);

  if (isLoading) {
    return (
      <div className="relative top-0">
        <LoadingBar color="#2998ff" ref={loadingBarRef} />
      </div>
    );
  }

  return (
    <>
      <LoadingBar color="#2998ff" ref={loadingBarRef} />
      <div className="container">
        <SignedOut>
          <Login />
        </SignedOut>
        <SignedIn>
          <Toaster />
          <List />
          {chatId ? <Chat /> : <Empty />}
          {chatId && <Details />}
        </SignedIn>
      </div>
    </>
  );
};

export default App;
