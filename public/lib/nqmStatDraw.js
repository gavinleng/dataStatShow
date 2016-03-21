/*
 *  * Created by Gavin Leng on 30/07/2015.
 */


//constructtor
function NqmStatDraw(cfg) {
    if (!cfg) {
        cfg = {};
    }

    this._number = +cfg.number || 100; //the number of points for X in the mdvdraw
    this._numberOfBins = +cfg.numberOfBins || 60;

    this._width = +cfg.width || 960;
    this._height = +cfg.height || 500;

    this._margin = cfg.margins || {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };

    this._width = this._width - this._margin.left - this._margin.right;
    this._height = this._height - this._margin.top - this._margin.bottom;

    this._x = null;
    this._y = null;
    this._xAxis = null;
    this._yAxis = null;
    this._line = null;
    this._svg = null;
} //end NqmStatDraw

NqmStatDraw.prototype.corrDraw = function (dataA, dataB, corr, corrId, fName) {
    if ((arguments.length < 3) || (arguments.length > 5)) {
        throw new Error('illegal argument count');
    }

    if (!corrId) {
        corrId = "body";
    }

    if (!fName) {
        fName = "";
    }

    initDraw.call(this, corrId);

    var self = this;

    var data = [];
    var len = dataA.length;

    for (var i = 0; i < len; i++) {
        data.push({
            "x": +dataA[i]._value,
            "y": +dataB[i]._value
        });
    }

    this._x.domain([0, d3.max(data, function (d) {
        return +d.x;
    }) + 1]);
    this._y.domain([0, d3.max(data, function (d) {
        return +d.y;
    }) + 1]);

    this._svg.select(".x.axis")
        .call(this._xAxis);

    this._svg.select(".y.axis")
        .call(this._yAxis);

    this._svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 1)
        .attr("cx", function (d) {
            return self._x(+d.x);
        })
        .attr("cy", function (d) {
            return self._y(+d.y);
        })
        .style("fill", "blue");

    var datar = nqmLLS(data);

    this._svg.select(".line")
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("d", this._line(datar[0]));

    this._svg.append("path")
        .attr("class", "line1")
        .attr("d", this._line([{x:0,y:0}, {x:8000,y:8000}]))
        .style("stroke", "red");

    if (fName) {
        this._svg.append("text")
            .attr("x", 10)
            .attr("y", 3)
            .text(fName);
    }
}; //end corrDraw

NqmStatDraw.prototype.histogram = function (d, histId, fName, fLine) {
    if ((arguments.length < 1) || (arguments.length > 4)) {
        throw new Error('illegal argument count');
    }

    if (!histId) {
        histId = "body";
    }

    if (!fName) {
        fName = "";
    }

    if (!fLine) {
        fLine = 0; //fLine: the flag to draw line chart for the histogram; 1--true, 0--false (default)
    }

    var numberOfBins = this._numberOfBins;

    initDraw.call(this, histId);

    var self = this;

    var i;
    var values = [];
    var len = d.length;
    for (i = 0; i < len; i++) {
        values.push(+d[i]._value);
    }

    var formatCount = d3.format(",.0f");

    this._x.domain([d3.min(values), d3.max(values)]);

    var data = d3.layout.histogram()
        .bins(numberOfBins)(values);

    this._y.domain([0, d3.max(data, function (d) {
        return d.y;
    })]);

    var bar = this._svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + self._x(d.x) + "," + self._y(d.y) + ")";
        })
        .style("opacity", 0.8);

    bar.append("rect")
        .attr("x", 1)
        //.attr("width", this._x.rangeBand())
        .attr("width", this._x(data[0].dx + d3.min(values)) - 1)
        .attr("height", function (d) {
            return self._height - self._y(d.y);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -8)
        .attr("x", this._x(data[0].x + data[0].dx / 2))
        .attr("text-anchor", "middle").style("fill","red")
        .text(function (d) {
            return formatCount(d.y);
        });

    this._svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this._height + ")")
        .call(this._xAxis);

    this._svg.select(".y.axis")
        .remove();

    this. _svg.append("g")
        .attr("class", "y axis")
        .call(this._yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 10)
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("frequency");

    if (fName) {
        this._svg.append("text")
            .attr("x", 18)
            .attr("y", -10)
            .text(fName);
    }

    if (fLine) {
        var myLine = this._line.interpolate("basis"); //.interpolate("monotone");

        var minDf = 0,
            maxDf = 0,
            minD = d3.min(values),
            maxD = d3.max(values);

        values.sort(function(a, b){return a - b});
        for (i = 0; i < len; i++) {
            if (values[i] == minD) {
                minDf++;
            } else {
                break;
            }
        }

        values.sort(function(a, b){return b - a});
        for (i = 0; i < len; i++) {
            if (values[i] == maxD) {
                maxDf++;
            } else {
                break;
            }
        }

        var dataLine = [{"x": minD, "y": minDf}];
        for (i = 0; i < data.length; i++) {
            dataLine.push({
                "x": data[i].x + data[i].dx / 2,
                "y": data[i].y
            });
        }

        dataLine.push({
            "x": maxD,
            "y": maxDf
        });

        this._svg.select(".line")
            .attr("d", myLine(dataLine))
            .style("stroke", "red");
    }
}; //end histogram

NqmStatDraw.prototype.mdvDraw = function (data, mdvId, fName) {
    if ((arguments.length < 1) || (arguments.length > 3)) {
        throw new Error('illegal argument count');
    }

    if (!mdvId) {
        mdvId = "body";
    }

    if (!fName) {
        fName = "";
    }

    var number = +this._number;

    initDraw.call(this, mdvId);

    var a = +data[0] - 3 * +data[1];
    var b = +data[0] + 3 * +data[1];

    var step = (b - a) / (+number - 1);

    var i;
    var td = [];

    for (i = 0; i < +number; i++) {
        td.push({
            "x": a + i * step,
            "y": gaussian(a + i * step, +data[0], +data[1])
        });
    }

    this._x.domain(d3.extent(td, function (d) {
        return +d.x;
    }));
    this._y.domain(d3.extent(td, function (d) {
        return +d.y;
    }));

    this._svg.select(".x.axis")
        .call(this._xAxis);

    this._svg.select(".y.axis")
        .call(this._yAxis);

    this._svg.select(".line")
        .attr("d", this._line(td));

    if (fName) {
        this._svg.append("text")
            .attr("x", 10)
            .attr("y", 3)
            .text(fName);
    }
}; //end mdvDraw

function gaussian(x, mean, sigma) {
    var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
        xx = (x - mean) / sigma;

    return gaussianConstant * Math.exp(-.5 * xx * xx) / sigma;
} //end gaussian

function initDraw(drawId) {
    var self = this;

    this._x = d3.scale.linear()
        .range([0, this._width]);

    this._y = d3.scale.linear()
        .range([this._height, 0]);

    this._xAxis = d3.svg.axis()
        .scale(this._x)
        .orient("bottom");

    this._yAxis = d3.svg.axis()
        .scale(this._y)
        .orient("left");

    this._line = d3.svg.line()
        .x(function (d) {
            return self._x(d.x);
        })
        .y(function (d) {
            return self._y(d.y);
        });

    this._svg = d3.select(drawId).append("svg")
        .attr("width", this._width + this._margin.left + this._margin.right)
        .attr("height", this._height + this._margin.top + this._margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");

    this._svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this._height + ")")
        .append("text")
        .attr("x", this._width)
        .attr("dx", ".71em")
        .attr("dy", "-.21em")
        .style("text-anchor", "end")
        .text("x");

    this._svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("x", 6)
        .attr("dy", "-.48em")
        .style("text-anchor", "end")
        .text("y");

    this._svg.append("path")
        .attr("class", "line");

    this._svg.append("circle")
        .attr("class", "dot");
} //end initDraw

function nqmLLS(d) {
    var num = d.length;

    if (num === 0) {
        throw new Error('It is an empty data set!');
    }

    var x_sum = d3.sum(d, function (d) {
        return d.x;
    });
    var y_sum = d3.sum(d, function (d) {
        return d.y;
    });
    var xx_sum = d3.sum(d, function (d) {
        return (d.x) * (d.x);
    });
    var xy_sum = d3.sum(d, function (d) {
        return (d.x) * (d.y);
    });

    /*get  y = x * m + b   */
    var m = (num * xy_sum - x_sum * y_sum) / (num * xx_sum - x_sum * x_sum);
    var b = (y_sum / num) - (m * x_sum) / num;

    var data = [];

    var i, _xx, _yy;
    for (i = 0; i < num; i++) {
        _xx = d[i].x;
        _yy = _xx * m + b;

        data.push({
            "x": _xx,
            "y": _yy
        });
    }

    data = [data, m, b];

    return data;
} //end nqmLLS
