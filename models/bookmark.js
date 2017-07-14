let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookmarkSchema = new Schema({
  link: { type: String, required: true },
  image_url: String,
  title: { type: String, required: true, unique: true },
  creator: String,
  pub_date: String,
  description: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);
