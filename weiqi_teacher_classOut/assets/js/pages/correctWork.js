/**
 * Created by yk on 2018/4/17.
 */

(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _practiceStatus = 0,                        //作业状态(显示或隐藏提交按钮用)
        _modal = new $Request.modal();              //遮罩层弹出框
        _message = new $Request.dialog({          //提示信息弹框
            animateName : 'messageScale'
        });

    //加载用户信息
    function loadUserInfo(){
        var _userData = _cookie.data();
        $Request.getInfo($Request.getRouter('teacherInfo'), {id : _userData['_userId']}, function(data){
            _loading.hideIt();      //隐藏加载框
            if(!parseInt(data['resCode'])){
                var _msg = '加载信息错误！请重新登录...';
                if('string' === typeof data['message']){
                    _msg += data['message'];
                }
                _message.setContent(template('tpl-alert', {
                    message : _msg
                })).showIt();
                $Request.linkTo('login');       //返回登录页
            }
        });
    }

    //- - - - - - - - - - - - - - - select选项数据加载 - - - - - - - - - - - - - - -
    //加载班级数据
    function loadClassList(){
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
                }, 50);
            }
        });
    }

    //加载待批改作业学生列表
    function loadStudentList(){
        //获取待批改作业学生列表。type:1课堂作业2课后作业
        $Request.getInfo($Request.getRouter('userPracticeList'), {"classId" : $Request.classInfo.getClassId(), "courseTime" : $Request.classInfo.getClassTimeId(), "courseHour" : $Request.classInfo.getClassHourId()}, function(data){
            if(data.resultList.length == 0){
                _message.setContent(template('tpl-alert', {"message" : "您当前选择的课程，没有学员！"})).showIt();
                setTimeout(_message.hideIt, 2000);
                return;
            }
            data['basePath'] = $Request.basePath;
            $('#memberList').html(template('tpl-studentList', data));
        });
    }

    //加载事件
    function loadEvent(){
        //选择班级 事件
        $(document).on('change', '#sltClass', function(){
            var _id = $(this).val(),
                _classroom = $(this).find('option:selected').data('room');
            $("#memberList").empty();            //清除学生列表
            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassId(_id);         //存储当前班级信息
                loadClassTimeList(_id, false);                //获取课次数据
            }else {
                $Request.classInfo.clearClassId();
                $('#classTime').html(template('tpl-classTimeList', {}));
                $("#memberList").empty();            //清除学生列表
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
            $("#memberList").empty();            //清除学生列表
            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassTimeId(_id);     //存储当前课次信息
                loadClassHourList(_id, false);                //加载课时数据
            }else{
                $Request.classInfo.clearClassTimeId();
                $("#memberList").empty();            //清除学生列表
            }
            _studentNumber = 0;
        });

        //选择课时 事件
        $(document).on('change', '#classHour', function(){
            var _id = $(this).val(),
                _data = $(this).find('option:selected').data();
            $("#memberList").empty();            //清除学生列表
            if(!isNaN(parseInt(_data['rid']))){
                _cookie.setResId(parseInt(_data['rid']));
            }

            if('undefined' !== typeof _id && '' != $.trim(_id)){
                $Request.classInfo.setClassHourId(_id);
                loadStudentList();                  //加载学生信息
            }else{
                $Request.classInfo.clearClassHourId();
                $("#memberList").empty();            //清除学生列表
                _studentNumber = 0;
            }
        });

        //关闭 消息框 事件
        $(document).on('click', 'button.btn-alert-okay', function(){
            _message.hideIt();
        });

        //菜单收缩 事件
        $(document).on('click', 'button#shrinkMenu', function(){
            var _stuList = $("#studentList");
            _stuList.hasClass('indent') ? _stuList.removeClass('indent') : _stuList.addClass('indent');
        });

        //返回上一页
        $(document).on('click', 'button#btnHistory', function(){
            $Request.backPage();
        });

        //点击 "未批改"|| "已批改" 进入详细页面
        $(document).on('click','#memberList .item-list .status>button',function(){
            var _jobid = $(this).parents('.item-list').data('jobid');
            if ($(this).parents('div').hasClass('corrected')){
                $(".div-submit").css('display','none');
            }
            $Request.getInfo($Request.getRouter('practiceDetailList'), {"practiceId" : _jobid}, function(data){
                loadResourceList(data);
                _practiceStatus = data["resultList"]['status'];
                if(_practiceStatus == 3){
                    $(".div-submit").hide();
                }else{
                    $(".div-submit").show();
                }
                $("#subjectWrap .check-part").css('display','none');
                $("#subjectWrap .task-part").css('display','block');
                $("#jobWrap ul.resource-list").children('li').eq(0).children('button').trigger('click');
            });
        });

        //点击返回上一页
        $(document).on('click', 'button.btn-class-back', function(){
            //todo: 清空.task-part的数据
            $("#leftListInner").empty();    //清空数据
            $("#mainWrap").empty();          //清空数据
            $("#subjectWrap .check-part").css('display','block');
            $("#subjectWrap .task-part").css('display','none');
        });

        //全选 或取消全选
        $(document).on('click','.check-all #checkkAllRedoBox',function(){
            var _input = $("#memberList .item-list input[name='students']");
            $(this).prop("checked") ? _input.prop("checked",true) : _input.prop("checked",false);
        });

        // 订正
        $(document).on('click','#btnRedo',function(){
            var studentList = '';

            // 获取选中的学生
            $("#memberList .item-list input[name='students']:checked").each(function(){
                studentList += $(this).val() + ',';
            });
            studentList = studentList.substring(0,studentList.length - 1); //删除字符串最后一个逗号

            //判断学生是否为空
            if (studentList.length == 0){
                _message.setContent(template('tpl-alert', {
                    message : '学生为空，请重新选择！'
                })).showIt();
                return;
            }

            console.log(studentList);

            //订正作业，发送请求。(type:1课堂作业 2课后作业)
            $Request.getInfo($Request.getRouter('backPractice'),{"practiceIds": studentList},function(data){
                if (data.resCode == 1){
                    _modal.setContent(template('tpl-send', {
                        msg : '发送成功,等待学生订正！',
                        image : './images/modal_img/success.png'
                    })).useModal(1500);
                    setTimeout(loadStudentList,1520);
                }
            })
        })
    }

    //菜单操作类
    var _menuOperate = {
        active : 'scale-active',
        wrap : function(){
            return $('#jobWrap');
        },
        toggleMenu : function(){
            var _classroomWrap = this.wrap();
            if(_classroomWrap.hasClass(this.active)){
                _classroomWrap.removeClass(this.active);
                if(_practiceStatus == 3){
                    $(".div-submit").hide();
                }else{
                    $(".div-submit").show();
                }
            }else{
                _classroomWrap.addClass(this.active);
                $(".div-submit").hide();
            }
        },
        showMenu : function(){
            this.wrap().removeClass(this.active);
        },
        hideMenu : function(){
            this.wrap().addClass(this.active);
        }
    };

    //题目 收缩事件
    $(document).on('click', 'button#shrinkSecondMenu', function(){
        _menuOperate.toggleMenu();
    });

    //加载资源数据
    function loadResourceList(data){
        var _container = $('#leftListInner');
        //资源id存在时，则加载列表
        if('undefined' !== typeof data['resultList'] && $.isArray(data['resultList'])){
            _chessOperate.pageSize = data['resultList'].length;
            _loading.hideIt();      //隐藏加载框
        }
        _chessOperate.pageIndex = -1;
        _chessOperate.prevIndex = -1;
        _container.html(template('tpl-resource', data['resultList']));
    }

    //打分事件
    function starEvent(){
        var _active = 'active',
            _starscore = $("#mainWrap");

        //知识类题目-打分 事件
        $(document).on('click','#starScore ul.list li button', function(ev){
            var _score = parseInt($(this).parent().index()) + 1,
              self = $(this),
              _currectActive = $("#starScore ul.list").find('.active').length;

            if (_score == 1 && _currectActive == 1){
                // 判断是否选中,如果选中，则反选，如果没有选中，则选中
                if(self.parents('li').hasClass('active')){
                    self.parents('li').removeClass(_active);
                    _score = 0;
                }else{
                    self.parents('li').addClass(_active);
                }
            }else{
                $('#starScore .score-content ul.list').find('li').each(function(i, item){
                    if(i < _score){
                        $(item).addClass(_active);
                    }else{
                        $(item).removeClass(_active);
                    }
                });
            }
            _starscore.data('score', _score);
        });

        //知识类题目-打分 确认事件
        $(document).on('click', 'button.btn-star-okay', function(){
            var _score = parseInt(_starscore.data('score')) || 0;
            var _suggest = $("#teacherSuggest").val().trim();
            var _practiceId = $("#leftListInner ul.resource-list li.active").find('button.btn-res-item').data("id");

            //教师评语，提示评语
            if(!_suggest){
                _message.setContent(template('tpl-alert', {
                    message : '请填写教师评语！'
                })).showIt();
                return;
            }

            //提交
            $Request.postInfo($Request.getRouter('correctPractice'),{
                "id": _practiceId,
                "comment" : _suggest,
                "score": _score
            }, function(data){
                $(".btn-box").hide();
                _message.setContent(template('tpl-alert', {
                    message : '提交成功'
                })).showIt();
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("score",_score);
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("comment",_suggest);
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("status",3);
                setTimeout(function(){
                    _message.hideIt();
                    _starscore.data('score','');
	
									var eles = $('#leftListInner button.btn-res-item'), allOk_ = true;
									eles.each(function(){
										$(this).data('status')!='3' ? allOk_ = false:null;
									});
									console.log('allOk_',allOk_);
									if(allOk_) location.reload();
	
	
									$("#btnClassPageNext").trigger('click');
                    
                },9000);
            });
        });

        //围棋类题目-打分 事件
        $(document).on('click','#chessScore ul.list li button', function(ev){
            var _score = parseInt($(this).parent().index()) + 1,
              self = $(this),
              currectActive = $("#chessScore ul.list").find('.active').length;
            if (_score == 1 && currectActive == 1){
                // 判断是否选中,如果选中，则反选，如果没有选中，则选中
                if(self.parents('li').hasClass('active')){
                    self.parents('li').removeClass(_active);
                    _score = 0;
                }else{
                    self.parents('li').addClass(_active);
                }
            }else{
                $('#chessScore .score-content ul.list').find('li').each(function(i, item){
                    if(i < _score){
                        $(item).addClass(_active);
                    }else{
                        $(item).removeClass(_active);
                    }
                });
            }
            _starscore.data('score', _score);
        });

        //围棋类题目-打分 确认事件
        $(document).on('click', 'button.chess-star-okay', function(){
            var _score = parseInt(_starscore.data('score')) || 0;
            var _suggest = $("#chessSuggest").val().trim();
            var _practiceId = $("#leftListInner ul.resource-list li.active").find('button.btn-res-item').data("id");

            //教师评语，提示评语
            if(!_suggest){
                _message.setContent(template('tpl-alert', {
                    message : '请填写教师评语！'
                })).showIt();
                return;
            }
            //提交
            $Request.postInfo($Request.getRouter('correctPractice'),{
                "id": _practiceId,
                "comment" : _suggest,
                "score": _score
            }, function(data){
                $(".btn-box").hide();
                _message.setContent(template('tpl-alert', {
                    message : '提交成功'
                })).showIt();
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("score",_score);
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("comment",_suggest);
                $("#leftListInner ul.resource-list li.active button.btn-res-item").data("status",3);
                setTimeout(function(){
                    _message.hideIt();
                    _starscore.data('score','');
	
									var els = $('#leftListInner button.btn-res-item'), allOk = true;
									els.each(function(){
										$(this).data('status')!='3' ? allOk = false:null;
									});
									console.log('allOK',allOk);
									if(allOk) location.reload();
									
                    $("#btnClassPageNext").trigger('click');
                },1000);
            });
        });

        // 提交按钮
        $(document).on('click',"#btnSubmit",function(){
            var _bool = true;
            $("#leftListInner ul.resource-list li").each(function(){
                if($(this).find("button.btn-res-item").data('status') <= 2 ){
                    _bool = false;
                }
            });
            if (_bool){
                _message.setContent(template('tpl-alert', {
                    message : '提交成功！'
                })).showIt();
                loadStudentList();
                $(".div-submit").hide();
                _practiceStatus = 3;
                setTimeout(_message.hide,1500);
            }else{
                _message.setContent(template('tpl-alert', {
                    message : '还有课程打分未完成！'
                })).showIt();
            }
        })
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
            }, 500);
        },
        //explain 讲解例题
        showExplain : function(data){
            var _main = this.container();
            _main.html(template('tpl-explainPanel', data));
            if(data.score){
                for (var i=0;i<data.score; i++){
                    $("#chessScore ul.list li").eq(i).addClass('active');
                }
            }
            //console.log('explain', data);
            $('#boardBox').html('');
            $('#recordOperate').html('');
            $('#piecesOperate').html('');
            $('#signOperate').html('');

            setTimeout(function(){
                //WQ_Object.disabled = true;      //禁止落子
                WQ_Object.drawBoard("boardBox", data['answer']);

                //操作界面
                WQ_Object.drawWS('recordOperate');
                WQ_Object.drawBlackWhite('piecesOperate');
                WQ_Object.drawSign('signOperate');
            }, 80);
        },
        //knowledge 知识类提问
        showKnowledge : function(data){
            var _main = this.container();
            _main.html(template('tpl-Knowledge', data));
            if(data.score){
                for (var i=0;i<data.score; i++){
                    $("#starScore ul.list li").eq(i).addClass('active');
                }
            }
            //console.log('knowledge', data);
        },
        //chess 棋谱类问答
        showChess : function(data){
            var _main = this.container();
            _main.html('');
            if(data.score){
                for (var i=0;i<data.score; i++){
                    $("#chessScore ul.list li").eq(i).addClass('active');
                }
            }
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

        //上一个
        $(document).on('click', 'button#btnClassPagePrev', function(){
            showPage(_chessOperate.pageIndex - 1 <= 0 ? 0 : _chessOperate.pageIndex - 1);
        });

        //下一个
        $(document).on('click', 'button#btnClassPageNext', function(){
            showPage(_chessOperate.pageIndex + 1 >= _chessOperate.pageSize ? _chessOperate.pageIndex + 1 :_chessOperate.pageSize - 1);
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


    $(function(){
        if(_cookie.hasInfo()){
            loadUserInfo();     //加载用户信息
            loadClassList();    //加载班级列表
            resourceEvent();    //资源列表事件
            starEvent();        //打分事件
            scaleChessBoardEvent(); //棋盘放大缩小功能
            loadEvent();        //加载事件
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});
