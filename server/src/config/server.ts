import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const server = express();

server.use(
  cors({
    exposedHeaders: "x-access-token",
  })
);

// Thiết lập middleware để phục vụ các tệp tĩnh từ thư mục 'public'
server.use("/", express.static("static/truyentranh"));
server.use(express.json());
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(bodyParser.urlencoded({ extended: true }));

server.use("/comic", require("../routes/comic"));

// server.post("/compress", upload.array("images"), CompressingImages);

export default server;
