import { mySqlQuery } from "../common/utils.js";
import admin from "../config/firebase.js";

class NotificationService {
  static notifyResourceCreationToAllUsers = async () => {
    const user_ids = await mySqlQuery(`SELECT ?? FROM ?? WHERE ?? = ?`, [
      "user_id",
      "users",
      "is_delete",
      0,
    ]);

    await this.notify({
      user_ids: user_ids.map((user) => user.user_id),
      title: "Check out now",
      body: "New material in Dora's bagpack!! Utilise it and sharpen your skills",
    });
  };
  
  static notifySessionCreationToAllUsers = async () => {
    const user_ids = await mySqlQuery(`SELECT ?? FROM ?? WHERE ?? = ?`, [
      "user_id",
      "users",
      "is_delete",
      0,
    ]);

    await this.notify({
      user_ids: user_ids.map((user) => user.user_id),
      title: "Check out now",
      body: "Hello! Session alert! ...",
    });
  };

  static async notify({ user_ids, title, body }) {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      android: {
        notification: {
          title: title,
          body: body,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body,
            },
            sound: "default",
          },
        },
      },
      webpush: {
        notification: {
          title: title,
          body: body,
        },
      },
    };

    user_ids.map((user_id) => {
      this.addNotification(user_id, title, body);
    });

    const tokens = await this.getTokensForUsers(user_ids);
    
    tokens.map((token) =>
      admin
        .messaging()
        .send({ ...message, token })
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending notification: ", JSON.stringify(error));
        }),
    );
  }

  static addNotification = async (user_id, title, body) => {
    await mySqlQuery(
      `INSERT INTO ?? (user_id, title, message) VALUES (?, ?, ?)`,
      ["user_notification", user_id, title, body],
    );
  };

  static getTokensForUsers = async (user_ids) => {
    const data = await mySqlQuery(`SELECT ?? FROM ?? WHERE ?? in (?)`, [
      "deviceToken",
      "users",
      "user_id",
      user_ids,
    ]);
    return data.map((row) => row.deviceToken).filter((row) => !!row);
  };
}

export default NotificationService;
