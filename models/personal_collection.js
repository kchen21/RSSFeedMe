let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PersonalCollectionSchema = new Schema({
  title: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  feeds: [{ type: Schema.Types.ObjectId, ref: 'Feed' }]
});

module.exports = mongoose.model('PersonalCollection', PersonalCollectionSchema);
