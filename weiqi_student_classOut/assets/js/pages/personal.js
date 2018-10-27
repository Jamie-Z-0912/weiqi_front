(function(factory){
    jQuery && factory(jQuery);
})(function($){
    var _loading = new $Request.Loading().showIt(),     //实例化加载图标
        _cookie = $Request.getCookies(),
        _headWearId = 0,
        _message = new $Request.dialog({            //提示信息弹框
            animateName : 'messageScale'
        }),
        _tranMsg = new $Request.tranMsg();          //定时信息弹框

    //加载用户信息
    function loadUserInfo(){
        $Request.getInfo($Request.getRouter('studentInfo'), {}, function(data){
            _loading.hideIt();      //隐藏加载框

            if(parseInt(data['resCode'])){
                if('undefined' !== typeof data['resultList']){
                    data['resultList']['basePath'] = $Request.basePath;
                    _headWearId = data['resultList']['headwear']
                    $('#headWrap').html(template('tpl-user', data['resultList']));
                }
            }else{
                var _msg = '加载信息错误！请重新登录...';
                if('string' === typeof data['message']){
                    _msg += data['message'];
                }
                _message.setContent(template('tpl-message', {message : _msg, 'button' : 'btn-getGiftError'})).showIt();
                $Request.linkTo('login');       //返回登录页
            }
        });
    }

    //
    var switchNav = {
        $content : $('#content'),
        changeStep : function(id){
            id = parseInt(id);
            if(isNaN(id)) return ;            //不是数值则结束
            switch (id){
              case 1 :
                  this.loadScore();  //加载积分
                  break;
              case 2 :
                  this.loadMyTools();       //加载道具
                  break;
              case 3 :
                  this.loadPrize();         //加载奖牌
                  break;
              case 4 :
                  this.loadStore();         //礼品商场
                  break;
            }
        },
        //我的积分
        loadScore : function(){
            var _this = this;
            $Request.getInfo($Request.getRouter('myScore'), {}, function(data){
                if('object' === typeof data && 'undefined' !== typeof data['resultList']){
                    _this.$content.html(template('tpl-score', data['resultList']));
                }
            })
        },
        //我的道具
        loadMyTools : function(){
            var _this = this;
            $Request.getInfo($Request.getRouter('myTools'), {}, function(data){
               data['headwearId'] = _headWearId;
                _this.$content.html(template('tpl-tools', data));
            });
        },
        //我的奖牌
        loadPrize : function(){
            var _this = this;
            $Request.getInfo($Request.getRouter('myPrize'), {}, function(data){
                if (data['resultList'].length == 0){
                    _this.$content.html(template('tpl-prizeNone', {}));
                }else{
                    _this.$content.html(template('tpl-prize', data));
                }
            });
        },
        storeSelectParam : { },
        //更新礼品商场列表
        updateStoreList : function($data){
            $data = $data || {};
            var _this = this,
                unit_id = _cookie.data()['unit_id'];
            console.log(_cookie.data());
            $data.unit_id = unit_id;
            //获取全部商品列表
            $Request.getInfo($Request.getRouter('myStore'), $data, function(data){
                //获取我的积分
                $Request.getInfo($Request.getRouter('myScore'), {}, function(d){
                    if('object' === typeof d && 'undefined' !== typeof d['resultList'] && 'undefined' !== d['resultList']['point']){
                        data['point'] = d['resultList']['point'];
                        $.each(_this.storeSelectParam, function(k, v){
                            data[k] = v;
                        });
                        _this.$content.html(template('tpl-store', data));
                    }
                });
            });
            //end
        },
        //礼品商场
        loadStore : function(){
            var _this = this;
            _this.updateStoreList();
        }
    };

    //更新兑换奖品信息
    function updateGetGift(_id,_num){
        var _num = _num || 1;
        $Request.getInfo($Request.getRouter('getGift'), {
            id : _id,
            num : _num
        }, function(data){
            if('object' === typeof data){
                var _resCode = parseInt(data['resCode']);
                if(!isNaN(_resCode)){
                    if(0 == _resCode && 'undefined' !== typeof data['message']){
                        _message.setContent(template('tpl-giftFailed', {message : data['message']})).showIt();
                        setTimeout(_message.hideIt,1500);
                    }else if(1 == _resCode){
                        _message.hideIt();
                        switchNav.updateStoreList(switchNav.storeSelectParam);
                        _tranMsg.showInfo(template('tpl-message2', {
                            msg : '兑换成功',
                            intro : '已保存至“我的道具”库中'
                        }));
                        //_message.setContent(template('tpl-message', {message : '兑换成功！', 'button' : 'btn-getGiftError'})).showIt();
                    }
                }
                //isNaN end
            }
        })
    }

    //更新头部信息
    function updateHeadWear(_id){
        $Request.getInfo($Request.getRouter('changeHead'), {id : _id}, function(data){
            loadUserInfo();
            _tranMsg.showInfo(template('tpl-message2', {
                msg : '使用成功'
            }));
            switchNav.loadMyTools();
        })
    }

    //加载导航事件
    function loadNavEvent(){
        var _navList = $('#navList'), _active = 'active';

        //栏目跳转
        _navList.on('click', 'li[data-id]', function(){
            _navList.find('li[data-id]').addClass(_active);

            $(this).removeClass(_active);
            switchNav.changeStep($(this).data('id'));
        });

        //个人资料
        $(document).on('click', 'button.btn-personal-info', function(){
            $Request.linkTo('personalInfo');
        });
    }

    //加载事件
    function loadEvent(){
        loadNavEvent();

        //退出事件
        $(document).on('click', 'button#historyBack', function(){
            //_message.setContent(template('tpl-message', {message : '确认要返回吗？', 'button' : 'btn-exit-okay'})).showIt();
            $Request.linkTo('main');
        });

        //类型
        $(document).on('change', 'select#type', function(){
            var _id = parseInt($(this).val());
            if(!isNaN(_id)){
                switchNav.storeSelectParam['type'] = _id;
            }else{
                delete switchNav.storeSelectParam['type'];
            }
            switchNav.updateStoreList(switchNav.storeSelectParam);
        });

        //积分
        $(document).on('change', 'select#orderType', function(){
            var _id = parseInt($(this).val());
            if(!isNaN(_id)){
                switchNav.storeSelectParam['orderType'] = _id;
            }else{
                delete switchNav.storeSelectParam['orderType']
            }
            switchNav.updateStoreList(switchNav.storeSelectParam);
        });

        //获取当前商品信息
        $(document).on('click', 'button.btn-get-now', function(){
            var _id = parseInt($(this).data('id'));
            _message.setContent(template('tpl-storeConfirm',{
                message: "请输入兑换数量"
            })).showIt();
            $("button#storeConfirmBtn").attr('data-id',_id);
            //if(!isNaN(_id)){
            //    updateGetGift(_id);
            //}
        });

        //确定兑换礼品
        $(document).on('click', 'button#storeConfirmBtn', function(){
            //_message.hideIt();
            var _id = parseInt($(this).data('id'));
            var _num = parseInt($("#giftNum").val());
            if (_num <= 0 || isNaN(_num)){
                $("#youNeedNum").html('请输入大于0的整数');
                return;
            }
            $("#youNeedNum").html('');
            if(!isNaN(_id)){
                updateGetGift(_id,_num);
            }
        });

        //关闭提示框
        $(document).on('click', 'button.btn-getGiftError', function(){
            _message.hideIt();
        });

        //立即使用 头饰
        $(document).on('click', 'button.btn-use-now', function(){
            var _id = parseInt($(this).data('id'));
            if(!isNaN(_id)){
                updateHeadWear(_id);
            }
        });
    }

    $(function(){
        loadUserInfo();
        loadEvent();
    });
});