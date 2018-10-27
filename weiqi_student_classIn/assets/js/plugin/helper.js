//学员级别
template.helper('memberLevel', function(val){
    val = val && parseInt(val) || 0;
    if(1 == val){
        return '入门';
    }else if(2 == val){
        return '初级';
    }else if(3 == val){
        return '专业1';
    }else if(4 == val){
        return '专业2';
    }else if(5 == val){
        return '专业3';
    }
    return '未知';
});

//性别
template.helper('gender', function(val){
    val = val && parseInt(val) || 0;
    if(0 == val){
        return '女';
    }else if(1 == val){
        return '男';
    }else{
        return '未知';
    }
});

//日期转换
template.helper('formatDate', function(val){
    return (function(_date){
        return _date.getFullYear() + '-' + (_date.getMonth() + 1) + '-' + _date.getDate();
    })(new Date(val));
});