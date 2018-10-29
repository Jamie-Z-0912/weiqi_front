const domain = 'https://item.njlime.com/';
const path = 'demo/';
const Routers = {
    data : {
        "login" : "/tapp/member/login",             //登录
        "studentInfo" : "/tapp/member/info",        //获取用户信息
        "exitLogin" : "/tapp/member/logout",        //退出登录
        "editPwd" : "/tapp/member/memberPwd",       //学员修改密码
        "headList" : "/tapp/member/headList",       //头像列表
        "editUserInfo" : "/tapp/member/update",     //
        "myScore" : "/tapp/point/myPoint",          //我的积分
        "myTools" : "/tapp/point/myGift",           //我的道具
        "myPrize":"/tapp/tower/myPrize",            //我的奖杯
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
        "towerList":"/tapp/tower/towerList",                         //修炼塔列表
        "checkTower":"/tapp/tower/checkTower",                      //进入修炼塔检测
        "gateList":"/tapp/tower/gateList",                           //关卡列表
        "curGate":"/tapp/tower/curGate",                             //当前关卡数据
        "startGate":"/tapp/tower/startGate",                        //开始关卡
        "firstQuestion":"/tapp/tower/firstQuestion",               //获取第一道题
        "answer":"/tapp/tower/answer",                               //题目回答
        "cardList":"/tapp/tower/cardList",                          //道具列表
        "useCard":"/tapp/tower/useCard",                            //使用道具
        "quitGate":"/tapp/tower/quitGate"                           //退出关卡
    },
    getBasePath : function(){
        return domain + path;
    },
    getRouter : function(_name){
        return 'undefined' === typeof this.data[_name] ? null : this.getBasePath() + this.data[_name];
    }
};

export default Routers;