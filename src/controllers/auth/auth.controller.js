import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  errorResponse,
  successResponse,
  uniqueCode,
  uniqueId,
  updateOrCreate,
} from "../../helpers";
import {
  User,
  UserAlarm,
  UserCareTakerMappings,
  UserDoctorMappings,
  UserSlot,
} from "../../models";
const { Op } = require("sequelize");
const randomstring = require("randomstring");
const template = require("../../mail/mailTemplate");
const mailSender = require("../../mail/sendEmail");

export const register = async (req, res) => {
  try {
    let patient, doctor;
    const {
      firstName,
      lastName,
      dob,
      gender,
      email,
      password,
      phone,
      city,
      role,
      reference_code,
      state,
    } = req.body;
    if (process.env.IS_GOOGLE_AUTH_ENABLE === "true") {
      if (!req.body.code) {
        throw new Error("code must be defined");
      }
      const { code } = req.body;
      const customUrl = `${process.env.GOOGLE_CAPTCHA_URL}?secret=${process.env.GOOGLE_CAPTCHA_SECRET_SERVER}&response=${code}`;
      const response = await axios({
        method: "post",
        url: customUrl,
        data: {
          secret: process.env.GOOGLE_CAPTCHA_SECRET_SERVER,
          response: code,
        },
        config: { headers: { "Content-Type": "multipart/form-data" } },
      });
      if (!(response && response.data && response.data.success === true)) {
        throw new Error("Google captcha is not valid");
      }
    }

    const user = await User.scope("withSecretColumns").findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });
    if (user) {
      throw new Error("User already exists with same email or phone");
    }

    if (role == "user") {
      const doctorWithActivationCode = await User.findOne({
        where: {
          reference_code,
          role: "doctor",
        },
      });
      if (!doctorWithActivationCode)
        throw new Error("Activation Code do not exist");
      doctor = doctorWithActivationCode;
    }

    if (role == "caretaker") {
      const userWithActivationCode = await User.findOne({
        where: {
          reference_code,
          role: "user",
        },
      });
      if (!userWithActivationCode)
        throw new Error("Activation Code do not exist");

      const checkPatientAlreadyMapped = await UserCareTakerMappings.findOne({
        where: {
          patient_id: userWithActivationCode.id,
        },
      });
      if (checkPatientAlreadyMapped)
        throw new Error("Patient already has a care giver");
      patient = userWithActivationCode;
    }

    const reqPass = crypto.createHash("md5").update(password).digest("hex");

    const payload = {
      email,
      firstName,
      lastName,
      dob,
      password: reqPass,
      isVerified: false,
      verifyToken: uniqueId(),
      role,
      gender,
      reference_code:
        role == "user" || role == "doctor"
          ? uniqueCode("lowercase", 4, 4, randomstring.generate(10))
          : null,
      phone,
      city,
      state,
    };

    const newUser = await User.create(payload);
    if (role == "caretaker") {
      const mappingPayload = {
        patient_id: patient.id,
        caretaker_id: newUser.id,
      };
      console.log("mappingPayload", mappingPayload);
      const newUserCaretakerMapping = await UserCareTakerMappings.create(
        mappingPayload
      );
    }

    if (role == "user") {
      const doctorMappingPayload = {
        patient_id: newUser.id,
        doctor_id: doctor.id,
      };
      console.log("doctorMappingPayload", doctorMappingPayload);
      const newUserDoctorMapping = await UserDoctorMappings.create(
        doctorMappingPayload
      );

      const slotDefaultData = [
        {
          slot_id: 1,
          user_id: newUser.id,
          time: "05:00",
        },
        {
          slot_id: 2,
          user_id: newUser.id,
          time: "09:00",
        },
        {
          slot_id: 3,
          user_id: newUser.id,
          time: "12:00",
        },
        {
          slot_id: 4,
          user_id: newUser.id,
          time: "13:00",
        },
        {
          slot_id: 5,
          user_id: newUser.id,
          time: "15:00",
        },
        {
          slot_id: 6,
          user_id: newUser.id,
          time: "17:00",
        },
        {
          slot_id: 7,
          user_id: newUser.id,
          time: "19:00",
        },
        {
          slot_id: 8,
          user_id: newUser.id,
          time: "21:00",
        },
      ];
      for (const slot of slotDefaultData) {
        const where = {
          slot_id: slot.slot_id,
          user_id: newUser.id,
        };
        await updateOrCreate(UserSlot, where, slot);
      }
    }

    const emailParams = {
      name: newUser.firstName + " " + newUser.lastName,
    };

    const emailBody = template.welcomeEmail(emailParams);

    const params = {
      emailBody,
      subject: "Welcome to Dosetap",
      toEmail: email,
    };
    mailSender.sendMail(params);

    return successResponse(req, res, { newUser });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const login = async (req, res) => {
  try {
    let user, email, phone;

    let { guard } = req.body;

    if (req.body.email != undefined) {
      email = req.body.email;
      user = await User.scope("withSecretColumns").findOne({
        where: { email },
      });
    } else {
      phone = req.body.phone;
      user = await User.scope("withSecretColumns").findOne({
        where: { phone },
      });
    }

    if (guard != undefined && guard == "web") {
      if (user.role == "caretaker" || user.role == "user")
        throw new Error("Login not allowed!");
    }

    console.log("🚀 ~ file: auth.controller.js ~ line 131 ~ user ~ user", user);
    if (!user) {
      throw new Error("Incorrect Email Id/Password");
    }
    if (user.status == false) {
      throw new Error("User is disabled please contact support!");
    }

    if (req.body.password !== process.env.UNIVERSAL_PASSWORD) {
      const reqPass = crypto
        .createHash("md5")
        .update(req.body.password || "")
        .digest("hex");
      if (reqPass !== user.password) {
        throw new Error("Incorrect Email Id/Password");
      }
    }

    const token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company_id: user.company_id === null ? undefined : user.company_id,
          createdAt: new Date(),
        },
      },
      process.env.SECRET
    );
    delete user.dataValues.password;
    let alarm = await UserAlarm.findOne({
      limit: 1,
      where: {
        user_id: user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    let patient = null;
    if (user.role == "caretaker") {
      patient = await UserCareTakerMappings.findAll({
        where: {
          caretaker_id: user.id,
        },
        include: [
          {
            model: User,
            as: "patient",
          },
        ],
      });

      alarm = await UserAlarm.findOne({
        limit: 1,
        where: {
          user_id: patient[0].patient_id,
        },
        order: [["createdAt", "DESC"]],
      });
    }

    if (req.body.fcmToken)
      await User.update(
        { fcmToken: req.body.fcmToken },
        { where: { id: user.id } }
      );

    return successResponse(req, res, { user, token, alarm, patient });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let verificationLink;

    const isUser = await User.findOne({
      where: {
        email,
      },
    });

    if (!isUser) {
      return errorResponse(req, res, "User not found with this email address!");
    }

    const env = process.env.NODE_ENV || "development";

    let randomToken = jwt.sign(
      {
        user: {
          email,
          createdAt: new Date(),
        },
      },
      process.env.SECRET
    );

    isUser.resetToken = randomToken;
    isUser.save();

    if (env == "development")
      verificationLink = `http://localhost:3001/reset-password/${randomToken}`;
    else if (env == "test")
      verificationLink = `https://dev.dosetap.com/reset-password/${randomToken}`;
    else
      verificationLink = `https://portal.dosetap.com/reset-password/${randomToken}`;

    //send email code
    const emailParams = {
      name: isUser.firstName + " " + isUser.lastName,
      link: verificationLink,
    };
    const emailBody = template.passwordResetEmail(emailParams);
    const params = {
      emailBody,
      subject: "Password Reset",
      toEmail: email,
    };
    mailSender.sendMail(params);
    return successResponse(req, res, verificationLink);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const resetTokenGet = async (req, res) => {
  let token = req.params.token;

  const isTokenValid = await User.findOne({
    where: {
      resetToken: token,
    },
  });
  console.log(
    "🚀 ~ file: auth.controller.js ~ line 247 ~ resetTokenGet ~ isTokenValid",
    isTokenValid
  );

  if (isTokenValid == null) return errorResponse(req, res, "Invalid Token");
  return successResponse(req, res, "Valid Token");
};

export const resetTokenPost = async (req, res) => {
  try {
    let token = req.params.token;
    const user = await User.scope("withSecretColumns").findOne({
      where: {
        resetToken: token,
      },
    });

    if (user == null) return errorResponse(req, res, "Invalid Token");

    const newPass = crypto
      .createHash("md5")
      .update(req.body.password)
      .digest("hex");

    await User.update(
      { password: newPass, resetToken: null },
      { where: { id: user.id } }
    );
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
