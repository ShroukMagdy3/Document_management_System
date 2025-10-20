import EventEmitter from "events";
import { otpEmailTemplate } from "../service/emailTemplate";
import { sendEmail } from "../service/sendEmail";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  const { email, otp , userName } = data;
  await sendEmail({
    to: email,
    subject: `Confirm Email`,
    html: otpEmailTemplate(userName , otp as unknown as string),
  });
});

export default eventEmitter; 