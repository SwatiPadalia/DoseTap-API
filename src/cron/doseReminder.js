const CronJob = require("node-cron");
import _ from "lodash";
import sendPushNotification from "../helpers/pushNotification";
import { ScheduleDose, User } from "../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");

export const initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule(
    "00 01 5-21 * * *",
    async () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Cron donot run on development");
        return;
      }
      const SlotMapper = {
        5: 1,
        9: 2,
        12: 3,
        13: 4,
        15: 5,
        17: 6,
        19: 7,
        21: 8,
      };

      console.log(`Dose Reminder Cron! at ${new Date()}`);
      const hour = new Date().getHours();
      const slotID = SlotMapper[hour];
      console.log(
        "🚀 ~ file: doseReminder.js:24 ~ scheduledJobFunction ~ slotID:",
        slotID
      );
      if (slotID === undefined || slotID === null) return;

      let userIds = [];

      let scheduleDoses = await ScheduleDose.findAll({
        where: {
          [Op.or]: [
            sequelize.fn(
              "JSON_CONTAINS",
              sequelize.col("slot_ids"),
              `[${slotID}]`
            ),
          ],
        },
      });

      for (let i = 0; i < scheduleDoses.length; i++) {
        userIds.push(scheduleDoses[i].patient_id);
      }

      userIds = _.uniq(userIds);

      let users = await User.findAll({
        where: {
          id: [...userIds],
          status: true,
        },
        attributes: ["id", "fcmToken", "firstName", "phone"],
      });

      for (let j = 0; j < users.length; j++) {
        if ((users[j].fcmToken !== "" || users[j].fcmToken !== null )  && users[j].id === 77) {
          console.log(
            `Notification send to user Id: ${users[j].id} at ${new Date()}`
          );
          await sendPushNotification(
            `${users[j].firstName}, Time to take your medications!`,
            "It's time to take your medicines. Open DoseTap pill box to take your medications.",
            users[j].fcmToken
          );
        }
      }
    }
  );
  scheduledJobFunction.start();
};
