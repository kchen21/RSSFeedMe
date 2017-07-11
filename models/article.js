let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  link: { type: String, required: true }
  image_url: String,
  title: { type: String, required: true },
  creator: String,
  pubDate: { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Article', ArticleSchema);
