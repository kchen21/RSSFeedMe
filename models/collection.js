let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CollectionSchema = new Schema({
  title: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Collection', CollectionSchema);
