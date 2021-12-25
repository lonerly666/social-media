require("dotenv").config({ path: __dirname + "/../.env" });
const router = require("express").Router();
const inProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = inProduction
  ? process.env.DOMAIN_NAME
  : "http://localhost:3000";

router.post('/saveInfo',(req,res)=>{
  
})