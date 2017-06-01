let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

let Schema = mongoose.Schema;

let UserSchema =  new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true },
  password_digest: { type: String, required: true },
  avatar_url: {type: String, default: '' }
});

UserSchema.pre('save', (next) => {
  let user = this;

  if (!user.isModified('password_digest')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password_digest, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password_digest = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = (password) => {
  return bcrypt.compareSync(password, this.password_digest);
};

module.exports = mongoose.model('User', UserSchema);
