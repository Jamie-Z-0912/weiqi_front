(function(factory){
    jQuery && factory(jQuery);
})(function($) {
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _message = new $Request.dialog({            //提示信息弹框
            animateName: 'messageScale'
        });

    //加载资源数据
    function loadResourceList(){
        var _resId = _cookie.data()['_resId'],
            _container = $('#rightListInner');

        //资源id存在时，则加载列表
        if(!isNaN(parseInt(_resId))){
            $Request.getInfo($Request.getRouter('resource'), {id : _resId}, function(data){
                if('undefined' !== typeof data['resultList'] && $.isArray(data['resultList'])){
                    _chessOperate.pageSize = data['resultList'].length;
                    _loading.hideIt();      //隐藏加载框
                }
                _chessOperate.pageIndex = -1;
                _chessOperate.prevIndex = -1;
                _container.html(template('tpl-resource', data));
            })
        }else {
            _message.setContent(template('tpl-alert', {
                message : '资源不存在！请与管理员联系！'
            })).showIt();
        }
    }

    //获取班级信息
    function loadClassList(){
        var _data = _cookie.data(), classIdName = 'sltClass', _classObject = $('#' + classIdName);
        $Request.getInfo($Request.getRouter('classList'), {id : _data['_userId']}, function(data){
            _classObject.html(template('tpl-classList', data));

            //读取班级信息缓存数据
            var _classId = $Request.classInfo.getClassId();
            if('undefined' !== typeof _classId && !isNaN(_classId)){
                setTimeout(function(){
                    _classObject.val(_classId);     //设置默认值
                    loadClassTimeList(_classId);            //加载课次数据
                    $('#classroom').val(_classObject.find('option:selected').data('room'));            //显示教室
                }, 50);
            }
        });
    }

    //获取课次信息
    function loadClassTimeList(_id, isInitial){
        var _classTimeName = 'classTime';

        $Request.getInfo($Request.getRouter('classTime'), {"classId" : _id }, function(data){
            $('#' + _classTimeName).html(template('tpl-classTimeList', data));

            //读取课次信息缓存数据
            var _classTimeId = $Request.classInfo.getClassTimeId();
            //isInitial 未定义或为true，表示初始化， false为不初始化
            if(('undefined' === typeof isInitial || isInitial) && 'undefined' !== typeof _classTimeId && !isNaN(_classTimeId)){
                setTimeout(function(){
                    $('#' + _classTimeName).val(_classTimeId);      //设置默认值
                    loadClassHourList(_classTimeId);                //加载课时数据
                }, 50);
            }
        });
    }

    //加载课时数据
    function loadClassHourList(_id, isInitial){
        var _classHourName = 'classHour';
        $Request.getInfo($Request.getRouter('classHourList'), { "courseTime" : _id, "classId" : $Request.classInfo.getClassId() }, function(data){
            $('#' + _classHourName).html(template('tpl-classHourList', data));

            //读取课时信息缓存数据
            var _classHourId = $Request.classInfo.getClassHourId();
            //isInitial 未定义或为true，表示初始化， false为不初始化
            if(('undefined' === typeof isInitial || isInitial) && 'undefined' !== typeof _classHourId && !isNaN(_classHourId)){
                setTimeout(function(){
                    $('#' + _classHourName).val(_classHourId);      //设置默认值
                    loadResourceList();                              //加载资源信息
                }, 50);
            }
        });
    }

    //菜单操作类
    var _menuOperate = {
        active : 'scale-active',
        wrap : function(){
            return $('#classroomWrap');
        },
        btnHistory : function(){
            return $('#btnHistory');
        },
        toggleMenu : function(){
            var _classroomWrap = this.wrap(),
                _btnBack = this.btnHistory();
            if(_classroomWrap.hasClass(this.active)){
                _classroomWrap.removeClass(this.active);
                _btnBack.show();
            }else{
                _classroomWrap.addClass(this.active);
                _btnBack.hide();
            }
        },
        showMenu : function(){
            this.wrap().removeClass(this.active);
        },
        hideMenu : function(){
            this.wrap().addClass(this.active);
        }
    };

    //菜单收缩
    function menuEvent(){
        //主菜单 收缩事件
        $(document).on('click', 'button#shrinkMainMenu', function(){
            _menuOperate.toggleMenu();
        });

        //二级菜单 收缩事件
        $(document).on('click', 'button#shrinkSecondMenu', function(){
            _menuOperate.toggleMenu();
        });
    }

    //课堂操作类
    var _chessOperate = {
        container : function(){
            return $('#mainWrap');
        },
        pageIndex : -1,          //当前页
        prevIndex : -1,          //上一次页码
        pageSize : 0,
        myPlayer : null,      //播放器手柄
        models : {
            video : 1,          //播放课件
            explain : 2,        //讲解例题
            knowledge : 3,      //知识类提问
            chess : 4,          //棋谱类提问
            practice : 5        //课堂练习(暂无)
        },
        //切换面板
        switchPanel : function(data){
            var _model = parseInt(data['mode']);
            if(!isNaN(_model)){
                if(null != this.myPlayer && 'function' === typeof this.myPlayer.pause) this.myPlayer.pause();
                switch (_model){
                    case 1 : this.showVideo(data); break;
                    case 2 : this.showExplain(data); break;
                    case 3 : this.showKnowledge(data); break;
                    case 4 : this.showChess(data); break;
                    case 5 : break;
                }
            }
            //end
        },
        //video 视频课件
        showVideo : function(data){
            var _main = this.container(),
                _this = this;
            _main.html(template('tpl-videoPanel', data));

            setTimeout(function(){
                _this.myPlayer = $('.video-js');
                var _obj = _this.myPlayer,
                    _boardVideoBox = $('#boardVideoBox'),
                    _media = _boardVideoBox.find('.zy_media');

                _media.hide();
                videojs(_obj.get(0)).ready(function(){
                    var myPlayer = this;

                    myPlayer.width(_boardVideoBox.width() - 10);
                    myPlayer.height(_boardVideoBox.height());

                    _media.show();
                    myPlayer.play();
                });
                /*zymedia('video', {
                 "type" : "video/mp4",
                 "mediaTitle" : data['stem'],
                 "audioHeight" : 50,
                 "autoplay" : true,
                 "preload" : "auto",
                 "success" : function(_ele){ }
                 });*/
            }, 500);
        },
        //explain 讲解例题
        showExplain : function(data){
            var _main = this.container();
            _main.html(template('tpl-explainPanel', data));
            //console.log('explain', data);
            $('#boardBox').html('');
            $('#recordOperate').html('');
            $('#piecesOperate').html('');
            $('#signOperate').html('');

            setTimeout(function(){
                //WQ_Object.disabled = true;      //禁止落子
                WQ_Object.drawBoard("boardBox", data['content']);

                //操作界面
                WQ_Object.drawWS('recordOperate');
                WQ_Object.drawBlackWhite('piecesOperate');
                //WQ_Object.drawSign('signOperate');
            }, 80);
        },
        //knowledge 知识类提问
        showKnowledge : function(data){
            var _main = this.container();
            _main.html(template('tpl-Knowledge', data));
            //console.log('knowledge', data);
        },
        //chess 棋谱类问答
        showChess : function(data){
            var _main = this.container();
            _main.html('');
        }
    };

    //资源列表事件
    function resourceEvent(){
        //翻页
        function showPage(_index){
            $('ul.resource-list button').eq(_index).trigger('click');
        }

        //资源列表 切换
        $(document).on('click', 'ul.resource-list button', function(){
            var _index = $(this).parent().index();

            var _length = $(this).parents('ul.resource-list').children('li').length;    //获取li总个数
            // 隐藏右箭头
            if (_index + 1 == _length ){
                $("#btnClassPageNext").css('visibility','hidden');
            }else{
                $("#btnClassPageNext").css('visibility','visible');
            }
            // 隐藏左箭头
            if (_index == 0){
                $("#btnClassPagePrev").css('visibility','hidden');
            }else{
                $("#btnClassPagePrev").css('visibility','visible');
            }

            if(_index == _chessOperate.prevIndex) return false;

            _chessOperate.pageIndex = _index;
            _chessOperate.prevIndex = _index;

            _chessOperate.switchPanel($(this).data());

            $('ul.resource-list li').removeClass('active');
            $(this).parent().addClass('active');
        });

        //显示答案
        $(document).on('click', 'button.btn-explain-answer', function(){
            $(this).parent().find('.answer .content').show();
            $(this).hide();
        });

        //课件 依次下一个
        $(document).on('click', 'button#btnClassNext', function(){
            showPage(_chessOperate.pageIndex + 1 >= _chessOperate.pageSize ? _chessOperate.pageSize - 1 : _chessOperate.pageIndex + 1);
        });

        //上一个
        $(document).on('click', 'button#btnClassPagePrev', function(){
            showPage(_chessOperate.pageIndex - 1 <= 0 ? 0 : _chessOperate.pageIndex - 1);
        });

        //下一个
        $(document).on('click', 'button#btnClassPageNext', function(){
            showPage(_chessOperate.pageIndex + 1 >= _chessOperate.pageSize ? _chessOperate.pageSize - 1 : _chessOperate.pageIndex + 1);
        });
    }

    //棋盘放大缩小功能
    function scaleChessBoardEvent(){
        //放大缩小棋盘
        $(document).on('click', 'button.btn-scale-chess', function(){
            var _chessBoardWrap = $('#chessBoardWrap'),
                _boardBox = $('#boardBox'),
                _classOperate = $('#classOperate'),
                _height = $(window).height(),
                _active = 'active';
            //缩小
            if(1 == parseInt(_chessBoardWrap.data('isScale'))){
                _classOperate.removeAttr('style');
                _chessBoardWrap.css({
                    'position' : '',
                    'top' : '',
                    'left' : '',
                    'margin-left' : '',
                    'margin-top' : ''
                }).width('').height('').data('isScale', 0);
                $(this).removeClass(_active);
            }
            //放大
            else{
                var _wrapOuterH = _chessBoardWrap.outerHeight(),
                    _boxH = _boardBox.height(),
                    _cha = _wrapOuterH - _boxH;

                _classOperate.hide();
                _chessBoardWrap.css({
                    'position' : 'fixed',
                    'top' : '50%',
                    'left' : '50%',
                    'margin-left' : -_height / 2,
                    'margin-top' : -_height / 2
                }).width(_height - _cha).height(_height - _cha).data('isScale', 1);
                $(this).addClass(_active);
            }
            //end
        });

        //大小改变
        $(window).resize(function(){
            var _chessBoardWrap = $('#chessBoardWrap'),
                _classOperate = $('#classOperate');

            if('undefined' !== typeof _chessBoardWrap.get(0)){
                _classOperate.removeAttr('style');
                _chessBoardWrap.css({
                    'position' : '',
                    'top' : '',
                    'left' : '',
                    'margin-left' : '',
                    'margin-top' : ''
                }).width('').height('').data('isScale', 0);
            }
        })
    }

    function loadEvent(){
        menuEvent();        //菜单收缩事件
        resourceEvent();    //资源列表事件
        scaleChessBoardEvent();

        //返回
        $(document).on('click', 'button#btnHistory, button.btn-class-back', function(){
           $Request.backPage();
        });

        //班级信息修改
        $(document).on('change', 'select#sltClass', function(){
            var _id = parseInt($(this).val());
            if(!isNaN(_id)){
                $Request.classInfo.setClassId(_id);     //保存当前班级信息
                loadClassTimeList(_id, false);                    //加载课次资源
            }else{
                $Request.classInfo.clearClassId();      //清除班级id
                $('#classTime').html(template('tpl-classTimeList', {}));
                $('#classroom').val('');            //清除教室信息
                //_memberList.empty();            //清除资源列表
            }
        });

        //课次信息修改
        $(document).on('change', 'select#classTime', function(){
            var _id = $(this).val();
            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassTimeId(_id);     //存储当前课次信息
                loadClassHourList(_id, false);                     //加载课时数据
            }else{
                $Request.classInfo.clearClassTimeId();
                //_memberList.empty();            //清除资源列表
            }
        });

        //课时信息修改
        $(document).on('change', 'select#classHour', function(){
            var _id = $(this).val(),
                _data = $(this).find('option:selected').data();

            if(!isNaN(parseInt(_data['rid']))){
                _cookie.setResId(parseInt(_data['rid']));
            }

            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassHourId(_id);
                loadResourceList();                  //加载学生信息
            }else{
                $Request.classInfo.clearClassHourId();
                //_memberList.empty();            //清除学生列表
            }
        });
    }

    $(function(){
        //判断是否已登录
        if(_cookie.hasInfo()){
            loadEvent();                //加载事件
            loadClassList();
            _loading.hideIt();
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});