(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var  _cookie = $Request.getCookies(),
        _message = new $Request.dialog({            //提示信息弹框
        animateName : 'messageScale'
    });
    //加载头像列表
    function loadHeadUrlList(){
        $Request.getInfo($Request.getRouter('headList'), {}, function(data){
           console.log(data);
            data['basePath'] = $Request.basePath;
            $('#headList').html(template('tpl-list', data));
        });
    }

    function loadHeadEvent(){
        var _headList = $('#headList'), _active = 'active';
        //选择头像
        _headList.on('click', 'button.photo', function(){
            _headList.find('button.photo').removeClass(_active);
            $(this).addClass(_active);
        });
    }

    //加载事件
    function loadEvent(){
        loadHeadEvent();

        //返回
        $(document).on('click', 'button.btn-back', function(){
            //_message.setContent(template('tpl-message', {message : '确认要退出该界面吗？', button : 'btn-exit-okay'})).showIt();
            $Request.linkTo('main');
        });

        //确认选择头像 btn-selectHead
        $(document).on('click', 'button.btn-selectHead', function(){
            var _selectSize = $('#headList').find('button.photo.active').size();
            if(_selectSize > 0){
                _message.setContent(template('tpl-message', {message : '确认要选择该头像吗？', button : 'btn-select-okay'})).showIt();
            }else{
                _message.setContent(template('tpl-message', {message : '请选择要修改的头像哦~'})).showIt();
            }
        });

        //确认选择事件
        $(document).on('click', 'button.btn-select-okay', function(){
            var _id = _cookie.data()['_userId'],
                _url = $('#headList').find('button.photo.active').data('url');

            //提交数据
            $Request.postInfo($Request.getRouter('editUserInfo'), {
                id : _id,
                head_url : _url
            }, function(data){
                if('undefined' !== typeof data['resCode'] && 1 == parseInt(data['resCode'])){
                    _message.setContent(template('tpl-message', {message : '修改成功！'})).showIt().closeCallback($Request.backPage);
                    setTimeout(function(){
                        $Request.linkTo('main');
                    }, 2000);
                }else if('undefined' !== typeof data['message'] && 1 == parseInt(data['message'])){
                    _message.setContent(template('tpl-message', {message : data['message']})).showIt();
                }
            });
        })
    }

    //
    $(function(){
        loadHeadUrlList();
        loadEvent();                //加载事件
    });
});