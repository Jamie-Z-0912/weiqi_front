//(function(date){ return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate(); })(new Date(new Date().getTime() - 1373 * 24 * 60 * 60 * 1000));

(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),              //实例化加载图标
        _loginForm = $('form#loginForm'),                       //表彰对象
        _cookie = $Request.getCookies(),                        //用户信息
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        });

    //表单校验
    function validateForm(data){
        return 'undefined' !== typeof data['mobile'] && 'undefined' !== data['password'] && '' != $.trim(data['mobile']) && '' != $.trim(data['password']);
    }

    function loginMain(formData){
        //请求
        $Request.getInfo($Request.getRouter('login'), formData, function(data){
            console.log(data);
            //登录成功
            if('undefined' !== typeof data['resCode'] && parseInt(data['resCode']) == 1){
                _cookie.setInfo(data['resultList']['id'], data['resultList']['name'], formData['mobile'], formData['password']);
                $Request.linkTo('main');      //进入主界面
            }
            //信息提示 或 错误提示
            else if('string' === typeof data['message']){
                _message.setContent(template('tpl-alert', {
                    message : data['message']
                })).showIt();
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
                _message.setContent(template('tpl-alert', {
                    message : '请输入登录信息！'
                })).showIt();
            }
        });

        //alert
        $(document).on('click', 'button.btn-alert-okay', function(){
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