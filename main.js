/*
 * Created by G on 11/03/2016.
 */


var express = require("express");
var path = require('path');

var app = express();

var fs = require("fs");
var d3 = require("d3/d3.js");

var NqmStat = require('./lib/nqmStatistics.js');

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "jade");
app.use(express.static(__dirname + '/public'));

var dataConfig = require('./dataDivConfig.js');
var csv_data_div = require('./lib/csv_data_div.js');

var datacsv = dataConfig.dataPath;
var dataDiv = dataConfig.dataDiv;

fs.readFile(datacsv, 'utf8', function (error, ndata) {
	if (error) {
		throw new Error('cannot open ' + datacsv);
	}

	var i, mdvP, mdvS, mySkewP, mySkewS, myKurtP, myKurtS, myMode, corr, covS, covP;

	var dataTotal = d3.csv.parse(ndata);

	csv_data_div(dataTotal, dataDiv, function(error, data) {
		if (error) {
			throw new Error(error);
		}

		var lenDataDiv = dataDiv.length;

		var csvD = [];
		for (i = 0; i < lenDataDiv; i++) {
			csvD.push(dataDiv[i][1]);
		}

		var myStat = new NqmStat();

		var data0 = myStat.dataInit(data);

		var mdData = [];
		for (i = 0; i < lenDataDiv; i++) {
			mdvS = myStat.mdv(data0[i]);
			mdvP = myStat.mdv(data0[i], 1); //flag: 1--population or 0--sample(default)
			mySkewS = myStat.skewness(data0[i]);
			mySkewP = myStat.skewness(data0[i], 1);
			myKurtS = myStat.kurtosis(data0[i]);
			myKurtP = myStat.kurtosis(data0[i], 1);
			myMode = myStat.mode(data0[i]);

			mdData.push({
				"dataNM": csvD[i],
				"data": data0[i],
				"mean": mdvS[0],
				"sdP": mdvP[1],
				"sdS": mdvS[1],
				"median": mdvS[2],
				"min": mdvS[3],
				"max": mdvS[4],
				"mode": myMode,
				"skewnessP": mySkewP,
				"skewnessS": mySkewS,
				"kurtosisP": myKurtP,
				"kurtosisS": myKurtS
			});
		}
		//console.log(mdData);

		var corrData = [];
		corr = myStat.getCorr(data0[0], data0[1]);
		covS = myStat.getCov(data0[0], data0[1]);
		covP = myStat.getCov(data0[0], data0[1], 1);

		corrData.push({
			"data1NM": csvD[0],
			"data1": data0[0],
			"data2NM": csvD[1],
			"data2": data0[1],
			"corr": corr,
			"covS": covS,
			"covP": covP
		});
		//console.log(corrData);

		app.get('/mdv', function (req, res) {
			res.send(mdData);
		});

		app.get('/corr', function (req, res) {
			res.send(corrData);
		});
	});
});

app.get('/', function (req, res) {
	res.render('index', {
		title: "DataStatisticsShow"
	});
});

var ipaddress = "localhost";
var port = 3001;

app.listen(port, ipaddress, function () {
	console.log("Server running at http://" + ipaddress + ":" + port );
});
