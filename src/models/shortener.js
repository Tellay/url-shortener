const { model } = require('mongoose');

module.exports = model('shorteners', {
    slug: String,
    link: String,
    createdAt: Date,
});