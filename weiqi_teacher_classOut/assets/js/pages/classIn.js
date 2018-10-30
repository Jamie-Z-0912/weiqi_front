(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _message = new $Request.dialog({                //提示信息弹框
            animateName : 'messageScale'
        }),
        $Links = {
            onlineLink : 'classIn_online.html',             //在线学习
            classInLink : 'classIn_seatWork.html',          //课堂作业
            personalLink : 'javascript:;',                  //个人中心
            getLink : function(name){
                return 'string' === typeof this[name] && this[name];
            }
        };

    //加载用户信息
    function loadUserInfo(){
        var _userData = _cookie.data();
        $Request.getInfo($Request.getRouter('teacherInfo'), {id : _userData['_userId']}, function(data){
            _loading.hideIt();      //隐藏加载框
            console.log(data);

            if(parseInt(data['resCode'])){
                if('undefined' !== typeof data['resultList']){
                    data['resultList']['basePath'] = $Request.basePath;
                    $('#headWrap').html(template('tpl-user', data['resultList']));
                }
            }else{
                var _msg = '加载信息错误！请重新登录...';
                if('string' === typeof data['message']){
                    _msg += data['message'];
                }
                alert(_msg);
                $Request.linkTo('login');       //返回登录页
            }
        });
    }

    //退出登录
    function exitLogin(){
        $Request.postInfo($Request.getRouter('exitLogin'), {}, function(data){
            if('undefined'!== typeof data['resCode'] && parseInt(data['resCode'])){
                _cookie.clearUser();
                $Request.linkTo('login');       //返回登录页
            }
        });
    }

    //加载事件
    function loadEvent(){
        //退出按钮
        $(document).on('click', '#historyBack', function(){
            _message.setContent(template('tpl-alert', {
                message : '确认要退出吗？'
            })).showIt();
        });

        //确认退出，结束课时
        $(document).on('click', 'button.btn-exit-okay', function(){
            exitLogin();                          //退出登录，清空cookie
        });

        //栏目跳转
        $(document).on('click', 'ul#navList li', function(){
            var _id = parseInt($(this).data('id'));
            if(!isNaN(_id)){
                switch (_id){
                    case 1:
                        $Request.linkTo('assignWork');    //布置作业
                        break;
                    case 2:
                        $Request.linkTo('courseSelect');  //排课查询
                        break;
                    case 3:
                        $Request.linkTo('correctWork');   //批改作业
                        break;
                    case 4:
                        $Request.linkTo('archieveSelect'); //绩效查询
                        break;
                    default:
                        $Request.linkTo('login');          //Error,返回登录页
                }
            }
        });
    }

    $(function(){
        //console.log($Links.getLink("onlineLink"));
        if(_cookie.hasInfo()){
            loadUserInfo();
            loadEvent();
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});