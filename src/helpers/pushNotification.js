import { admin } from "../config/firebase.config";

const sendPushNotification = async (title, body, registrationToken) => {

  try {
    var payload = {
      notification: {
        title,
        body,
      },
      token: registrationToken,
    };

    const result = await admin.messaging().send(payload);

    return true;
  } catch (err) {
    return false;
  }
};

export default sendPushNotification;
