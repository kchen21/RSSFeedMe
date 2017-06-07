let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SubscriptionSchema = new Schema({
  personal_collection: { type: Schema.Types.ObjectId, ref: 'PersonalCollection' },
  feed: { type: Schema.Types.ObjectId, ref: 'Feed' }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
