import mongoose from "mongoose";
import * as env from "../config/env";

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

async function connectDatabase() {
  try {
    await mongoose.connect(
      env.URI as any
      // "mongodb://127.0.0.1:27017/javggg",
    );
    console.log("Comic Database was connected");
  } catch (error) {
    console.log("The database is not connected: ", error);
  }
}

export default connectDatabase;
