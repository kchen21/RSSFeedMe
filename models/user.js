const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let UserSchema =  new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true },
  password_digest: { type: String, required: true },
  avatar_url: {type: String, default: '' }
});

UserSchema.pre('save', async function() {
  let user = this;

  if (!user.isModified('password_digest')) return;

  const salt = await bcrypt.genSalt(10);
  user.password_digest = await bcrypt.hash(user.password_digest, salt);
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password_digest);
};

module.exports = mongoose.model('User', UserSchema);
