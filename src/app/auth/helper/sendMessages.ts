import axios from "axios";
import { normalizePhone } from "./normalizePhone";

const GRAPH_VERSION = "v22.0";
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!;
const TOKEN = process.env.WA_TOKEN!;

export async function sendOtpTemplate(rawPhone: string, code: string) {
  const to = normalizePhone(rawPhone);
  if (!to) {
    throw new Error(`Invalid phone number: ${rawPhone}`);
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "verification_message",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: code }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: code, // or token used in URL
            },
          ],
        },
      ],
    },
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  return res.data; // يحتوي wamid
}

export async function sendWelcomeMessage(
  rawPhone: string,
  username: string,
  password: string,
) {
  const to = normalizePhone(rawPhone);
  if (!to) {
    throw new Error(`Invalid phone number: ${rawPhone}`);
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "send_message",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: username },
            { type: "text", text: password },
          ],
        },
      ],
    },
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  console.log(res);

  return res.data; // يحتوي wamid
}
