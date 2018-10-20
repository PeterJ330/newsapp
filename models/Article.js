var mongoose = require("mongoose");

// saves reference to schema constructor
var Schema = mongoose.Schema;

// creates a new UserSchema object using the Schema constructor
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// creaetes model from schema above
var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;