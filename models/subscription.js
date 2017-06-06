let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SubscriptionSchema = new Schema({
  collection: { type: Schema.Types.ObjectId, ref: 'Collection' },
  feed: { type: Schema.Types.ObjectId, ref: 'Feed' }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
