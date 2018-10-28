(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _editForm,
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        });

    function returnMsgButton(msg){
        return {message : msg, buttons : true, btn : 'btn-message-okay'}
    }

    //校验修改信息
    function validateForm(data){
        if('string' === typeof data['mobile'] && '' == $.trim(data['mobile'])) {
            _message.setContent(template('tpl-message', returnMsgButton( '请输入手机号码!') )).showIt();
            return false;
        }else if('string' === typeof data['old_password'] && '' == $.trim(data['old_password'])){
            _message.setContent(template('tpl-message', returnMsgButton( '请输入原始密码!') )).showIt();
            return false;
        }else if('string' === typeof data['password'] && '' == $.trim(data['password'])){
            _message.setContent(template('tpl-message', returnMsgButton( '请输入新密码!') )).showIt();
            return false;
        }else if('string' === typeof data['aPwd'] && '' == $.trim(data['aPwd'])){
            _message.setContent(template('tpl-message', returnMsgButton( '请再次输入密码!') )).showIt();
            return false;
        }else if('string' === typeof data['password'] && 'string' === typeof data['aPwd'] && ($.trim(data['password']) != $.trim(data['aPwd']))){
            _message.setContent(template('tpl-message', returnMsgButton( '两次密码输入不一致!') )).showIt();
            return false;
        }

        //修改密码
        $Request.postInfo($Request.getRouter('editPwd'), data, function(data){
            if('undefined' !== typeof data['resCode']){
                if(0 == parseInt(data['resCode'])){
                    _message.setContent(template('tpl-message', {message : data['message'], buttons : false}));
                    _message.showIt();
                }else if(1 == parseInt(data['resCode'])){
                    _message.setContent(template('tpl-message', {message : "修改成功!<br />请点击返回按钮进入登录页", buttons : true, btn : 'btn-success-okay'}));
                    _message.showIt();
                }
            }
        });
    }

    //加载事件
    function loadEvent(){
        //返回登录页
        $(document).on('click', '#historyBtn', function(){
            $Request.backPage();            //返回上一页
        });

        //提交
        $(document).on('click', 'button#btnSubmit', function(){
            var _data = window.parseQueryString(_editForm.serialize());
            if('object' === typeof _data) {
                validateForm(_data);
            }else{
                _message.setContent(template('tpl-message', {message : '请填写修改密码信息！!'}));
                _message.showIt();
            }
        });

        //关闭信息提示框
        $(document).on('click', 'button.btn-message-okay', function(){
            _message.hideIt();
        });

        //跳回登录页
        $(document).on('click', 'button.btn-success-okay', function(){
            $Request.linkTo('login');
        });
    }

    $(function(){
        _editForm = $('form#editForm');

        loadEvent();            //加载事件
    });
});