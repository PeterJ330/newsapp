console.log("Comment.js in use");

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var CommentSchema = new Schema({
    title: String, 
    body: String
});

var Comments = mongoose.model("Comment", CommentSchema);

module.exports = Comments;