const app = getApp();
Page({
  data: {
    dataList: [],
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.openBluetoothAdapter({
      success(res) {
        console.log(res)
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.startBluetoothDevicesDiscovery({
      success(res) {
        console.log(res);
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.stopBluetoothDevicesDiscovery({
      success(res) {
        console.log(res)
      }
    })

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.stopBluetoothDevicesDiscovery({
      success(res) {
        console.log(res)
      }
    })

  },

  getBle:function(e) {
    var self = this;
    wx.getBluetoothDevices({
      success: function (res) {
        console.log(res)
        if (res.devices) {
          console.log("蓝牙设备")
          self.setData({
            dataList: res.devices
          });
          wx.stopPullDownRefresh();
        }
      }
    })
  },


  connectBle:function(e){
    var deviceId = e.currentTarget.dataset.id; //打印可以看到，此处已获取到了对应的id
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId,
      success (res) {
        if(res.errCode==0){
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 2000
           });

           wx.navigateTo({
            url: '../direction_controller/direction_controller?deviceId='+deviceId
          });
        }else{
          wx.showToast({
            title: '连接失败',
            icon: 'success',
            duration: 2000
           })
        }
        console.log(res)
      }
    })
  }
})