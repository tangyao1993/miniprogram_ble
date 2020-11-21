var util = require('../../utils/util.js');


// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceId:"",
    services:[],
    characteristicId:"",
    serviceId:""

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var deviceId = options.deviceId;
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId,
      success (res) {
        var services = res.services;
        console.log('device services:', services);
        that.setData({
          services: services,
          deviceId:deviceId

        });
        
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    setTimeout(function() {
      // 必须在这里的回调才能获取
      wx.onBLECharacteristicValueChange(function(characteristic) {
        console.log('characteristic value comed:', characteristic);
        var a = ab2hex(characteristic.value);
        console.log("中文:");
        console.log(a);
      })
   }, 2000);
    

  },

  /**
   * ArrayBuffer转字符串
   * @param {ArrayBuffer} e 需要转换的ArrayBuffer类型数值
   * @param {function} t 转换成功后的回调
   */
  getUint8Value:function(e) {
    for (var a = e, i = new DataView(a), n = "", s = 0; s < i.byteLength; s++) n += String.fromCharCode(i.getUint8(s));
    return n;
  },

  

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  send:function(message){
    var that = this;
    var services = that.data.services;
    var deviceId = that.data.deviceId;
    for (var index = 0; index < services.length; index++) {
      const element = services[index];
      var serviceId = element.uuid;
      wx.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
        success: (res) => {
          console.log('getBLEDeviceCharacteristics success', res.characteristics)
          for (let i = 0; i < res.characteristics.length; i++) {
            let item = res.characteristics[i]
            if (item.properties.read) {
              wx.readBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
              })
            }
            if (item.properties.write) {
              this._deviceId = deviceId
              this._serviceId = serviceId
              this._characteristicId = item.uuid
              this.writeBLECharacteristicValue(message)
            }
            if (item.properties.notify || item.properties.indicate) {
              wx.notifyBLECharacteristicValueChange({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
                state: true,
              })
            }
          }
        },
        fail(res) {
          console.error('getBLEDeviceCharacteristics', res)
        }
      })
    }
  },



  writeBLECharacteristicValue(message) {
    var strArray = "666";
    var bufferstr = util.hexStringToBuff(strArray);
 
 
    console.log("发送服务码：" + this._characteristicId)
 
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: bufferstr,
      complete:res=>{
        console.log(res);
        // this.setData({
        //   shuju:res
        // })
      }
    })
  },

  up: function () {
    this.send("123");
  },
})

// 字符串转byte
function stringToBytes(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
    array[i] = str.charCodeAt(i);
  }
  console.log(array);
  return array.buffer;
}