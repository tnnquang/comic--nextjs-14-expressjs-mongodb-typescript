import axios from "axios";

const instance = axios.create({
  timeout: 90000,
  baseURL: `https://otruyenapi.com/v1/api`,
});

export default instance;
