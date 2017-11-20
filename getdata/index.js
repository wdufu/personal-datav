/**
 * @Author: gaopeng
 * @Date:   2017-11-07 13:13:44
 * @Last modified by:   gaopeng
 * @Last modified time: 2017-11-15 19:39:53
 */

var fs = require('fs');
var moment = require('./moment.min');

var finalData = [];

function getVirtulData(year) {
    year = year || '2017';
    var date = moment(year + '-01-01');
    var end = moment((+year + 1) + '-01-01');
    var dayTime = 3600 * 24 * 1000;
    var data = [];
    for (var time = date; time < end; time += dayTime) {
        data.push([
            moment(time).format('YYYY-MM-DD'),
            Math.floor(Math.random() * 1000),
            year
        ]);
    }
    return data;
}

var originData = [2015, 2016, 2017].map(function (year) {
  return getVirtulData(year)
});

originData.forEach(function (element) {
  var arr = element.map(function(data) {
    return {
      x: data[0],
      y: data[1],
      s: data[2]
    }
  })
  finalData.push(arr);
});

console.log(finalData);
// var filename = "/Users/gaopeng/Documents/business/personal-datav/getdata/lines-bus.json";

var dataFilename = "/Users/gaopeng/Documents/business/personal-datav/getdata/data.json";
fs.writeFileSync(dataFilename, JSON.stringify(finalData));
// fs.readFile(filename, function(err, data){
//     fs.writeFileSync(dataFilename, JSON.stringify(normalizeData(JSON.parse(data))));
// });
