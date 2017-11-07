var fs = require('fs');

var initialData = [
  [
      [10.0, 8.04],
      [8.0, 6.95],
      [13.0, 7.58],
      [9.0, 8.81],
      [11.0, 8.33],
      [14.0, 9.96],
      [6.0, 7.24],
      [4.0, 4.26],
      [12.0, 10.84],
      [7.0, 4.82],
      [5.0, 5.68]
  ],
  [
      [10.0, 9.14],
      [8.0, 8.14],
      [13.0, 8.74],
      [9.0, 8.77],
      [11.0, 9.26],
      [14.0, 8.10],
      [6.0, 6.13],
      [4.0, 3.10],
      [12.0, 9.13],
      [7.0, 7.26],
      [5.0, 4.74]
  ],
  [
      [10.0, 7.46],
      [8.0, 6.77],
      [13.0, 12.74],
      [9.0, 7.11],
      [11.0, 7.81],
      [14.0, 8.84],
      [6.0, 6.08],
      [4.0, 5.39],
      [12.0, 8.15],
      [7.0, 6.42],
      [5.0, 5.73]
  ],
  [
      [8.0, 6.58],
      [8.0, 5.76],
      [8.0, 7.71],
      [8.0, 8.84],
      [8.0, 8.47],
      [8.0, 7.04],
      [8.0, 5.25],
      [19.0, 12.50],
      [8.0, 5.56],
      [8.0, 7.91],
      [8.0, 6.89]
  ]
];

var finalData = [];

initialData.forEach(function (data, index) {
  var s = 'I';
  if (index === 1) {
    s = 'II';
  }
  if (index === 2) {
    s = 'III';
  }
  if (index === 3) {
    s = 'IV';
  }
  data.forEach(function (item) {
    var obj = {};
    obj.x = item[0];
    obj.y = item[1];
    obj.s = s;
    finalData.push(obj);
  })
})

var filename = "/Users/gaopeng/Documents/business/personal-datav/getdata/data.json";
fs.writeFileSync(filename, JSON.stringify(finalData));
