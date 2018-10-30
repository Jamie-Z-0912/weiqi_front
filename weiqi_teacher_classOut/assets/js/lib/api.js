const domain = 'https://item.njlime.com/';
const path = 'demo/';
const Routers = {
    data : {
        "login" : "/tapp/login",                                     //登录
        "teacherInfo" : "/tapp/teacherInfo",        //获取用户信息
        "exitLogin" : "/tapp/logout",               //退出登录
        "resource": '/tapp/res/list',               //课时资源列表
        "classList" : "/tapp/class/classList",     //班级列表
        "classTimeList" : "/tapp/class/courseTimeList", //课程课次列表: 选择班级后获取该班级课程节次
        "classHourList" : "/tapp/class/courseHourList", //课程课时列表: 选择节次后获取该节次课时列表
        "practiceList" : "/tapp/res/practiceList", //课时练习列表
        "memberList" : "/tapp/class/memberList",   //学员列表
        "sendCheck" : "/tapp/class/practiceSend",   //布置作业
        "teacherRecord": "/tapp/class/teacherRecord", //绩效查询
        "practiceMemberList": "/tapp/class/practiceMemberList",            //学生列表(布置作业用)
        "userPracticeList":"/tapp/class/userPracticeList",   //待批改作业学生列表
        "practiceDetailList":"/tapp/class/practiceDetailList", //未批改作业题目列表
        "teacherClass":"/tapp/class/teacherClass",   //教师排课列表
        "correctPractice": "/tapp/class/correctPractice",              //批改作业
        "backPractice": "/tapp/class/backPractice"          //订正作业
    },
    getBasePath : function(){
        return domain + path;
    },
    getRouter : function(_name){
        return 'undefined' === typeof this.data[_name] ? null : this.getBasePath() + this.data[_name];
    }
};

export default Routers;