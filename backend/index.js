const express = require("express");
const { Webhook } = require("svix");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
admin.initializeApp({
  credential: admin.credential.cert(
    require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  ),
});
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET_KEY;
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      const wh = new Webhook(webhookSecret);

      const evt = wh.verify(payloadString, {
        "svix-id": svixHeaders["svix-id"],
        "svix-timestamp": svixHeaders["svix-timestamp"],
        "svix-signature": svixHeaders["svix-signature"],
      });

      console.log("Event:", evt);

      const eventType = evt.type;

      switch (eventType) {
        case "user.created":
          const userData = {
            id: evt.data.id,
            firstName: evt.data.first_name || evt.data.fullName,
            lastName: evt.data.last_name,
            username: evt.data.username,
            email: evt.data.email,
            blockedUsers: [],
            imageUrl: evt.data.image_url,
            createdAt: new Date(evt.data.created_at),
          };
          console.log("Webhook data:", evt.data);
          await db.collection("users").doc(userData.id).set(userData);
          await db.collection("userschats").doc(userData.id).set({
            chats: [],
          });
          res.status(200).json({ success: true });
          break;

        case "user.updated":
          const updatedData = {
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
            email: evt.data.email,
            imageUrl: evt.data.image_url,
            username: evt.data.username,
            // Update other fields as necessary
          };

          await db.collection("users").doc(evt.data.id).update(updatedData);
          console.log("User updated:", updatedData);
          res.status(200).json({ success: true });
          break;

        case "user.deleted":
          const userId = evt.data.id;
          await db.collection("users").doc(userId).delete();
          console.log("User deleted:", userId);
          res.status(200).json({ success: true });
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
          res.status(400).json({
            success: false,
            message: "Unhandled event type",
          });
          return;
      }
    } catch (err) {
      console.error("Error processing webhook:", err.message);
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
