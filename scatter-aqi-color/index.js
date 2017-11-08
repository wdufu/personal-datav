var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Chart = require('echarts');

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
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    cfg.color = cfg.color.map(function (item) {
      return item.value;
    })
    cfg.series.forEach(function (element) {
      element.data = element.data || [];
      var arr = [];
      data.forEach(function (item) {
        if (element.name === item.city) {
          var arrItem = [];
          Object.keys(item).forEach(function (key) {
            arrItem.push(item[key]);
          });
          arr.push(arrItem.slice(0, arrItem.length - 1));
        }
      })
      element.data = arr;
    });
    var schema = [
      {name: 'date', index: 0, text: '日'},
      {name: 'AQIindex', index: 1, text: 'AQI指数'},
      {name: 'PM25', index: 2, text: 'PM2.5'},
      {name: 'PM10', index: 3, text: 'PM10'},
      {name: 'CO', index: 4, text: '一氧化碳（CO）'},
      {name: 'NO2', index: 5, text: '二氧化氮（NO2）'},
      {name: 'SO2', index: 6, text: '二氧化硫（SO2）'}
    ];
    cfg.visualMap.forEach(function (element) {
      var text = element.text;
      element.text = [text];
      if (element.inRange.symbolSize) {
        element.inRange.symbolSize = JSON.parse(element.inRange.symbolSize);
      }
      if (element.inRange.colorLightness) {
        element.inRange.colorLightness = JSON.parse(element.inRange.colorLightness);
      }
      if (element.outOfRange.symbolSize) {
        element.outOfRange.symbolSize = JSON.parse(element.outOfRange.symbolSize);
      }
      var outOfRangeColor = element.outOfRange.color;
      element.outOfRange.color = [outOfRangeColor];
      element.controller.inRange.color = [element.controller.inRange.color];
      element.controller.outOfRange.color = [element.controller.outOfRange.color];
    })
    cfg.tooltip.formatter = function (obj) {
      var value = obj.value;
      return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
        + obj.seriesName + ' ' + value[0] + '日：'
        + value[7]
        + '</div>'
        + schema[1].text + '：' + value[1] + '<br>'
        + schema[2].text + '：' + value[2] + '<br>'
        + schema[3].text + '：' + value[3] + '<br>'
        + schema[4].text + '：' + value[4] + '<br>'
        + schema[5].text + '：' + value[5] + '<br>'
        + schema[6].text + '：' + value[6] + '<br>';
    }
    //更新图表
    this.chart.setOption(cfg);
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