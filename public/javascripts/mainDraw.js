/*
 * Created by G on 11/03/2016.
 */


var i, j, len, histText, corrText;

var myDraw = new NqmStatDraw();

var drawId = "body";

$.get('/mdv', function (mdvT) {
    console.log(mdvT);

    len = mdvT.length;
    for (i = 0; i < len; i++) {
        //sd: P--population or S--sample
		histText = "Data: " + mdvT[i].dataNM + "; mean: " + d3.format(".4f")(mdvT[i].mean) + "; Standard Deviation: " + d3.format(".4f")(mdvT[i].sdS) + "; Skewness: " + d3.format(".4f")(mdvT[i].skewnessS) + "; Kurtosis: " + d3.format(".4f")(mdvT[i].kurtosisS);

        myDraw.histogram(mdvT[i].data, drawId, histText, 1); //1: the flag to draw line chart for the histogram; 1--true, 0--false (default)
    }
});

$.get('/corr', function (corrT) {
    console.log(corrT);

    len =corrT.length;
    for (i = 0; i < len; i++) {
        corrText = "Data: " + corrT[i].data1NM + " and " + corrT[i].data2NM + "; Correlation coefficient: " + d3.format(".4f")(corrT[i].corr);

        myDraw.corrDraw(corrT[i].data1, corrT[i].data2, d3.format(".4f")(corrT[i].corr), drawId, corrText);
    }
});
