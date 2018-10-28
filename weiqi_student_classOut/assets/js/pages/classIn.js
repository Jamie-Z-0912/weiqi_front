(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        });

    //加载用户信息
    function loadUserInfo(){
        $Request.getInfo($Request.getRouter('studentInfo'), {}, function(data){
            _loading.hideIt();      //隐藏加载框

            if(parseInt(data['resCode'])){
                if('undefined' !== typeof data['resultList']){
                    data['resultList']['basePath'] = $Request.basePath;
                    _cookie.setUnit_id( data['resultList']['unit_id']);
                    $('#headWrap').html(template('tpl-user', data['resultList']));
                }
            }else{
                var _msg = '加载信息错误！请重新登录...';
                if('string' === typeof data['message']){
                    _msg += data['message'];
                }
                _message.setContent(template('tpl-message', {message : _msg, 'button' : 'btn-loading-error'})).showIt();
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
        //数据加载错误
        $(document).on('click', 'button.btn-loading-error', function(){
            _message.hideIt();
        });

        //返回上一页按钮
        $(document).on('click', '#historyBack', function(){
            _message.setContent(template('tpl-message', {message : '确认要退出吗？', 'button' : 'btn-exit-okay'})).showIt();
        });

        //退出
        $(document).on('click', 'button.btn-exit-okay', function(){
            exitLogin();
        });

        //修改头像
        $(document).on('click', '#headWrap', function(){
            _message.setContent(template('tpl-message', {message : '确认要修改头像吗？', 'button' : 'btn-editHead-okay'})).showIt();
        });

        //确认修改头像
        $(document).on('click', 'button.btn-editHead-okay', function(){
            $Request.linkTo('editHeadUrl');
        });

        //栏目跳转
        $(document).on('click', 'ul#navList li', function(){
            var _id = parseInt($(this).data('id'));
            if(!isNaN(_id)){
                switch (_id){
                    case 1: $Request.linkTo('classAfter'); break;
                    case 2: $Request.linkTo('homework');break;
                    case 3: $Request.linkTo('tower');break;
                    case 4: $Request.linkTo('personal');break;
                    default: $Request.linkTo('login');break;
                }
            }
            //end
        });
    }

    $(function(){
        if(_cookie.hasInfo()){
            loadUserInfo();
            loadEvent();
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});