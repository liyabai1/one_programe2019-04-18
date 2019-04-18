//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');

//开眼视频请求数据
const one_videoData = wx.request({
  url: 'https://api.apiopen.top/todayVideo',
  success(res){
    console.log(res.data)
  }
})


//https://www.apiopen.top/journalismApi   新闻接口
//https://www.apiopen.top/satinApi?type=1&page=1  段子接口
//https://uploadbeta.com/api/pictures/random/?key=BingEverydayWallpaperPicture 图片

Page({
  data: {
    hasUserInfo: false,
    user: {
      imageUrl: "",
      name: "",
    },
    nav_class_change:{
      pic: {
        display: "",
        color: ""
      },
      vid: {
        display: "",
        color: ""
      },
      mus: {
        display: "",
        color: ""
      },
      mine: {
        display: "",
        color: ""
      },
    },
    contentHeight: "",
    pageTitle: "图片",
    date: "",
    weather: "",
    tmp_min: "",
    tmp_max: "",
    photoPageData: [],

    display: "block" //用户授权显示
  },
  /**
   * 获取用户授权
   */
  getUserInfo: function(){
    var _this = this;
    if (app.globalData.userInfo) {
      _this.setData({
        display: "none",
        hasUserInfo: true,
        user: {
          imageUrl: app.globalData.userInfo.avatarUrl,
          name: app.globalData.userInfo.nickName,
        }
      })
    }
    else{
      wx.getUserInfo({
        success(res) {
          console.log(res);
          _this.setData({
            display: "none",
            hasUserInfo: true,
            user: {
              imageUrl: res.userInfo.avatarUrl,
              name: res.userInfo.nickName,
            }
          })
          app.globalData.userInfo = res.userInfo
        }
      })
    }
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo)
      this.setData({
        display: "none",
        hasUserInfo: true,
        user: {
          imageUrl: app.globalData.userInfo.avatarUrl,
          name: app.globalData.userInfo.nickName,
        }
      })
    }
    var _this = this;
    
    //时间只取日期
    let date = util.formatTime(new Date);
        date = date.substring(0,10);
    this.setData({
      date: date,
    })
    //改变显示内容的高度
    // let height = wx.getSystemInfoSync().windowWidth;
    // height = height * 0.9;
    // this.setData({
    //   contentHeight: height
    // })


    //获取天气信息
    let weather = wx.request({
      url: 'https://free-api.heweather.com/s6/weather/forecast',
      data: {
        location: "CN101110114",
        key: "75fc8c76b6a14e4591a224f0a030de9e"
      },
      success(res) {
        let tmp_min = res.data.HeWeather6["0"].daily_forecast["0"].tmp_min;
        let tmp_max = res.data.HeWeather6["0"].daily_forecast["0"].tmp_max;
        let weatherData = res.data.HeWeather6["0"].daily_forecast["0"].cond_txt_d;
        _this.setData({
          weather: weatherData,
          tmp_min: tmp_min,
          tmp_max: tmp_max
        })
      },
      fail(){
        _this.setData({
          weather: "天气",
          tmp_min: "获取失败"
        })
      }

    })

    /**
   * 获取页面数据
   */
    //一个·one 推送
    wx.request({
      url: 'https://one.mssnn.cn',
      success(res) {
        console.log(res.data)
        _this.setData({
          photoPageData: res.data.data,
        })

        //获取管理员的评论信息
        _this.getAdminMsg();

        console.log(_this.data)
        app.globalData.photo_data = _this.data.photoPageData;
      }
    })
  },
  /**
   * 图片预览
   */
  prevImg: function(e){
    let data = e.currentTarget.dataset;
    let imgList = new Array;
    for (var i = 0; i < this.data.photoPageData.length; i ++) {
      imgList.push(this.data.photoPageData[i].img_url);
    }
    wx.previewImage({
      urls: imgList,
      current: data.src
    })
  },
  /**
   * 页面跳转至留言系统
   */
  navToMessage: function(){
    wx.navigateTo({
      url: '../message/message',
    })
  },

/**
 * 跳转至图片的详情页
 */
  nav_content: function(e){
    let id = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../photoContent/photoContent?index=' + id,
    })
  },

  /**
   * 页面跳转至图片页函数
   */
  nav_pagePhoto: function(){
    //首先进行页面显示的切换
    this.setData({
      nav_class_change: {
        pic: {
          display: ".nav_change_display_block",
          color: ".nav_change_color_y"
        },
        vid: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mus: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mine: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
      }
    })
  },

  /**
   * 获取管理员首页发布信息
   */
  getAdminMsg: function(){
    var _this = this;
    //获取管理员发布信息
    wx.request({
      url: 'https://hd215.api.yesapi.cn/?&service=App.Market_Message.Show&message_key=admin&order=2&page=1&perpage=10',
      data: {
        app_key: "E20CA094D3DA1114511A28AF185A35C8",
      },
      success(res){
        let data = res.data.data.items[0];

        data.content = data.message_content;
        console.log(data)
        data.img_url = "";
        data.date = data.message_post_time.substring(0,10);

        data.picture_author = "随机";
        data.text_authors = "admin";
        data.title = "",
        delete data.message_post_time;
        delete data.id
        delete data.message_pid;
        delete data.message_content;

       

        //获取随机图片为管理员的发布配图
        wx.request({
          url: 'https://hd215.api.yesapi.cn/?service=App.Common_Faker.Image&total=3&app_key=E20CA094D3DA1114511A28AF185A35C8&sign=74F5D537645D93685FB5EC696AB4C5B7',
          success(res){
            console.log(res.data.data.items)
            console.log(data.img_url)
            let picDataUrl = res.data.data.items.imageUrl[0];
            data.img_url = picDataUrl;
            var temp;
            temp = _this.data.photoPageData;
            temp.push(data)
            _this.setData({
              photoPageData: temp,
            })
          }
        })
        
      }
    })
  },

  /**
   * 页面跳转至【视频】页函数
   */
  nav_pageVideo: function () {
    //首先进行页面显示的切换
    this.setData({
      nav_class_change: {
        pic: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        vid: {
          display: ".nav_change_display_block",
          color: ".nav_change_color_y"
        },
        mus: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mine: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
      }
    })
  },



  /**
   * 页面跳转至【音乐】页函数
   */
  nav_pageMusic: function () {
    //首先进行页面显示的切换
    this.setData({
      nav_class_change: {
        pic: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        vid: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mus: {
          display: ".nav_change_display_block",
          color: ".nav_change_color_y"
        },
        mine: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
      }
    })
  },



  /**
   * 页面跳转至【我的】页函数
   */
  nav_pageMine: function () {
    //首先进行页面显示的切换
    this.setData({
      nav_class_change: {
        pic: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        vid: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mus: {
          display: ".nav_change_display_none",
          color: ".nav_change_color_b"
        },
        mine: {
          display: ".nav_change_display_block",
          color: ".nav_change_color_y"
        }
      }
    })
  },
})
