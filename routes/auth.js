//import basic module for backend express
const express = require("express");
const sendmail = require("../mails/authmail");
//Extracting the router from the express
const router = express.Router();

//creating a user using :post "/api/auth/"->this end point for this we need not auth
//here User model is used to create the server schemmas
const User = require("../models/User");

//to make our passoword hidden in server we incrept password using one way function. and password will always check by its increpted from
const bcrypt = require("bcryptjs");

//body is function of express-validator module which takes input as which part of req is check and if wrong then what we have to print.
//validationResult to the requset as "req" and distribute it to body and return the error if have else return Null.
const { body, validationResult } = require("express-validator");

//json webtoken is module to provide the efficent method for login it will give a token which is stored in the cookies and used insteade of id and password . it contains three part first is "a releted thing" second "which algo will use to solve the token" and third "jwt secreate code" seperated by dots. and all three make the sign. this token goes each time with hits to varify the user instead of taking each time id and password.
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const JWT_sec = "thisisprtiamkuamrmauryaandmy";

//we are making post end point for create user and the we will take with validation and given  a token
router.post(
  "/createuser",
  [
    //validation check using middle ware function predefined in express validator module
    body("email", "enter right mail").isEmail(),
    body("password", "enter valid password").isLength({ min: 5 }),
    body("name", "name should be more than 3 chars").isLength({ min: 3 }),
  ],
  //we are creating asyn function beacuse so many thing is used which are time consuming and other website hitting which make slow to sync function.
  async (req, res) => {
    //validation checking if there are error  the return bad request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //check wether user is unique
      console.log(req.body);
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        console.log(user);
        return res.status(400).json({ error: "sorry user is already exist." });
      }

      /*we will use bceypt to protect password. it will generate a hash according to the passoword and then store it in db that means no one take password from data base. we will add salt means predefine code to the password to get more accuracy.*/

      const salt = await bcrypt.genSalt(10);
      //we are merging the password to salt and the store the hash value in db.
      const secPass = await bcrypt.hash(req.body.password, salt);

      //if user with these detail not exits then take it as new user in user variable
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      //we will generate authentication token using sign function. we have to give the object or what type of paylode is
      const jwtData = jwt.sign({ useridis: user._id }, JWT_sec);
      console.log(jwtData, user._id);
      res.json(jwtData);
      sendmail(
        req.body.email,
        "Sign up",
        "You have singed up on iNotebook cloud app."
      );
    } catch (error) {
      res.status(500).send("Some error occured.");
    }
  }
);
//we are making post end point for login user and the we will user  validation and given  a token
router.post(
  "/login",
  [
    //validation check
    body("email", "enter right mail").isEmail(),
    body("password", "password can not be blank").exists(),
  ],
  async (req, res) => {
    //validation checking if there are error  the return bad request
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //we have checked the correctness of the given id and password, here body is methode of request
    const { email, password } = req.body;
    //we had extracted the email and password from req.body
    //we will wrap up all the code in try catch because we never know there will be error form our side may be form backen or server.
    try {
      //we had find user with using the email value
      let user = await User.findOne({ email });
      //if user does not exits then give the message to write right email
      if (!user) {
        return res
          .status(401)
          .json({ error: "please login with valid email id or password." });
      }
      //if it correct then we check correct email using bcrypt hash using compare
      const passwordCompare = await bcrypt.compare(password, user.password);
      //if user is not authenticated then we will send massage to writ right password
      if (!passwordCompare) {
        return res
          .status(401)
          .json({ error: "please login with valid email id or password." });
      }
      //if every thing correct then we will
      //we will generarate by user if because using user id we can find data most simple manner. i.e serching complexity will lowest
      // const data = {
      //     user: {
      //         id: user.id
      //     }

      // };
      //we will generate authentication token using sign function

      const jwtData = jwt.sign({ useridis: user._id }, JWT_sec);
      const de = jwt.verify(jwtData, JWT_sec);

      res.json({ jwtData, user, de });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured.");
    }
  }
);
//this third end point to autanticate by token
router.post("/getuser", fetchuser, async (req, res) => {
  //here we dont have email password the we dont have to check.
  //fetchuser is middleware function in which we check the authenticatio
  try {
    userId = req.user.useridis;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured.");
  }
});
module.exports = router;
