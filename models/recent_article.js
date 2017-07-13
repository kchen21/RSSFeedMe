let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let RecentArticleSchema = new Schema({
  link: { type: String, required: true },
  image_url: String,
  title: { type: String, required: true },
  creator: String,
  pub_date: { type: String, required: true },
  description: { type: String, required: true },
  feed: { type: Schema.Types.ObjectId, ref: 'Feed' },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('RecentArticle', RecentArticleSchema);
