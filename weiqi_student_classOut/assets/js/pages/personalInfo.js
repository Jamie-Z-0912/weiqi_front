(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        });

    //获取不为空字符数组
    function getNoneEmptyStr(arr){
        var _tempArr = [];
        if($.isArray(arr)){
            $.each(arr, function(i, value){
                if($.trim(value) != ''){
                    _tempArr[_tempArr.length] = $.trim(value);
                }
            });
        }
        return _tempArr;
    }

    //分类时间
    function timeLimit(arr){
        var _time = {
            am : [],
            pm : []
        }, tempTime = 0;
        //分析数据
        $.each(arr, function(i, value){
            if('string' === typeof value && value.indexOf(':') != -1){
                tempTime = parseInt(value.substr(0, value.indexOf(':')));
                if(!isNaN(tempTime)){
                    if(tempTime >= 12){
                        _time.pm[_time.pm.length] = value;
                    }else{
                        _time.am[_time.am.length] = value;
                    }
                }
                //isNaN end
            }
        });
        return _time;
    }

    //加载用户信息
    function loadUserInfo(){
        $Request.getInfo($Request.getRouter('studentInfo'), {}, function(data){
            _loading.hideIt();      //隐藏加载框

            var _result = data['resultList'],       //数据集
                _teacherList,
                _timeList,
                _timeObj;

            if('string' === typeof _result['teacherList']){
                _teacherList = getNoneEmptyStr(_result['teacherList'].split(','));
            }
            if('string' === typeof _result['timeList']){
                _timeList = getNoneEmptyStr(_result['timeList'].split(','));
                _timeObj = timeLimit(_timeList);
            }

            if(parseInt(data['resCode'])){
                if('undefined' !== typeof _result){
                    _result['basePath'] = $Request.basePath;
                    if($.isArray(_teacherList)){
                        _result['tList'] = _teacherList;
                    }
                    _result['timeLimit'] = _timeObj;

                    $('#infoList').html(template('tpl-user', _result));
                }
            }else{
                var _msg = '加载信息错误！请重新登录...';
                if('string' === typeof data['message']){
                    _msg += data['message'];
                }
                _message.setContent(template('tpl-message', {message : _msg, 'button' : 'btn-loading-error'})).showIt();
                $Request.linkTo('login');       //返回登录页
            }
            _loading.hideIt();
        });
    }

    //加载事件
    function loadEvent(){
        //返回
        $(document).on('click', 'button.btn-back', function(){
           $Request.backPage();
        });

        //显示隐藏内容
        $(document).on('click', 'button.btn-tran', function(){
           var _cid = $(this).data('cid');
            if('string' === typeof _cid && '' != $.trim(_cid) && _cid.indexOf('.') != -1){
                var _obj = $(_cid);
                if('undefined' !== typeof _obj.get(0)){
                    if(_obj.is(':hidden')){
                        _obj.fadeIn();
                        $(this).addClass('active');
                    }else{
                        _obj.fadeOut();
                        $(this).removeClass('active');
                    }
                }
            }
            //end
        });
    }

    $(function(){
        loadUserInfo();         //加载头像信息
        loadEvent();            //加载事件
    });
});