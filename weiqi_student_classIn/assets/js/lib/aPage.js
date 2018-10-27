const PageLinks = {
    data : {
        login : 'index.html',               //登录页
        main : 'classIn.html',              //主菜单页
        editHeadUrl : 'editHeadUrl.html',   //修改头像
        personal : "personal.html",         //个人中心
        classroom : 'classroom.html',       //在线学习
        homework : 'homework.html',         //课堂作业
    },
    linkTo : function(_name, _callback){
        'string' === typeof this.data[_name] ? (function(url){
            window.location.href = url;
        })('' + this.data[_name]) : 'function' === typeof _callback && _callback(this.data[_name]);
    }
};

export default PageLinks;