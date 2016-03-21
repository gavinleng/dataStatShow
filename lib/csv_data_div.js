/*
 * Created by G on 11/03/2016.
 */


"use strict";

module.exports = function (data, dataDiv, cb) {
	var i, j, error;
	var len = data.length;
	var lenDataDiv = dataDiv.length;
	var data0 = [];

	if ((len != 0) && (lenDataDiv != 0)) {
		var dataKey = [dataDiv[0][0]];

		for (i = 0; i < lenDataDiv; i++) {
			dataKey.push(dataDiv[i][1]);
			data0[i] = [];
		}

		for (i = 0; i < len; i++) {
			for (j = 0; j < lenDataDiv; j++) {
				data0[j].push({
					"dataId": data[i][dataKey[0]],
					"dataValue": data[i][dataKey[j + 1]]
				})
			}
		}
	}

	if (len == 0) error = new TypeError('the csv file cannot be empty');
	if (lenDataDiv == 0) error = new TypeError('the fields of the csv file must be provided');

	cb(error, data0);
};
