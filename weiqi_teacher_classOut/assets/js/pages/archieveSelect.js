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
        _message = new $Request.dialog({                //提示信息弹框
            animateName : 'messageScale'
        });
    
    //加载事件
    function loadEvent(){
        var select_years = null, select_month = null;
        //返回上一页
        $(document).on('click', 'button#btnHistory', function(){
            $Request.backPage();
        });
        $('#curYears').on('click', function () {
          $('#yearsSelectBox').hasClass('active')?$('#yearsSelectBox').removeClass('active'):$('#yearsSelectBox').addClass('active');
        });
			$('#yearsOption').on('click', 'span', function () {
				$(this).addClass('selected').siblings().removeClass('selected');
		    select_years = $(this).text();
		    if(select_years&&select_month){
					$('#yearsSelectBox').removeClass('active');
					$('#curYears').text(select_years+'/'+select_month);
					loadClassInfo(select_years+'-'+select_month);
					select_years = null;
					select_month = null;
					$('#yearsOption span, #monthOption span').removeClass('selected');
        }
			});
			$('#monthOption').on('click', 'span', function () {
				$(this).addClass('selected').siblings().removeClass('selected');
				select_month = $(this).text();
				if(select_years&&select_month){
					$('#yearsSelectBox').removeClass('active');
					$('#curYears').text(select_years+'/'+select_month);
					loadClassInfo(select_years+'-'+select_month);
					select_years = null;
					select_month = null;
					$('#yearsOption span, #monthOption span').removeClass('selected');
				}
			})
    }

    //加载用户信息
    function loadUserInfo(){
        var _userData = _cookie.data();
        //获取教师信息
        $Request.getInfo($Request.getRouter('teacherInfo'), {"id" : _userData['_userId']}, function(data){
            _loading.hideIt();      //隐藏加载框
            if(parseInt(data['resCode'])){
                if('undefined' !== typeof data['resultList']){
                    data['resultList']['basePath'] = $Request.basePath;
                    $('#headWrap').html(template('tpl-user', data['resultList']));
                }
            }else{
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

    //加载绩效
    function loadClassInfo(date){
        var _userData = _cookie.data();
        //获取绩效信息
        $Request.getInfo($Request.getRouter('teacherRecord'),{"tid" : _userData['_userId'],startTime:date,endTime:date},function(data){
            _loading.hideIt();
            if('undefined' !== typeof data['resultList']){
                $("#archieveInfo").html(template('tpl-class', data['resultList']));
            }
        })
    }

    $(function(){
			var thisYears = new Date().getFullYear(),
				thisMonth = new Date().getMonth()+1;
			$('#curYears').text(thisYears+'/'+thisMonth);
			if(thisYears>2018){
				for (var i=2019; i<=thisYears; i++){
					$('#yearsOption dd').append('<span>'+i+'</span>');
				}
			}
        //判断是否已登录
        if(_cookie.hasInfo()){
            loadUserInfo();             //加载用户信息
            loadEvent();                //加载事件
            loadClassInfo(thisYears+'-'+thisMonth);            //加载绩效
            _loading.hideIt();          //隐藏加载的Loading框
        }else{
            $Request.linkTo('login');       //返回登录页
        }
    });
});
