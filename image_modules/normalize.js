const map = require('../image_modules/map.js');
const { minMax } = require('../image_modules/min-max.js');

module.exports = (img, maxVal=1) => {
	const {min, max} = minMax(img);
	return map(img, v => (v-min)*maxVal/(max-min));
}
