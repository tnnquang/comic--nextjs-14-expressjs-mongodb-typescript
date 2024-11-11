import axios from "axios";

import { BASE_URL_API, BASE_URL_FRONTEND } from "./constant";

const axiosInstance = axios.create({
  baseURL: BASE_URL_API,
  timeout: 10000, //5 giây
  headers: {
    "Access-Control-Allow-Origin": BASE_URL_FRONTEND,
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
});

export default axiosInstance;
