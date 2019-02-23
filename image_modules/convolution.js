const ZEROPADDING = 0;
const EXPAND = 1;

module.exports.ZEROPADDING = ZEROPADDING;
module.exports.EXPAND = EXPAND;

module.exports.conv = (img, imgSizes, filter, filterSize, {func=null, mode=ZEROPADDING} = {func:null, mode:ZEROPADDING}) => {
	const cols = imgSizes[1];
	const rows = imgSizes[0];
	const filterCols = filterSize[1];
	const filterRows = filterSize[0];
	const filterColsHalf = (filterCols-1)/2;
	const filterRowsHalf = (filterRows-1)/2;

	if(func == null){
		if(mode==ZEROPADDING){
			return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
				filter.reduce((pre, cur, l) => {
					let row = j+l-filterRowsHalf;
					if(row < 0 || rows <= row)return pre;
					return pre+cur.reduce((pre, cur, k) => {
						let col = i+k-filterColsHalf;
						if(col < 0 || cols <= col)return pre;
						return pre+img[row][col]*cur;
					}, 0);
				}, 0)
			));
		}else if(mode==EXPAND){
			return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
				filter.reduce((pre, cur, l) => {
					let row = j+l-filterRowsHalf;
					if(row < 0)row = 0;
					if(rows <= row)row = rows-1;
					return pre+cur.reduce((pre, cur, k) => {
						let col = i+k-filterColsHalf;
						if(col < 0)col = 0;
						if(cols <= col)col = cols-1;
						return pre+img[row][col]*cur;
					}, 0);
				}, 0)
			));
		}
	}else{
		if(mode==ZEROPADDING){
			return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
				func(filter.reduce((pre, cur, l) => {
					let row = j+l-filterRowsHalf;
					if(row < 0 || rows <= row)return pre;
					return pre+cur.reduce((pre, cur, k) => {
						let col = i+k-filterColsHalf;
						if(col < 0 || cols <= col)return pre;
						return pre+img[row][col]*cur;
					}, 0);
				}, 0))
			));
		}else if(mode==EXPAND){
			return Array.from(new Array(rows)).map((_, j) => Array.from(new Array(cols)).map((v, i) => 
				func(filter.reduce((pre, cur, l) => {
					let row = j+l-filterRowsHalf;
					if(row < 0)row = 0;
					if(rows <= row)row = rows-1;
					return pre+cur.reduce((pre, cur, k) => {
						let col = i+k-filterColsHalf;
						if(col < 0)col = 0;
						if(cols <= col)col = cols-1;
						return pre+img[row][col]*cur;
					}, 0);
				}, 0))
			));
		}
	}
};
