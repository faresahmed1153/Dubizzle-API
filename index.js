import "dotenv/config";
// const express = require('express')
import express from "express";
import { connectionDB } from "./DB/connection.js";
const app = express();
const port = process.env.PORT;
import Auth_Router from "./Modules/Authentication/Auth.routes.js";
import User_Router from "./Modules/User/User.routes.js";
import Product_Router from "./Modules/Product/Product.routes.js";
import Comment_Router from "./Modules/Comment/Comment.routes.js";
import socketInit from "./Services/socket_init.js";
import cornJobs from "./Services/Cron_job.js";
app.use(express.json());
app.use("/uploads", express.static("./uploads"));
connectionDB();
app.use(Auth_Router, User_Router, Product_Router, Comment_Router);
app.get("/", (req, res) => res.send("Hello World!"));
const server = app.listen(port, () => console.log(`listening on port ${port}!`));
socketInit(server); //apply socket io on your server
cornJobs();
