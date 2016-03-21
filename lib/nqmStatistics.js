/*
 *  * Created by Gavin Leng on 16/03/2016.
 */


"use strict";

var d3 = require("d3/d3.js");

//constructtor
function NqmStat() {} //end NqmStat

NqmStat.prototype.dataInit = function (dataArray) {
    if (arguments.length != 1) {
        throw new Error('illegal argument count');
    }

    if (dataArray.length < 1) {
        throw new Error('no enough data');
    }

    //preprocess data
    var i, j, dataLen, ikeys, td;
    var data = [];

    for (i = 0; i < dataArray.length; i++) {
        if (dataArray[i].length < 1) {
            throw new Error('the length of data does not match the definition');
        }

        dataLen = dataArray[i].length;
        ikeys = Object.keys(dataArray[i][0]);
        td = [];
        for (j = 0; j < dataLen; j++) {
            td.push({
                "_no": j + 1,
                "_name": dataArray[i][j][ikeys[0]],
                "_value": +dataArray[i][j][ikeys[1]]
            });
        }
        data.push(td);
    }

    return data;
}; //end dataInit

NqmStat.prototype.mdv = function (data, flag) {
    if ((arguments.length < 1) || (arguments.length > 2)) {
        throw new Error('illegal argument count');
    }

    var dFlag = 0;
    if (arguments.length == 2) {
        if ((+flag != 1) && (+flag != 0)) {
            throw new Error('the second argument should be provided as 1--population or 0--sample');
        }
        dFlag = +flag;
    }

    var mdv = [];

    var mean = d3.mean(data, function (d) {
        return +d._value;
    });
    mdv.push(mean);

    var sd = d3.deviation(data, function (d) {
        return +d._value;
    });

    if (!dFlag) {
        mdv.push(sd);
    } else {
        sd = Math.sqrt((data.length - 1) / data.length) * sd;
        mdv.push(sd);
    }

    var median = d3.median(data, function (d) {
        return +d._value;
    });
    mdv.push(median);

    var min = d3.min(data, function (d) {
        return +d._value;
    });
    mdv.push(min);

    var max = d3.max(data, function (d) {
        return +d._value;
    });
    mdv.push(max);

    return mdv;
}; //end mdv

NqmStat.prototype.mode = function (data, flag) {
    if ((arguments.length < 1) || (arguments.length > 2)) {
        throw new Error('illegal argument count');
    }

    var dFlag = 0;
    if (arguments.length == 2) {
        if ((+flag != 2) && (+flag != 1) && (+flag != 0)) {
            throw new Error('the second argument should be provided as 0--the value with discrete probability distribution, 1--the value with continuous normal distribution or 2--the value with continuous skewed distribution');
        }
        dFlag = +flag;
    }

    var mode, mean;

    if (dFlag == 0) {
        var numberA, numberB, i, j, num;

        var len = data.length;

        var vecA = [];
        for (i = 0; i < len; i++) {
            vecA.push(+data[i]._value);
        }

        var dd = [];
        for (i = 0; i < len; i++) {
            numberA = +vecA[i];

            num = 1;
            for (j = (i + 1); j < len; j++) {
                numberB = +vecA[j];

                if (numberA == numberB) {
                    num++;
                }
            }

            dd.push({
                "value": numberA,
                "number": num
            });
        }

        var numMax = d3.max(dd, function (d) {
            return +d.number;
        });

        if (numMax == 1) {
            mode = "undefined";
        } else {
            mode = [];

            for (i = 0; i < len; i++) {
                if (numMax == dd[i].number) {
                    mode.push(dd[i]);
                }
            }
        }
    }

    if (dFlag == 1) {
        mean = d3.mean(data, function (d) {
            return +d._value;
        });

        var median = d3.median(data, function (d) {
            return +d._value;
        });

        mode = 3 * median - 2 * mean;
    }

    if (dFlag == 2) {
        mean = d3.mean(data, function (d) {
            return +d._value;
        });

        var sd = d3.deviation(data, function (d) {
            return +d._value;
        });

        mode = Math.exp(mean - Math.pow(sd, 2));
    }

    return mode;
}; //end mode

NqmStat.prototype.skewness = function (data, flag) {
    if ((arguments.length < 1) || (arguments.length > 2)) {
        throw new Error('illegal argument count');
    }

    var dFlag = 0;
    if (arguments.length == 2) {
        if ((+flag != 1) && (+flag != 0)) {
            throw new Error('the second argument should be provided as 1--population or 0--sample');
        }
        dFlag = +flag;
    }

    var len = data.length;

    var mean = d3.mean(data, function (d) {
        return +d._value;
    });

    var m2 = d3.mean(data, function (d) {
        return Math.pow((+d._value - mean), 2);
    });

    var m3 = d3.mean(data, function (d) {
        return Math.pow((+d._value - mean), 3);
    });

    var skew = m3 / Math.pow(m2, 3 / 2);

    if (!dFlag) {
        skew = (Math.sqrt(len * (len - 1)) / (len - 2)) * skew;
    }

    return skew;
}; //end skewness

NqmStat.prototype.kurtosis = function (data, flag) {
    if ((arguments.length < 1) || (arguments.length > 2)) {
        throw new Error('illegal argument count');
    }

    var dFlag = 0;
    if (arguments.length == 2) {
        if ((+flag != 1) && (+flag != 0)) {
            throw new Error('the second argument should be provided as 1--population or 0--sample');
        }
        dFlag = +flag;
    }

    var len = data.length;

    var mean = d3.mean(data, function (d) {
        return +d._value;
    });

    var m2 = d3.mean(data, function (d) {
        return Math.pow((+d._value - mean), 2);
    });

    var m4 = d3.mean(data, function (d) {
        return Math.pow((+d._value - mean), 4);
    });

    var kurt = m4 / Math.pow(m2, 2);

    if (!dFlag) {
        kurt = (((len + 1) * (len - 1)) / ((len - 2) * (len - 3))) * kurt;
    }

    return kurt;
}; //end kurtosis

NqmStat.prototype.getCorr = function (dataA, dataB) {
    if (arguments.length != 2) {
        throw new Error('illegal argument count');
    }

    var len = dataA.length;

    if (dataB.length != len) {
        throw new Error('the length of data sets should be same');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < len; i++) {
        xy.push(+dataA[i]._value * +dataB[i]._value);
        x2.push(+dataA[i]._value * +dataA[i]._value);
        y2.push(+dataB[i]._value * +dataB[i]._value);
    }

    var sum_x = d3.sum(dataA, function (d) {
        return +d._value;
    });
    var sum_y = d3.sum(dataB, function (d) {
        return +d._value;
    });
    var sum_xy = d3.sum(xy);
    var sum_x2 = d3.sum(x2);
    var sum_y2 = d3.sum(y2);

    var tt1 = (len * sum_xy) - (sum_x * sum_y);
    var tt2 = (len * sum_x2) - (sum_x * sum_x);
    var tt3 = (len * sum_y2) - (sum_y * sum_y);
    var tt4 = Math.sqrt(tt2 * tt3);
    var corr = tt1 / tt4;

    if (isNaN(corr)) {
        corr = 0;
    }

    return corr;
}; //end getCorr

NqmStat.prototype.getCov = function (dataA, dataB, flag) {
    if ((arguments.length < 2) || (arguments.length > 3)) {
        throw new Error('illegal argument count');
    }

    var dFlag = 0;
    if (arguments.length == 3) {
        if ((+flag != 1) && (+flag != 0)) {
            throw new Error('the second argument should be provided as 1--population or 0--sample');
        }
        dFlag = +flag;
    }

    var cov;
    var len = dataA.length;

    if (dataB.length != len) {
        throw new Error('the length of data sets should be same');
    }

    var meanA = d3.mean(dataA, function (d) {
        return +d._value;
    });

    var meanB = d3.mean(dataB, function (d) {
        return +d._value;
    });

    var xy = [];
    for (var i = 0; i < len; i++) {
        xy.push((+dataA[i]._value - meanA) * (+dataB[i]._value - meanB));
    }

    var sum_xy = d3.sum(xy);

    if (!dFlag) {
        cov = sum_xy / (len - 1);
    } else {
        cov = sum_xy / len;
    }

    return cov;
}; //end getCov

module.exports = NqmStat;
