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
} from "@tabler/icons-react";
import EmojiPicker from "emoji-picker-react";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const emojiPickerRef = useRef(null);
  // Handle emoji click
  const handleEmoji = (event) => {
    setMessage((prev) => prev + event.emoji);
  };
  // Close emoji picker when clicked outside
  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  };

  // Add event listener when component mounts
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to the end of the chat
  const endsWith = useRef(null);

  useEffect(() => {
    endsWith.current.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(()=>{
    
  })
  return (
    <div className="chat">
      <div className="top">
        <div className="userInfo">
          <img src="/avatar.png" alt="" />
          <div className="text">
            <span>John Doe</span>
            <p>Lorem, ipsum dolorasd.</p>
          </div>
        </div>
        <div className="icons">
          <IconPhone />
          <IconVideo />
          <IconInfoCircle />
        </div>
      </div>
      <div className="center">
        <div className="messages">
          <img src="/avatar.png" alt="" />
          <div className="texts">
            <p>
              quam dolorum laudantium necessitatibus, aperiam quos soluta eaque
              optio labore saepe quis similique.
            </p>
            <span>2 minutes ago</span>
          </div>
        </div>
        <div className="messages">
          <img src="/avatar.png" alt="" />
          <div className="texts">
            <p>
              uam dolorum laudantium necessitatibus, aperiam quos soluta eaque
              optio labore saepe quis similique.
            </p>
            <span>2 minutes ago</span>
          </div>
        </div>
        <div className="messages own">
          <div className="texts">
            <p>Hello bhai kese ho??</p>
            <span>2 minutes ago</span>
          </div>
        </div>
        <div className="messages own">
          <div className="texts">
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odit,
              voluptas?
            </p>
            <span>2 minutes ago</span>
          </div>
        </div>
        <div className="messages own">
          <div className="texts">
            <img src="/bg.jpg" alt="" />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellat
              magnam optio sit sequi corporis quisquam sed debitis, suscipit
              itaque aliquam, hic numquam adipisci? Explicabo ex cupiditate
              quae, earum suscipit tempore?
            </p>
            <span>2 minutes ago</span>
          </div>
        </div>
        <div ref={endsWith}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <IconPhotoScan />
          <IconCamera />
          <IconMicrophone />
        </div>
        <input
          type="text"
          placeholder="Type a message.."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
        <button className="sendBtn">Send</button>
      </div>
    </div>
  );
};

export default Chat;
