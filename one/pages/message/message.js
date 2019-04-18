const md5 = require("../../utils/md5.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logBox: "block",
    name: "",
    password: "",
    messagesBox: "none",
    messageContent: ""
  },

  /**
   * 获取用户登录账号函数
   */
  getName: function(e){
    console.log(e.detail.value)
    this.setData({
      name: e.detail.value,
    })
  },

  /**
   * 获取用户密码函数
   */
  getPassword: function(e){
    console.log(e.detail.value);
    this.setData({
      password: e.detail.value,
    })
  },
  /**
   * 用户注册函数
   */
  log_in: function(){
    var _this = this;
    var app = app;
    if (this.name != "" && this.password != "") {
      let name = this.data.name;
      let password = md5.hexMD5(this.data.password);
      password = password.toLowerCase();
      console.log(password)
      wx.request({
        url: 'https://hd215.api.yesapi.cn/?s=App.User.Register',
        data: {
          app_key: "E20CA094D3DA1114511A28AF185A35C8",
          username: name,
          password: password,
        },
        success(res){
          console.log(res.data);
          if (res.data.data.err_code == 0) {
            console.log("注册成功");
            wx.showModal({
              title: '提示',
              content: '您已成功注册,可以登录',
            })
          }
          else if (res.data.data.err_code == 1) {
            console.log("此账号已被注册");
            wx.showModal({
              title: '提示',
              content: '您的账号已被注册',
            })
          }
          else if (res.data.data.err_code == -1) {
            console.log("注册人数已满")
            wx.showModal({
              title: "提示",
              content: "注册人数已满",
            })
          }
        }
      })
    }else{
      console.log("请检查输入")
    }
  },

  /**
   * 用户登录函数
   */
  logIn: function(){
    var _this = this;
    if (this.name != "" && this.password != "") {
      let name = this.data.name;
      let password = md5.hexMD5(this.data.password);
      password = password.toLowerCase();
      wx.request({
        url: 'https://hd215.api.yesapi.cn/?s=App.User.Login',
        data: {
          app_key: "E20CA094D3DA1114511A28AF185A35C8",
          username: name,
          password: password,
        },
        success(res) {
          console.log(res.data);
          if (res.data.data.err_code == 0) {
            console.log("登录成功");
            let uuid = res.data.data.uuid

            //全局变量拿到用户的uuid和用户名
            app.globalData.userName = _this.data.name;
            app.globalData.uuid = res.data.data.uuid;
            let admin_uuid = "68FA352F96D59D0E2AE76DE269609144";
            if (res.data.data.uuid == admin_uuid) {
              /**
               * 管理员登录后可以给第二天的首页留言
               */
              app.globalData.admin = true;
              _this.admin("admin");

            }else{
              wx.showModal({
                title: '很抱歉',
                content: '改账号不是管理员账号，请使用管理员帐号登录',
              })
            }
          } else if (res.data.data.err_code == 1) {
            wx.showModal({
              title: "提示",
              content: "登录失败\n账号不存在"
            })
          } else if (res.data.data.err_code == 2) {
            wx.showModal({
              title: "提示",
              content: "登录失败\n密码错误或已被封号"
            })
          }else{
            wx.showModal({
              title: "提示",
              content: res.data.data.err_msg
            })
          }
          console.log(app.globalData)
        }
      })
    } else {
      console.log("请检查输入")
    }
  },

  /**
   * 管理员登录后的处理
   */
  admin: function(){
    this.setData({
      logBox: "none",
      messagesBox: "block"
    })
    console.log(app.globalData)
  },

  /**
   * 管理员提交留言
   */
  submitMsg: function () {  
    //管理员提交应该和普通的评论分开
    var _this = this;
    console.log("管理员提交留言")
    if (this.data.messageContent != "") {
      wx.request({
        url: 'https://hd215.api.yesapi.cn/?s=App.Market_Message.Post',
        data: {
          app_key: "E20CA094D3DA1114511A28AF185A35C8",
          message_key: "admin",
          message_content: _this.data.messageContent,
          userName: app.globalData.userInfo.nickName
        },
        success(res){
          if (res.data.data.err_code == 0) {
            wx.showModal({
              title: '提交成功',
              content: '您的留言会发布在明天的小程序首页',
            })
          } else if (res.data.data.err_code > 0) {
            wx.showModal({
              title: '提示',
              content: '业务失败',
            })
          } else if (res.data.data.err_code < 0) {
            wx.showModal({
              title: '提示',
              content: '系统失败',
            })
          }

        }

      })
    }
  },

  /**
   * 获取用户留言
   */
  getMessage: function(e){
    this.setData({
      messageContent: e.detail.value,
    })
  },
  /**
   * 点击左上角按钮返回主页
   */
  backHome: function(){
    wx.navigateBack({
      url: "../index/index"
    })
  }
})
