import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (id) => {
    if (!id) return set({ currentUser: null, isLoading: false });
    try {
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        set({ currentUser: userDoc.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user data:", err.message);
    }
  },
  resetUserInfo: () => set({ currentUser: null, isLoading: false }),
}));
