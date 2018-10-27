/**
 * Created by yk on 2018/5/2.
 */

(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _towerId = 0,                               //修炼塔id
        _barrierPage = 0,                           //关卡第几页
        _totalPage = 1,                             //关卡总共几页
        _recordid = 0,                              //关卡记录id
        _message = new $Request.dialog({            //提示信息弹框
            animateName: 'messageScale'
        });

    //加载事件
    function loadEvent(){
        //返回按钮 -> 返回首页
        $(document).on('click', 'button#backHome', function(){
            $Request.linkTo('main');
        });
        //返回按钮 -> 返回修炼塔
        $(document).on('click', 'button#backTower', function(){
            getTowerList();
            $(".barrier-list").css("display","none");
            $(".tower-list").css("display","block");
        });
        //返回按钮 -> 返回关卡
        $(document).on('click','button#backBarrier', function(){
            _message.setContent(template('tpl-exitQuestion', {
                message : '如果未答完题目，退出将丢失战绩，确定退出吗？'
            })).showIt();
        });
        //确定返回关卡
        $(document).on('click','button#exitQuestionOk', function(){
            $Request.getInfo($Request.getRouter('quitGate'), {
                "record_id": _recordid
            }, function(){
                getBarrierList(_towerId);   //获取关卡列表
                getBarrierData(_towerId);   //获取关卡数据
                $(".barrier-list").css("display","block");
                $(".question-list").css("display","none");
            });
            _message.hideIt();
        });
        //点击修炼塔，显示对应关卡
        $(document).on('click','.tower-list ul li',function(){
            var _id = parseInt($(this).data('towerid'));
            if(!isNaN(_id)){
                goToBarrier(_id);
            }
        });
        //点击关卡，显示对应题目
        $(document).on('click','.barrier-nav .barrier-item',function(){
            //var _id = parseInt($(this).data('id'));
            var _id = $(this).data('id');
            var _status = $(this).data('status');
            var _result = $(this).data('result');
            if(_status == 0){
                _message.setContent(template('tpl-barrierIntoDefeat', {
                    message : '当前关卡尚未解锁！'
                })).showIt();
                setTimeout(function(){
                    _message.hideIt();
                },1500);
            }else{
                getIntoBarrier(_id);   //进入关卡
            }
        });
        //使用消耗卡
        $(document).on('click', 'a.card-use',function(){
            //如果消耗卡为0，则不做任何操作。
            if($(this).data('num') == 0){
                return;
            }else{
                var _name = $(this).data('name');
                var _id = $(this).data('id');
                _message.setContent(template('tpl-useCard', {
                    message : '确定要使用'+ _name +'吗？',
                    cardid: _id
                })).showIt();
            }
        });
        //确定使用消耗卡
        $(document).on('click', 'button#useThisCard', function(){
            var _questionid = $("#submitChess").data('questionid');
            var _cardid = $(this).data('cardid');
            $Request.getInfo($Request.getRouter('useCard'), {
                "record_id": _recordid,
                "content_id": _questionid,
                "card_id": _cardid
            }, function(data){
                //如果有返回answer，则使用的是“作业提示卡”，显示答案。否则使用的是“战绩保护卡”
                if(data['resultList']['answer']){
                    drawChessBoard(data['resultList']['answer']);
                    WQ_Object.setFinalPiece(data['resultList']['answer']);
                    console.log("作业提示卡使用成功。");
                }else{
                    console.log("战绩保护卡使用成功。");
                }
                getCardList(); //重新获取消耗卡数量和列表
            });
            _message.hideIt();
        });
        //取消使用消耗卡,取消退出答题
        $(document).on('click', 'button.message-cancle', function(){
            $("#useThisCard").data('cardid','');
            _message.hideIt();
        });
        //提交题目
        $(document).on('click', 'button#submitChess',function(){
            var _questionid = $(this).data('questionid'),
                //_answer = WQ_Object.getSgf();
                _answer = WQ_Object.getStudentPiece();
            $Request.getInfo($Request.getRouter('answer'), {
                "record_id": _recordid,
                "content_id": _questionid,
                "answer": _answer
            }, function(data){
                var _result = data.resultList;
                // status为0,表示答题未完成，还有下一题。为1表示答题完成
                if (_result.status == 0){
                    $("#chessOperate").html(template('tpl-chessOperate', _result['next']));
                    WQ_Object.setOriginPiece(_result["next"]['content']);
                    drawChessBoard(_result["next"]['content']);
                }else{
                    $("button#submitChess").hide();
                    if (_result.result == 0){
                        // 闯关之前默认的弹框
                        _message.setContent(template('tpl-barrierFailed', {
                            message : '很遗憾，闯关失败！'
                        })).showIt();
                        setTimeout(function(){
                            $(".question-list").hide();
                            $(".barrier-list").show();
                            getBarrierData(_towerId);
                            _message.hideIt();
                        },1500);

                        //闯关有音效和视频
                        //var as = document.getElementById('audioSuccess'),
                        //  vs = document.getElementById('videoSuccess');
                        //$("#gateModel").show();
                        //as.play();
                        //vs.play();
                        //setTimeout(function(){
                        //    $(".question-list").hide();
                        //    $(".barrier-list").show();
                        //    $("#gateModel").hide();
                        //    getBarrierData(_towerId);
                        //},3000);
                    }else{
                        // 闯关之前默认的弹框
                        //_message.setContent(template('tpl-barrierSuccess', {
                        //    message : '恭喜闯关成功，获得：',
                        //    score: _result.point
                        //})).showIt();
                        //setTimeout(function(){
                        //    $(".question-list").hide();
                        //    $(".barrier-list").show();
                        //    getBarrierData(_towerId);
                        //    _message.hideIt();
                        //},3000);

                        //闯关有音效和视频
                        var as = document.getElementById('audioSuccess'),
                          vs = document.getElementById('videoSuccess');
                        $("#gateModel").show();
                        as.play();
                        vs.play();
                        setTimeout(function(){
                            $(".question-list").hide();
                            $(".barrier-list").show();
                            $("#gateModel").hide();
                            getBarrierData(_towerId);
                        },3000);
                    }
                }
            });
        });
        //关卡切换下一页
        $(document).on('click','button#btnBarrierPageNext',function(){
            if((_barrierPage + 1 ) >= _totalPage){
                _message.setContent(template('tpl-barrierPageDefeat', {
                    message : '已经是最后一页了！'
                })).showIt();
                setTimeout(function(){
                    _message.hideIt();
                },1500);
            }else{
                _barrierPage += 1;
                getBarrierList(_towerId, _barrierPage);
            }
        });
        //关卡切换上一页
        $(document).on('click','button#btnBarrierPagePrev',function(){
            if((_barrierPage - 1 ) <= 0){
                _message.setContent(template('tpl-barrierPageDefeat', {
                    message : '已经是第一页了！'
                })).showIt();
                setTimeout(function(){
                    _message.hideIt();
                },1500);
            }else{
                _barrierPage -= 1;
                getBarrierList(_towerId, _barrierPage);
            }
        });
    }

    //判断是否有权限进入修炼塔对应的关卡-
    function goToBarrier(_id){
        $Request.getInfo($Request.getRouter('checkTower'), {'tower_id': _id}, function(data){
            //进入失败，弹出失败提示。
            if(data.resCode != 1){
                _message.setContent(template('tpl-goToBarrierDefeat',{
                    message: data['message']
                })).showIt();
                setTimeout(function(){
                    _message.hideIt();
                },1500);
            }else{ // 进入成功，记录修炼塔ID，并进入修炼塔对应关卡。
                _towerId = _id;
                getBarrierList(_towerId);   //获取关卡列表
                getBarrierData(_towerId);   //获取关卡数据
            }
        });
    }

    //获取关卡列表
    function getBarrierList(_towerId,_barrierPage){
        $Request.getInfo($Request.getRouter('gateList'), {"tower_id": _towerId,"offset": _barrierPage}, function(data){
            _totalPage = data.total;
            $('#barrierList').html(template('tpl-barrierList', data));
        });
        $(".barrier-list").css("display","block");
        $(".tower-list").css("display","none");
    }

    //获取关卡数据
    function getBarrierData(_towerId){
        $Request.getInfo($Request.getRouter('curGate'), {"tower_id": _towerId}, function(data){
            $('#barrierData').html(template('tpl-barrierData', data['resultList']));
        });
    }

    //获取修炼塔列表
    function getTowerList(){
        $Request.getInfo($Request.getRouter('towerList'), {}, function(data){
            if (data.resCode == 1){
                $('#towerList').html(template('tpl-tower-list', data));
            }else{
                _message.setContent(template('tpl-tipMessage',{
                    message: data.message
                })).showIt();
                setTimeout(_message.hideIt,1500);
            }
        });
    }

    //开始关卡
    function getIntoBarrier(_id){
        $Request.getInfo($Request.getRouter('startGate'), {"tower_id":_towerId , "gate_id": _id}, function(data){
            if(data.resCode == 1){
                _recordid = data.resultList.record_id;
                getResource();      //获取题目列表
                getCardList();      //获取道具列表
                $(".barrier-list").css("display","none");
                $(".question-list").css("display","block");
            }else{
                _message.setContent(template('tpl-tipMessage',{
                    message: data.message
                })).showIt();
                setTimeout(_message.hideIt,1500);
            }
        });
    }

    //获取对应题目列表
    function getResource(){
        $Request.getInfo($Request.getRouter('firstQuestion'), {"record_id":_recordid}, function(data){
            $("#chessOperate").html(template('tpl-chessOperate', data["resultList"]));
            var _content = data["resultList"]["content"];
            WQ_Object.setOriginPiece(_content);
            drawChessBoard(_content);
        });
    }

    //获取道具列表
    function getCardList(){
        $Request.getInfo($Request.getRouter('cardList'), {}, function(data){
            $("#cardList").html(template('tpl-cardList', data));
        });
    }

    //画棋谱
    function drawChessBoard(_content){
        $('#boardBox').html('');
        $('#recordOperate').html('');
        $('#piecesOperate').html('');

        //操作界面
        //WQ_Object.drawWS('recordOperate');
        WQ_Object.drawBlackWhite('piecesOperate');
        WQ_Object.drawBoard("boardBox", _content);
    }

    $(function(){
        //判断是否已登录
        if(_cookie.hasInfo()){
            loadEvent();                //加载事件、
            getTowerList();             //获取修炼塔列表
            _loading.hideIt();
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});