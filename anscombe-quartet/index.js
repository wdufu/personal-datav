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
    cfg.series.forEach(function(element) {
      element.data = element.data || [];
      element.markLine.tooltip = element.markLine.tooltip || {};
      element.markLine.label.normal.formatter= element.markLine.label.normal.formatter || '';
      var dataArr = [];
      data.forEach(function(item) {
        var itemArr = [];
        if (element.name === item.s) {
          itemArr.push(item.x);
          itemArr.push(item.y);
          dataArr.push(itemArr);
        }
      });
      var xArr = [];
      var yArr = [];
      element.data = dataArr;
      dataArr.forEach(function (item) {
        xArr.push(item[0]);
        yArr.push(item[1]);
      });
      var xSum = 0;
      var ySum = 0;
      for (let i = 0; i < xArr.length; i++) {
        xSum += xArr[i];
      }
      for (let i = 0; i < yArr.length; i++) {
        ySum += yArr[i];
      }
      var xa = xSum / xArr.length;
      var ya = ySum / yArr.length;
      var Lxx = 0;
      var Lxy = 0;
      for(i=0; i < xArr.length; i++){
          Lxx += ((xArr[i] - xa) * (xArr[i] - xa));
          Lxy += ((yArr[i] - xa) * (yArr[i] - ya));
      }
      var b = Lxy / Lxx;
      var a = ya - b * xa;
      element.markLine.tooltip.formatter= 'y = ' + b.toFixed(1) + ' * x + ' + a.toFixed(1);
      element.markLine.label.normal.formatter = 'y = ' + b.toFixed(1) + ' * x + ' + a.toFixed(1);
    })
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
    this.chart.resize({
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