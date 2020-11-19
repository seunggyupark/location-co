const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    image: { type: String, required: true },
    locations: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Location' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);

