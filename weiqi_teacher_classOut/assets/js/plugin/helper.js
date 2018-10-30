//学员级别
template.helper('memberLevel', function(val){
    val = val && parseInt(val) || 0;
    if(1 == val){
        return '入门';
    }else if(2 == val){
        return '新手';
    }else if(3 == val){
        return '专业';
    }
    return '';
});