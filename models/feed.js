let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FeedSchema = new Schema({
  url: { type: String, required: true },
  title: {type: String, required: true },
  description: String
});

module.exports = mongoose.model('Feed', FeedSchema);
