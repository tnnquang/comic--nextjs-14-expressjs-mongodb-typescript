import { config } from "dotenv";

config();

export const {
  URI,
  SECRET_ACCESS_TOKEN,
  PORT,
  PATH_STATIC_IMAGE
} = process.env;
