/**
 *
 */
(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),              //实例化加载图标
        _loginForm = $('form#loginForm'),                       //表彰对象
        _dialog = new $Request.dialog(),            //联系电话弹框
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        }),
        _cookie = $Request.getCookies();                        //用户信息

    //表单校验
    function validateForm(data){
        return 'undefined' !== typeof data['mobile'] && 'undefined' !== data['password'] && '' != $.trim(data['mobile']) && '' != $.trim(data['password']);
    }

    //登录请求
    function loginMain(formData){
        //请求
        $Request.getInfo($Request.getRouter('login'), formData, function(data){
            //登录成功
            if('undefined' !== typeof data['resCode'] && parseInt(data['resCode']) == 1){
                _cookie.setInfo(data['resultList']['id'], data['resultList']['name'], formData['mobile'], formData['password'], data['resultList']['unit_id'], data['resultList']['unit_id']);
                $Request.linkTo('main');      //进入主界面
            }
            //信息提示 或 错误提示
            else if('string' === typeof data['message']){
                _message.setContent(template('tpl-message', {message : data['message']}));
                _message.showIt();
                _loading.hideIt();      //隐藏加载图标
            }
        });
    }

    //加载事件
    function loadEvent(){
        //登录 事件
        $(document).on('click', 'button#btnSubmit', function(){
            var formData =  window.parseQueryString(_loginForm.serialize());        //获取json数据

            //校验用户信息 是否填写
            if('object' === typeof formData &&　validateForm(formData)){
                loginMain(formData);
            }else{
                _message.setContent(template('tpl-message', {message : '请输入完整登录信息!'}));
                _message.showIt();
            }
        });

        //渲染忘记密码 弹框
        _dialog.setContent(template('tpl-telPhone', {}));

        //忘记密码
        $(document).on('click', 'a#btnForget', function(){
            _dialog.showIt();
        });

        //修改密码
        $(document).on('click', 'a#btnChange', function(){
            $Request.linkTo('editPwd');
        });

        //关闭信息提示框
        $(document).on('click', 'button.btn-message-okay', function(){
            _message.hideIt();
        });

    }


    $(function(){
        loadEvent();
        //如果存在，直接登录
        if(_cookie.hasInfo()){
            var _data = _cookie.data();
            loginMain({mobile: _data['_mobile'], password: _data['_password']});
        }else{
            _loading.hideIt();      //隐藏加载图标
        }

    });
});