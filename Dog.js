const cv = require('opencv4nodejs');
const math = require('mathjs');

const argv = process.argv;

const img = cv.imread(argv[2], cv.CV_8UC1);

var sig1 = 1.3;
var sig2 = 2.6;
var filterSize = 11;

if(argv.length == 6){
	sig1 = argv[3]*1;
	sig2 = argv[4]*1;
	filterSize = argv[5]|0;
}
console.log(sig1,sig2,filterSize);

function gaussian(sig, x, y){
	return math.exp(-(x*x+y*y)/2/sig/sig)/2/math.PI/sig/sig;
}

const data = img.getDataAsArray();
const rows = img.rows;
const cols = img.cols;

const fs_half = (filterSize-1)/2;
const filter = Array.from(new Array(filterSize)).map((v, i) =>
	Array.from(new Array(filterSize)).map((v, j) => 
		gaussian(sig1,i-fs_half,j-fs_half) - gaussian(sig2,i-fs_half,j-fs_half)
		));

const filter_sum = filter.reduce((pre ,cur) => pre+cur.reduce((pre, cur) => pre+cur, 0),0);
console.log(`gaussian filter value sum = ${filter_sum}`);

const data_dog = Array.from(new Array(rows)).map((v, i) =>
	Array.from(new Array(cols)).map((v, j) => {
		return filter.reduce((pre, cur, k) => pre+cur.reduce((pre, cur, l) => {
			var i_ = i+k-fs_half;
			var j_ = j+l-fs_half;
			// if(i_ < 0 || i_ >= rows || j_ < 0 || j_ >= cols)return 0;
			if(j_ < 0 || j_ >= cols)j_ = j-l+fs_half;
			if(i_ < 0 || i_ >= rows)i_ = i-k+fs_half;
			return pre + data[i_][j_] * cur;
		}, 0) ,0);
}));

const img_dog = new cv.Mat(data_dog, cv.CV_8UC1);

const min_data = Math.min.apply(null, data_dog.map(v => Math.min.apply(null, v)));
const max_data = Math.max.apply(null, data_dog.map(v => Math.max.apply(null, v)));
console.log(min_data, max_data);

const data_dog_abs = data_dog.map(v => v.map(v => {
	// var vAbs = math.abs(v);
	// return vAbs*255/max_data;
	// return -v;
	// return v>0?(v*255/max_data):(v*255/min_data);
	// return v>0?0:(v)*255/min_data;
	return v<0?0:(v)*255/max_data;
}));
const img_dog_abs = new cv.Mat(data_dog_abs, cv.CV_8UC1);
// const img_gaus1 = img.gaussianBlur(cv.Size(filterSize, filterSize), sig1, sig1); 
// const img_gaus2 = img.gaussianBlur(cv.Size(filterSize, filterSize), sig2, sig2); 

const img_dog_abs_thresh = img_dog_abs.threshold(10, 255, 0);

cv.imshow('dog', img_dog);
// cv.imshow('dog-org', img_gaus1.sub(img_gaus2));
cv.imshow('dog-abs', img_dog_abs);
cv.imshow('dog-abs-threshold', img_dog_abs_thresh);
cv.waitKey();
