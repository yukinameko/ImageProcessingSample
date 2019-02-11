const math = require('mathjs');

module.exports = (A, B) => {
	function dot(a, B) {
		const rows = a.length;
		return B.map(v => a.reduce((pre, cur, i) => pre+cur*v[i], 0));
	}
	const B_ = math.transpose(B);
	if(B[0].length == undefined)
		return A.map(v => dot(v, [B])); 
	return A.map((v, i) => dot(v, B_));
}
