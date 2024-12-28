import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { error } from "console";
dotenv.config({ path: "./.env" });
const app = express();
const PORT = 3000;

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.log(`there was an error connectin to the db:`, error);
  });

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
