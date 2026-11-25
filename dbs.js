const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

const connectToMongoose = () => {
  mongoose.connect(mongoURI, () => {
    console.log("connected to mongo db succsessfull.");
  });
};
module.exports = connectToMongoose;