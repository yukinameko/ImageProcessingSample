const map = require('./map.js');

module.exports = (img, {threshold=0, maxVal=1}) => {
	let t = threshold;
	if(t == 0){
		const hystgram = Array.from(new Array(256)).fill(0);
		let sum = 0;
		let omg = img.length*img[0].length;
		for(let V of img){
			for(let v of V){
				hystgram[v]++;
				sum += v;
			}
		}
		let omg1 = 0;
		let sum1 = 0;
		let sigmab = 0;
		for(let [i, n] of hystgram.entries()){
			omg1 += n;
			sum1 += i*n;
			const omg2 = omg - omg1;
			const sum2 = sum - sum1;
			const m = sum1/omg1 - sum2/omg2;
			const sigma = omg1*omg2*m*m;
			if(sigma > sigmab){
				sigmab = sigma;
				t = i;
			}
		}
	}
	return map(img, v => t<v?maxVal:0);
};
