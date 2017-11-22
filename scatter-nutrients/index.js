var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Chart = require('echarts');
var app = require('./dat.gui.js');
var originData = require('./nutrients.json')

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container = $(container);           //容器
  this.apis = config.apis;                 //hook一定要有
  this._data = null;                       //数据
  this.chart = null;                       //图表
  this.init(config);
}, {
  /**
   * 公有初始化
   */
  init: function (config) {
    //1.初始化,合并配置
    this.mergeConfig(config);
    //2.刷新布局,针对有子组件的组件 可有可无
    this.updateLayout();
    //3.子组件实例化
    //this.chart = new Chart(this.container[0], this.config);
    this.chart = Chart.init(this.container[0]);
    //4.如果有需要, 更新样式
    this.updateStyle();
  },
  /**
   * 绘制
   * @param data
   * @param options 不一定有
   * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
   */
  render: function (data, config) {
    var self = this;
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    this.chart.getZr().configLayer(1, {
      motionBlur: 0.5
    })
    var indices = {
        name: 0,
        group: 1,
        id: 16
    };
    var schema = [
      {name: 'name', index: 0},
      {name: 'group', index: 1},
      {name: 'protein', index: 2},
      {name: 'calcium', index: 3},
      {name: 'sodium', index: 4},
      {name: 'fiber', index: 5},
      {name: 'vitaminc', index: 6},
      {name: 'potassium', index: 7},
      {name: 'carbohydrate', index: 8},
      {name: 'sugars', index: 9},
      {name: 'fat', index: 10},
      {name: 'water', index: 11},
      {name: 'calories', index: 12},
      {name: 'saturated', index: 13},
      {name: 'monounsat', index: 14},
      {name: 'polyunsat', index: 15},
      {name: 'id', index: 16}
    ];
  
    var fieldIndices = schema.reduce(function (obj, item) {
      obj[item.name] = item.index;
      return obj;
    }, {});
    var groupCategories = [];
    var groupColors = [];
    var groupMap = {};
    originData.forEach(function (row) {
        var groupName = row[indices.group];
        if (!groupMap.hasOwnProperty(groupName)) {
            groupMap[groupName] = 1;
        }
    });

    for (var groupName in groupMap) {
        if (groupMap.hasOwnProperty(groupName)) {
            groupCategories.push(groupName);
        }
    }
    var hStep = Math.round(300 / (groupCategories.length - 1));
    for (var i = 0; i < groupCategories.length; i++) {
        groupColors.push(Chart.color.modifyHSL(cfg.pointColor, hStep * i));
    }
    cfg.visualMap[0]= Object.assign(cfg.visualMap[0], {
        type: 'piecewise',
        top: 20,
        realtime: false,
        categories: groupCategories,
        inRange: {
        color: groupColors
        },
        outOfRange: {
        color: ['#ccc']
        }
    });
    cfg.visualMap[1]= Object.assign(cfg.visualMap[1], {
        max: 1000,
        inRange: {
            colorLightness: [0.15, 0.6]
        }
    });
    cfg.series.forEach(function(element) {
        element.data = data.map(function (item, idx) {
            return [item[2], item[3], item[1], idx];
        })
    });
    
    //更新图表
    self.chart.setOption(cfg);
    app.config = {
        xAxis: 'protein',
        yAxis: 'calcium',
        onChange: function () {
            if (data) {
                self.chart.setOption({
                    xAxis: {
                        name: app.config.xAxis
                    },
                    yAxis: {
                        name: app.config.yAxis
                    },
                    series: {
                        data: data.map(function (item, idx) {
                            return [
                                item[fieldIndices[app.config.xAxis]],
                                item[fieldIndices[app.config.yAxis]],
                                item[1],
                                idx
                            ];
                        })
                    }
                });
            }
        }
    };
    
    var fieldNames = schema.map(function (item) {
      return item.name;
    }).slice(2);
    app.configParameters = {
        xAxis: {
            options: fieldNames
        },
        yAxis: {
            options: fieldNames
        }
    };
    var gui = new app.GUI(); 
    $(gui.domElement).css({  
      position: 'absolute',//应用后就看不到close controls，出现了滚动条
      right: 0,
      top: 0,
        zIndex: 1000
    });

    //$('.right-container').append(gui.domElement);
    $('#chart').append(gui.domElement);
    var configParameters = app.configParameters || {};
    for (var name in app.config) {
        var value = app.config[name];
        if (name !== 'onChange' && name !== 'onFinishChange') {
            var isColor = false;
            // var value = obj;
            var controller;
            if (configParameters[name]) {
                if (configParameters[name].options) {
                    controller = gui.add(app.config, name, configParameters[name].options);
                }
                else if (configParameters[name].min != null) {
                    controller = gui.add(app.config, name, configParameters[name].min, configParameters[name].max);
                }
            }
            if (typeof obj === 'string') {
                try {
                    var colorArr = echarts.color.parse(value);
                    isColor = !!colorArr;
                    if (isColor) {
                        value = echarts.color.stringify(colorArr, 'rgba');
                    }
                }
                catch (e) {}
            }
            if (!controller) {
                controller = gui[isColor ? 'addColor' : 'add'](app.config, name);
            }
            app.config.onChange && controller.onChange(app.config.onChange);
            app.config.onFinishChange && controller.onFinishChange(app.config.onFinishChange);
        }
    }
    // this.container.html(data[0].value)
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  /**
   *
   * @param width
   * @param height
   */
  resize: function (width, height) {
    this.updateLayout(width, height);
    //更新图表
    this.chart.render({
     width: width,
     height: height
    })
  },
  /**
   * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
   * 暂时可以不填内容
   */
  setColors: function () {
    //比如
    //var cfg = this.config;
    //cfg.color = cfg.theme.series[0] || cfg.color;
  },
  /**
   * 数据,设置和获取数据
   * @param data
   * @returns {*|number}
   */
  data: function (data) {
    if (data) {
      this._data = data;
    }
    return this._data;
  },
  /**
   * 更新配置
   * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
   * [注] 有数组的配置一定要替换
   * @param config
   * @private
   */
  mergeConfig: function (config) {
    if (!config) {return this.config}
    this.config.theme = _.defaultsDeep(config.theme || {}, this.config.theme);
    this.setColors();
    this.config = _.defaultsDeep(config || {}, this.config);
    return this.config;
  },
  /**
   * 更新布局
   * 可有可无
   */
  updateLayout: function () {},
  /**
   * 更新样式
   * 有些子组件控制不到的,但是需要控制改变的,在这里实现
   */
  updateStyle: function () {
    var cfg = this.config;
    this.container.css({
      'font-size': cfg.size + 'px',
      'color': cfg.color || '#fff'
    });
  },
  /**
   * 更新配置
   * !!注意:如果render支持第二个参数options, 那updateOptions不是必须的
   */
  //updateOptions: function (options) {},
  /**
   * 更新某些配置
   * 给可以增量更新配置的组件用
   */
  //updateXXX: function () {},
  /**
   * 销毁组件
   */
   destroy: function(){
    this.chart.dispose();
   }
});