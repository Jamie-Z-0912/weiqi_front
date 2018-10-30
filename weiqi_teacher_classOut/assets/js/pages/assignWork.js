/**
 * Created by yk on 2018/4/18.
 */
(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(), //实例化加载图标
        _cookie = $Request.getCookies(),
        _studentNumber = 0,                             //学员数
        _message = new $Request.dialog({                //提示信息弹框
            animateName : 'messageScale'
        }),
        _modal = new $Request.modal();              //遮罩层弹出框
        allCheck = $("#memberList .item-list input[name='students']"); //全选按钮

    //- - - - - - - - - - - - - - - select选项数据加载 - - - - - - - - - - - - - - -
    //加载班级数据
    function loadClassList(){
        $('#memberList').html('');      //清空历史数据
        $('#centerListInner').html(''); //清空历史数据
        var _data = _cookie.data(), classIdName = 'sltClass', _classObject = $('#' + classIdName);
        //加载班级数据
        $Request.getInfo($Request.getRouter('classList'), {id : _data['_userId']}, function(data){
            _classObject.html(template('tpl-classList', data));

            //读取班级信息缓存数据
            var _classId = $Request.classInfo.getClassId();
            if('undefined' !== typeof _classId && !isNaN(_classId)){
                setTimeout(function(){
                    _classObject.val(_classId);     //设置默认值
                    loadClassTimeList(_classId);    //加载课次数据
                }, 50);
            }
        })
    }

    //加载课次数据
    function loadClassTimeList(_id, isInitial){
        $('#memberList').html('');      //清空历史数据
        $('#centerListInner').html(''); //清空历史数据
        var _classTimeName = 'classTime';
        $Request.getInfo($Request.getRouter('classTimeList'), {"classId" : _id}, function(data){
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
        $('#memberList').html('');      //清空历史数据
        $('#centerListInner').html(''); //清空历史数据
        var _classHourName = 'classHour';
        $Request.getInfo($Request.getRouter('classHourList'), { "courseTime" : _id, "classId" : $Request.classInfo.getClassId() }, function(data){
            $('#' + _classHourName).html(template('tpl-classHourList', data));

            //读取课时信息缓存数据
            var _classHourId = $Request.classInfo.getClassHourId();
            //isInitial 未定义或为true，表示初始化， false为不初始化
            if(('undefined' === typeof isInitial || isInitial) && 'undefined' !== typeof _classHourId && !isNaN(_classHourId)){
                setTimeout(function(){
                    $('#' + _classHourName).val(_classHourId);      //设置默认值
                    loadStudentList();                              //加载学员信息
                    loadResourceList();                             //加载资源数据
                }, 50);
            }
        });
    }

    //加载布置作业的学生数据
    function loadStudentList(){
        allCheck.prop("checked",false); //取消全选
        //获取布置作业的学生列表。type:1课堂作业2课后作业
        $Request.getInfo($Request.getRouter('practiceMemberList'), {"classId" : $Request.classInfo.getClassId(), "courseTime" : $Request.classInfo.getClassTimeId(), "courseHour" : $Request.classInfo.getClassHourId(),"type":2}, function(data){
            data['basePath'] = $Request.basePath;
            $('#memberList').html(template('tpl-studentList', data));
        });
    }

    //退出登录
    function exitLogin(){
        $Request.postInfo($Request.getRouter('exitLogin'), {}, function(data){
            if('undefined'!== typeof data['resCode'] && parseInt(data['resCode'])){
                $Request.classInfo.clearAll();  //清除课程信息
                _cookie.clearUser();            //清除用户信息
                $Request.linkTo('login');       //返回登录页
            }
        });
    }

    //退出事件
    function exitEvent(){
        //退出 显示确认框 事件
        $(document).on('click', 'button.btn-main-exit', function(){
            _message.setContent(template('tpl-isExit', {
                message : '确认要注销吗？'
            })).showIt();
        });

        //确认退出 事件
        $(document).on('click', 'button.btn-exit-okay', function(){ _message.hideIt(); exitLogin() });

        //取消退出 事件
        $(document).on('click', 'button.btn-exit-cancel', function(){ _message.hideIt() });
    }

    //重置时间段
    function resetTimeLimit(timeString){
        var _dataLimit = $('#dateLimit'),
            _timeLimit = $('#timeLimit'),
            _time = timeString.split(' ');
        if($.isArray(_time) && _time.length == 2){
            _dataLimit.val(_time[0]).show();                 //显示日期
            _timeLimit.val(_time[1]).show();                 //显示时间段
        }else{
            _dataLimit.val('').show();
            _timeLimit.val('').show();
        }
    }

    //加载事件
    function loadEvent(){
        var _memberList = $('#memberList');
        exitEvent();        //退出事件

        //选择班级 事件
        $(document).on('change', '#sltClass', function(){
            var _id = $(this).val(),
                _classroom = $(this).find('option:selected').data('room');

            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassId(_id);         //存储当前班级信息
                loadClassTimeList(_id, false);                //获取课次数据
            }else {
                $Request.classInfo.clearClassId();
                $('#classTime').html(template('tpl-classTimeList', {}));
                _memberList.empty();            //清除学生列表
                allCheck.prop("checked",false); //取消全选
            }
            //清空课次和课时
            $Request.classInfo.clearClassTimeId();
            $Request.classInfo.clearClassHourId();
            $('#classHour').html(template('tpl-classHourList', {}));
            _studentNumber = 0;
        });

        //选择课次 事件
        $(document).on('change', '#classTime', function(){
            var _id = $(this).val();
            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassTimeId(_id);     //存储当前课次信息
                loadClassHourList(_id, false);                //加载课时数据
            }else{
                $Request.classInfo.clearClassTimeId();
                _memberList.empty();            //清除学生列表
                allCheck.prop("checked",false); //取消全选
            }
            _studentNumber = 0;
        });

        //选择课时 事件
        $(document).on('change', '#classHour', function(){
            var _id = $(this).val(),
                _data = $(this).find('option:selected').data();

            if(!isNaN(parseInt(_data['rid']))){
                _cookie.setResId(parseInt(_data['rid']));
            }

            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassHourId(_id);
                loadStudentList();                  //加载学生信息
                loadResourceList();                 //加载资源数据
            }else{
                $Request.classInfo.clearClassHourId();
                _memberList.empty();            //清除学生列表
                _studentNumber = 0;
            }
        });

        //alert提示消息 关闭
        $(document).on('click', 'button.btn-alert-okay', function(){
            _message.hideIt();
        });

        //作业题目列表 多选
        $(document).on('click', 'ul.resource-list button', function(){
            var $_this = $(this).parent();
            $_this.hasClass('active') ? $_this.removeClass('active') : $_this.addClass('active')
        });

        //全选 或取消全选
        $(document).on('click','.check-all #checkkAllckb',function(){
            var _input = $("#memberList .item-list input[name='students']");
            $(this).prop("checked") ? _input.prop("checked",true) : _input.prop("checked",false);
        })

        //发送
        $(document).on('click','#btnSend',function(){
            var studentList = '',
                assignList = '';
            // 获取选中的学生
            $("#memberList .item-list input[name='students']:checked").each(function(){
                studentList += $(this).val() + ',';
            })
            studentList = studentList.substring(0,studentList.length - 1); //删除字符串最后一个逗号

            //获取选中的作业
            $("#centerListInner .resource-list li.active").each(function(){
                var _this = $(this);
                assignList += _this.find("button").data("id") + ',';
            })
            assignList = assignList.substring(0, assignList.length - 1); //删除字符串最后一个逗号

            //判断作业是否为空
            if (assignList.length == 0){
                _message.setContent(template('tpl-alert', {
                    message : '作业为空，请重新选择！'
                })).showIt();
                return;
            }

            //判断学生是否为空
            if (studentList.length == 0){
                _message.setContent(template('tpl-alert', {
                    message : '学生为空，请重新选择！'
                })).showIt();
                return;
            }

            //布置作业，发送请求。(type:1课堂作业 2课后作业)
            $Request.getInfo($Request.getRouter('sendCheck'),{"user_ids": studentList, "res_ids": assignList, "type": 2},function(data){
                if (data.resCode == 1){
                    _modal.setContent(template('tpl-send', {
                        msg : '发送成功',
                        image : './images/modal_img/success.png'
                    })).useModal();
                    setTimeout(loadStudentList,1020);
                }
            })
        })

        //返回上一页
        $(document).on('click', 'button#btnHistory', function(){
            $Request.backPage();
        });
    }

    //加载作业资源数据
    function loadResourceList(){
        var _resId = _cookie.data()['_resId'],
            _container = $('#centerListInner');

        //资源id存在时，则加载列表
        if(!isNaN(parseInt(_resId))){
            $Request.getInfo($Request.getRouter('practiceList'), {id : _resId}, function(data){
                if('undefined' !== typeof data['resultList'] && $.isArray(data['resultList'])){
                    _loading.hideIt();      //隐藏加载框
                }
                _container.html(template('tpl-resource', data));
            })
        }else {
            _message.setContent(template('tpl-alert', {
                message : '资源不存在！请与管理员联系！'
            })).showIt();
        }
    }

    //菜单操作类
    var _menuOperate = {
        active : 'scale-active',
        wrap : function(){
            return $('#assignWrap');
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

    $(function(){
        //判断是否已登录
        if(_cookie.hasInfo()){
            loadEvent();                //加载事件
            loadClassList();            //加载班级信息
            menuEvent();                //菜单收缩
            _loading.hideIt();          //隐藏加载的Loading框
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});
