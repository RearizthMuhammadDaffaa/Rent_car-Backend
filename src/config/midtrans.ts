import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error("Midtrans credentials are not configured");
}

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey,
  clientKey,
});