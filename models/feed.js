let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FeedSchema = new Schema({
  url: { type: String, required: true }
});

module.exports = mongoose.model('Feed', FeedSchema);
