const PageLinks = {
    data : {
        login : 'index.html',           //登录页
        main : 'classIn.html',          //主菜单页
        assignWork : 'assignWork.html',//布置作业
        correctWork: 'correctWork.html', //批改作业
        courseSelect: 'courseSelect.html', //排课查询
        archieveSelect: 'archieveSelect.html'//绩效查询
    },
    linkTo : function(_name, _callback){
        'string' === typeof this.data[_name] ? (function(url){
            window.location.href = url;
        })('' + this.data[_name]) : 'function' === typeof _callback && _callback(this.data[_name]);
    }
};

export default PageLinks;