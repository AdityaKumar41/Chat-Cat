import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUserStore } from "./userStore";
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserblocked: false,
  isReciverBlocked: false,
  selectedChat: false,
  setChat: (value) => set({ selectedChat: value }),
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;
    // Check if the current user is blocked
    if (user.blockedUsers.includes(currentUser.id)) {
      return set({
        chatId: null,
        user: null,
        isCurrentUserblocked: true,
        isReciverBlocked: false,
      });
    }

    // Check if the receiver is blocked
    else if (currentUser.blockedUsers.includes(user.id)) {
      return set({
        chatId: null,
        user: null,
        isCurrentUserblocked: false,
        isReciverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserblocked: false,
        isReciverBlocked: false,
      });
    }
  },
  // chnage block status
  changeBlock: () => {
    set((state) => ({
      ...state,
      isReciverBlocked: !state.isReciverBlocked,
    }));
  },
  resetUser: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserblocked: false,
      isReciverBlocked: false,
    });
  },
}));
