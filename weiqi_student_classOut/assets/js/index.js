/*jshint esversion: 6*/
import SVG from 'svg.js';
import $ from 'jquery';
import Routers from './lib/api';
import PageLinks from './lib/aPage';
import WQ_Object from './lib/weiqi';

window.WQ_Object = WQ_Object;
window.$Request = {};

//
(function(Request){
    Request.basePath = Routers.getBasePath();       //获取路径

    //获取路由
    Request.getRouter = function(_name){
        return Routers.getRouter(_name);
    };

    //获取数据
    Request.getInfo = function(_url, _data, _callback){
        $.ajax({
            url : _url,
            type : "GET",
            data : _data,
            dataType : "JSON",
            crossDomain : true,
            xhrFields: {
                withCredentials: true
            },
            success : _callback
        });
    };

    //发送数据
    Request.postInfo = function(_url, _data, _callback){
        $.ajax({
            url : _url,
            type : "POST",
            data : _data,
            dataType : "JSON",
            crossDomain : true,
            xhrFields: {
                withCredentials: true
            },
            success : _callback
        });
    };

    //跳转页
    Request.linkTo = function(_name, _callback){
        PageLinks.linkTo(_name, _callback);
    };

    //返回上一页
    Request.backPage = function(){
        window.history.go(-1);
    };

    //cookie参数名
    Request.cookieParam = {
        'userId' : 'userId',            //用户id
        'userName' : 'userName',        //用户名称
        'mobile' : 'mobile',            //用户手机
        'password' : 'password',         //用户密码
        'unitId' : 'unitId',             //分校id
        'resId' : 'resId',               //资源id
        'unit_id': 'unit_id'            //分组id
    };

    //- - - - - - - - - - - - - - - - - - - - 登录信息 - - - - - - - - - - - - - - - - - - - -
    Request.getCookies = function(){
        return {
            data : function(){
                var _jsonString = '{"_userId" : ' + ('undefined' !== typeof Cookies.get(Request.cookieParam.userId) ? parseInt(Cookies.get(Request.cookieParam.userId)) : 0) +  ',' +
                    ' "_userName" : "' + Cookies.get(Request.cookieParam.userName) + '" , ' +
                    '"_mobile" : "' + ('undefined' !== typeof Cookies.get(Request.cookieParam.mobile) ? Base.decode(Cookies.get(Request.cookieParam.mobile)) : 0) + '", ' +
                    '"_password" : "' + ('undefined' !== typeof Cookies.get(Request.cookieParam.password) ? Base.decode(Cookies.get(Request.cookieParam.password)) : 0) + '", ' +
                    '"_unitId" : ' + ('undefined' !== typeof Cookies.get(Request.cookieParam.unitId) ? parseInt(Cookies.get(Request.cookieParam.unitId)) : 0) + ' , ' +
                    '"_resId" :' + ('undefined' !== typeof Cookies.get(Request.cookieParam.resId) ? parseInt(Cookies.get(Request.cookieParam.resId)) : 0) + ', ' +
                    '"unit_id" :' + ('undefined' !== typeof Cookies.get(Request.cookieParam.unit_id) ? parseInt(Cookies.get(Request.cookieParam.unit_id)) : 0) +
                    '}';

                return JSON.parse(_jsonString);
            },
            //判断是否存在cookie值
            hasInfo : function(){
                var _data = this.data();
                return 0 != _data._userId && 'undefined' !=  _data._userName;
            },
            //设置账号信息
            setInfo : function(userId, userName, mobile, password, unitId, unit_id){
                if('number' === typeof userId){ Cookies.set(Request.cookieParam.userId, userId); }
                if('string' === typeof userName){ Cookies.set(Request.cookieParam.userName, userName); }
                if('string' === typeof mobile){ Cookies.set(Request.cookieParam.mobile, Base.encode(mobile)); }
                if('string' === typeof password){ Cookies.set(Request.cookieParam.password, Base.encode(password)); }
                if('number' === typeof unitId){ Cookies.set(Request.cookieParam.unitId, unitId); }
                if('number' === typeof unit_id){ Cookies.set(Request.cookieParam.unitId, unit_id); }
            },
            //资源id
            setResId : function(id){
                if('number' === typeof id){ Cookies.set(Request.cookieParam.resId, id); }
            },
            //资源id
            setUnit_id : function(id){
                if('number' === typeof id){ Cookies.set(Request.cookieParam.unit_id, id); }
            },
            //清除登录信息
            clearUser : function(){
                Cookies.remove(Request.cookieParam.userId);
                Cookies.remove(Request.cookieParam.userName);
                Cookies.remove(Request.cookieParam.mobile);
                Cookies.remove(Request.cookieParam.password);
                Cookies.remove(Request.cookieParam.unitId);
                Cookies.remove(Request.cookieParam.resId);
                Cookies.remove(Request.cookieParam.unit_id);
            }
        };
        //end
    };

    //- - - - - - - - - - - - - - - - - - - - 课程信息 - - - - - - - - - - - - - - - - - - - -
    Request.classInfo = {
        classId : 'classId',                    //班级
        classTimeId : 'classTimeId',            //课次
        classHourId : 'classHourId',            //课时
        hasAll : function(){
            return !isNaN(parseInt(Cookies.get(this.classId))) && !isNaN(parseInt(Cookies.get(this.classTimeId))) && !isNaN(parseInt(Cookies.get(this.classHourId)));
        },
        getClassId : function(){ return parseInt(Cookies.get(this.classId)) },
        getClassTimeId : function(){ return parseInt(Cookies.get(this.classTimeId)) },
        getClassHourId : function(){ return parseInt(Cookies.get(this.classHourId)) },
        setClassId : function(_id){ Cookies.set(this.classId, _id) },
        setClassTimeId : function(_id){ Cookies.set(this.classTimeId, _id) },
        setClassHourId : function(_id){ Cookies.set(this.classHourId, _id) },
        clearClassId : function(){ Cookies.remove(this.classId) },
        clearClassTimeId : function(){ Cookies.remove(this.classTimeId) },
        clearClassHourId : function(){ Cookies.remove(this.classHourId) },
        clearAll : function(){
            Cookies.remove(this.classId);
            Cookies.remove(this.classTimeId);
            Cookies.remove(this.classHourId);
        }
    };

    //- - - - - - - - - - - - - - - - - - - - 加载状态 - - - - - - - - - - - - - - - - - - - -
    Request.Loading = function(){
        var _loadingName = 'loadingWrapper', _loadingObj = $('#' + _loadingName), _body = $('body');

        //创建loading DOM对象
        function createLoad(){
            var _param = {
                className : 'loading-wrapper',
                idName : 'loadingWrapper',
                loaderClassName : 'loader-inner ball-pulse',
                circles : '<div></div><div></div><div></div>'
            }, _Obj = $('<div />');

            _Obj.addClass(_param.className).attr({
                'id' : _param.idName
            }).append($('<div />').addClass(_param.loaderClassName).append(_param.circles)).hide();

            return _Obj;
        }

        //显示加载图标
        function showIt(){
            _loadingObj.fadeIn('fast');
            return this;
        }

        //隐藏加载图标
        function hideIt(){
            _loadingObj.hide();
            return this;
        }

        if('undefined' === typeof _loadingObj.get(0)){
            _loadingObj = createLoad();
            _body.append(_loadingObj);
        }

        this.showIt = showIt;
        this.hideIt = hideIt;
    };

    //- - - - - - - - - - - - - - - - - - - - 弹框信息 - - - - - - - - - - - - - - - - - - - -
    Request.dialog = function(options){
        var _param = {
                className : 'dialog-wrapper',
                modelBody : 'model-body',
                btnClose : 'button-close',
                contentBody : 'model-content'
            },
            _opts = {
                animateName : 'rotateScale',
                closeCallback : function(){},
                isShowClose : true
            },
            _this = this,
            _dialog = $('.' + _param.className),
            _body = $('body'),
            _modelBody = $('<div />').addClass(_param.modelBody),
            _contentBody = $('<div />').addClass(_param.contentBody),
            _btnClose = $('<div />').addClass(_param.btnClose);

        if('object' === typeof options){
            _opts = $.extend(_opts, options);
        }

        //初始化
        function initial(){
            _dialog = $('<div />').addClass(_param.className).addClass(_opts.animateName);
            _dialog.append(_modelBody);

            _modelBody.append(_btnClose);
            _modelBody.append(_contentBody);

            _body.append(_dialog);

            if(!_opts.isShowClose){ _btnClose.hide(); }
        }

        //添加内容
        function setContent(_html){
            if('undefined' !== typeof _html) _contentBody.html(_html);
            return _this;
        }

        //隐藏
        function hideIt(isClick){
            _dialog.find('.' + _param.modelBody).removeClass('active').delay(350).show(function(){
                _dialog.hide();
                if('undefined' !== typeof isClick && isClick && 'function' === typeof _opts.closeCallback) {
                    _opts.closeCallback();        //关闭回调函数
                }
                delete _opts.closeCallback;
            });
            return _this;
        }

        //显示
        function showIt(){
            _dialog.fadeIn(300, function(){
                _dialog.find('.' + _param.modelBody).addClass('active');
            });
            return _this;
        }

        //关闭事件
        function closeCallback(_func){
            if('function' === typeof _func){
                _opts.closeCallback = _func;
            }
        }

        //关闭弹框
        _btnClose.on('click', function(){
            hideIt(true);
        });

        //初始化弹框
        initial();

        this.hideIt = hideIt;
        this.showIt = showIt;
        this.setContent = setContent;
        this.closeCallback = closeCallback;
    }

    Request.tranMsg = function(options){
        options = $.extend({
            wrapClassName : 'message-time-wrapper',
            flexClassName : 'flex-box',
            active : 'viewIt',
            delayTime : 3000
        }, options);
        var isHidden = false;

        //创建DOM
        var _body = $('body'),
            _wrap = $('<div />').addClass(options.wrapClassName),
            _flexBox = $('<div />').addClass(options.flexClassName);

        _body.append(_wrap);
        _wrap.append(_flexBox);

        function showInfo(_html){
            _flexBox.html(_html);
            _wrap.fadeIn(1000, function(){
                isHidden = false;
                _wrap.addClass(options.active);
                setTimeout(function(){
                    if(!isHidden){
                        isHidden = true;
                        _wrap.removeClass(options.active).fadeOut();
                    }
                }, options.delayTime);
            });
        }

        _wrap.on('touchend', function(){
            isHidden = true;
            _wrap.removeClass(options.active).fadeOut();
        });

        this.showInfo = showInfo;
    }

})($Request);