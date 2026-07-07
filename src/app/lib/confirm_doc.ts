import axios from "axios";
import { normalizePhone } from "../auth/helper/normalizePhone";

const GRAPH_VERSION = "v22.0";
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!;
const TOKEN = process.env.WA_TOKEN!;

export async function confirmDoc(
  rawPhone: string,
  data: {
    documentNumber: string;
    startDate: string;
    endDate: string;
    value: string;
    payment: string;
  },
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
      name: "confirm_document",
      language: { code: "ar" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.documentNumber },
            { type: "text", text: data.startDate },
            { type: "text", text: data.endDate },
            { type: "text", text: data.value },
            { type: "text", text: data.payment },
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
