/**
 * Created by yk on 2018/4/18.
 */

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
        _modal = new $Request.modal();

    //加载事件
    function loadEvent(){
        //返回上一页
        $(document).on('click', 'button#btnHistory', function(){
            $Request.backPage();
        });

        //修改日历弹框的标题 - 开始日期
        $(document).on('click', '#appStartDate',function(){
            $("#datetitle h2").html('请选择开始日期');
        });

        //修改日历弹框的标题 - 结束日期
        $(document).on('click', '#appEndDate',function(){
            $("#datetitle h2").html('请选择结束日期');
        });

        //alert提示消息 关闭
        $(document).on('click', 'button.btn-alert-okay', function(){
            _message.hideIt();
        });

        //查询按钮
        $(document).on('click', '#btnSearch', function(){
            var _startTime = $("#appStartDate").html();
            var _endTime = $("#appEndDate").html();
            var _className = $("#className").val();
            if (!CheckDateTime(_startTime)){
                _message.setContent(template('tpl-alert', {
                    message : '开始日期不符合格式，请重试'
                })).showIt();
                return;
            }
            if (!CheckDateTime(_endTime)){
                _message.setContent(template('tpl-alert', {
                    message : '结束日期不符合格式，请重试'
                })).showIt();
                return;
            }
            if (_className == ''){
                _message.setContent(template('tpl-alert', {
                    message : '请填写要搜索的班级名称'
                })).showIt();
                return;
            }

            //发送数据
            $Request.getInfo($Request.getRouter('teacherClass'), {"tid" : _cookie.data()['_userId'], "startTime" : _startTime, "endTime" :_endTime,"className": _className}, function(data){
                $('#courseList').html(template('tpl-courseList', data));
            });
        });

        // 检测开始日期变化
        $('#appStartDate').on('DOMNodeInserted',function(){
            getCourse();
        });
        // 检测结束日期变化
        $('#appEndDate').on('DOMNodeInserted',function(){
            getCourse();
        });
    }

    // 获取课程
    function getCourse(){
        $("#courseList").empty();
        var _startTime = $("#appStartDate").html();
        var _endTime = $("#appEndDate").html();
        var _className = $("#className").val();

        if (!CheckDateTime(_startTime)){
            _message.setContent(template('tpl-alert', {
                message : '开始日期不符合格式，请重试'
            })).showIt();
            return;
        }
        if (!CheckDateTime(_endTime)){
            _message.setContent(template('tpl-alert', {
                message : '结束日期不符合格式，请重试'
            })).showIt();
            return;
        }

        //发送数据
        $Request.getInfo($Request.getRouter('teacherClass'), {"tid" : _cookie.data()['_userId'], "startTime" : _startTime, "endTime" :_endTime,"className": _className}, function(data){
            $('#courseList').html(template('tpl-courseList', data));
        });
    }

    /**
     检查日期格式是否正确
     */
    function CheckDateTime(str){
        var reg = /^(\d+)-(\d{1,2})-(\d{1,2})$/;
        var r = str.match(reg);
        if(r==null) return false;
        r[2]=r[2]-1;
        var d= new Date(r[1], r[2],r[3]);
        if(d.getFullYear()!=r[1])return false;
        if(d.getMonth()!=r[2])return false;
        if(d.getDate()!=r[3])return false;
        return true;
    }

    // 初始化输入框
    function initInput(){
        var now = new Date();
        var time = now.getFullYear() + "-" +((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)+"-"+(now.getDate()<10?"0":"")+now.getDate();
        $("#appStartDate").html(time);
        $("#appEndDate").html('2099-12-31');

        //加载数据
        $Request.getInfo($Request.getRouter('teacherClass'), {"tid" : _cookie.data()['_userId'], "startTime" : time}, function(data){
            $('#courseList').html(template('tpl-courseList', data));
        });
    }



    $(function(){
        //判断是否已登录
        if(_cookie.hasInfo()){
            initInput();                //初始化输入框
            loadEvent();                //加载事件
            _loading.hideIt();          //隐藏加载的Loading框
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});
