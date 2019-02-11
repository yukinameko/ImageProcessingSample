module.exports.parseInt = A => isFinite(A[0]) ? A.map(v => v|0) : A.map(v => v.map( v => v|0));

module.exports.parseUInt = A => isFinite(A[0]) ? A.map(v => v<0?0:(v|0)) : A.map(v => v.map(v => v<0?0:(v|0)));

module.exports.parseUInt8 = A => isFinite(A[0]) ? A.map(v => v<0?0:(v>255?255:(v|0))) : A.map(v => v.map(v => v<0?0:(v>255?255:(v|0))));
