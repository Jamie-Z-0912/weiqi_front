const domain = 'https://xqn.njlime.com/';
const path = 'demo/';
const Routers = {
    data : {
        "login" : "/tapp/member/login",                                     //登录
        "studentInfo" : "/tapp/member/info",        //获取用户信息
        "exitLogin" : "/tapp/member/logout",               //退出登录
        "headList" : "/tapp/member/headList",       //头像列表
        "editUserInfo" : "/tapp/member/update",     //
        "myScore" : "/tapp/point/myPoint",          //我的积分
        "myTools" : "/tapp/point/myGift",           //我的道具
        "getGift" : "/tapp/point/exchange",         //兑换奖品
        "myStore" : "/tapp/point/giftList",         //礼品商场
        "changeHead" : "/tapp/member/changeClothes",    //修改头饰
        "resource" : "/tapp/res/list",                  //资源列表
        "classList" : "/tapp/class/memberClassList",    //班级信息
        "classTime" : "/tapp/class/courseTimeList",     //课次信息
        "classHourList" : "/tapp/class/courseHourList", //课时信息
        "resourceList" : "/tapp/class/userPracticeDetailList",          //课堂资源
        "answerInfo" : "/tapp/class/userAnswer",                  //题目提交
        "homeworkSubmit" : "/tapp/class/userPracticeSubmit",        //作业提交
    },
    getBasePath : function(){
        return domain + path;
    },
    getRouter : function(_name){
        return 'undefined' === typeof this.data[_name] ? null : this.getBasePath() + this.data[_name];
    }
};

export default Routers;