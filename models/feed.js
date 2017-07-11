let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FeedSchema = new Schema({
  xml_url: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  link: String,
  image_url: String,
  articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
});

module.exports = mongoose.model('Feed', FeedSchema);
