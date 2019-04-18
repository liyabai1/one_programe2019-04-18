const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo: {
      title: "",
      img_url: "",
      text_author: "",
      date: "",
      content: "",
    },
    messages: null,   //从服务器获取的评论
    inputMsg: "",     //用户输入的评论
    inputValue: "", //用户的输入框 用来发送成功后返回空字符
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var _this = this;

    //获取到上一步点击的图片索引，然后定位到全局变量进行显示
    let index = options.index;
    
    _this.setData({
      photo: app.globalData.photo_data[index],
    })
    
    //获取文章评论
    _this.getMsgformSev();
  },

  /**
   * 用户输入--------获取输入的评论信息
   */
  getMsg: function(e){
    let msg = e.detail.value;
    this.setData({
      inputMsg: msg
    })
  },

  /**
   * 用户点击--------发送留言
   */
  sendMsg: function(){
    var _this = this;
    if (this.data.inputMsg != "" && app.globalData.userInfo) {
      let userInfo = app.globalData.userInfo;
      wx.request({
        url: 'https://hd215.api.yesapi.cn/?s=App.Market_Message.Post',
        data: {
          app_key: "E20CA094D3DA1114511A28AF185A35C8",
          message_content: _this.data.inputMsg,   //留言信息
          message_key: _this.data.photo.title,    //文章标记
          // message_nickname: userInfo, //用户的昵称
          more_data: {
            userName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          }
        },
        success(res){
          if (res.data.data.err_code == 0) {
            _this.setData({
              inputValue: ""
            })
            _this.getMsgformSev();
          }else{
            wx.showModal({
              title: '您可能遇到了预期之外的错误',
            })
          }
        }
      })
    }else if (app.globalData.userInfo == null){
      wx.showModal({
        title: '提示',
        content: '您目前还没有授权，请授权后进行评论',
      })
    }
  },
  /**
 * 获取当前文章的评论
 */
  getMsgformSev: function(){
    console.log("执行1")
    var _this = this;
    wx.request({
      url: 'https://hd215.api.yesapi.cn/?s=App.Market_Message.Show',
      data: {
        app_key: "E20CA094D3DA1114511A28AF185A35C8",
        message_key: _this.data.photo.title,
        more_select: "avatarUrl,userName",
        order: 1,
        page: 1,
        perpage: 100
      },
      success(res) {
        let resData = res.data.data.items;
        console.log(resData);
        _this.setData({
          messages: resData,
        })
      }
    })
  },
})
