import axios from "axios";
import { normalizePhone } from "./normalizePhone";

const GRAPH_VERSION = "v22.0";
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!;
const TOKEN = process.env.WA_TOKEN!;

export async function sendOffersTemplate(rawPhone: string, content: string) {
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
      name: "offers",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: content }],
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
