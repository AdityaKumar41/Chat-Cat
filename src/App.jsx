import React from "react";
import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import Details from "./components/Details/Details";

const App = () => {
  return (
    <div className="container">
      <List></List>
      <Chat></Chat>
      <Details></Details>
    </div>
  );
};

export default App;
