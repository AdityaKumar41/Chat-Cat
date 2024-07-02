// notificationService.js
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  let permission = Notification.permission;
  if (permission !== "denied" && permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  return permission;
};

export const showNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
