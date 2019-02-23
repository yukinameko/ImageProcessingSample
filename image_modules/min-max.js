const math = require('mathjs');

const min = (img) => Math.min.apply(null, img.map(v => Math.min.apply(null, v)));
const max = (img) => Math.max.apply(null, img.map(v => Math.max.apply(null, v)));

module.exports.min = min;
module.exports.max = max;
module.exports.minMax = (img) => {return {min:min(img), max:max(img)}; };
