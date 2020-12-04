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
    serviceId:"",
    switch:false,
    operate:"关闭",

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
    wx.startDeviceMotionListening({
      success(res){
        console.log("startGyro")
      },
      fail(res){
      },
      complete(res){
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.stopDeviceMotionListening();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.stopDeviceMotionListening();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
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
    var bufferstr = util.hexStringToBuff(message);
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

  switch:function(e){
    var stopCount =0;
    var that = this;
    that.data.switch = !that.data.switch;
    console.log(that.data.switch);
    if(that.data.switch){
      wx.onDeviceMotionChange(function(e){
        //手机竖拿，beta为前后方向(前为负，后为正)，gamma为左右方向（左为负，右为正），alpha为旋转方向
        if(e.beta < -10){
          that.setData({
            operate: "前进"
          }),
          stopCount = 0;
        }else if(e.beta > 20){
          that.setData({
            operate: "后退"
          }),
          stopCount = 0;
        }else if(e.gamma < -20){
          that.setData({
            operate: "左转"
          }),
          stopCount = 0;

        }else if(e.gamma >20){
          that.setData({
            operate: "右转"
          }),
          stopCount = 0;
        }else{
          stopCount++;
          if(stopCount >3){
            that.setData({
              operate: "停止"
            }),
            stopCount = 0;
          }
          
        }
      })
    }else{
      wx.offDeviceMotionChange();
      stopCount = 0;
      that.setData({
        operate: "关闭"
      })
    }
  },

    //调用this.send("");给蓝牙发送消息
})