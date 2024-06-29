import React, { useEffect } from "react";
import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import Details from "./components/Details/Details";
import Login from "./components/login/Login";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
import { useUserStore } from "./components/store/userStore";

const App = () => {
  const { user, isLoaded } = useUser();
  const { currentUser, isLoading, fetchUserInfo, resetUserInfo } =
    useUserStore();
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserInfo(user.id);
    }
    if (isLoaded && !user) {
      resetUserInfo();
    }
  }, [user, isLoaded, fetchUserInfo, resetUserInfo]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <div className="container">
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <Toaster />
        <List></List>
        <Chat></Chat>
        <Details></Details>
      </SignedIn>
    </div>
  );
};

export default App;
