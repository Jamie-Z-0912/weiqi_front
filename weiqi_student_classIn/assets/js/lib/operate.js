import {piecePath} from './piecePath';

/* - - - - - - - - - - - - - - - - - - - - - 操作界面参数 - - - - - - - - - - - - - - - - - - - - - */
const panelViewBox = '0 0 210 70';
const signWidth = 70;
const signHeight = 70;

const clsDefault = 'cls-op-point';                 //鼠标 手 样式
const clsOpacity = 'cls-opacity';                 //透明类
const checkedName = 'checked';                    //被选中状态
const rightStyle = $('<style />').attr('type', 'text/css').text('.' + clsOpacity + '{ opacity : .5; transform:scale(.9); transform-origin: center center; }.' + clsDefault +'{ cursor: pointer; }');

//操作按钮 父类
class Operate{
    //构造函数
    constructor(){}

    //添加公共属性
    addPublicAttr(nodeList, _w, _h){
        nodeList.forEach(function(node, i){
            node.width('number' === typeof _w ? _w : signWidth).height('number' === typeof _h ? _h : signHeight).data('checked', false).addClass(clsDefault);
        });
    }
    //得置未选择项
    resetAllCheck(curNode, nodeList){
        var _this = this;
        nodeList.forEach(function(node, i){
            if(curNode != node){
                _this.unChecked(node);
            }
        });
    }
    //切换选中状态
    toggleChecked(node){
        let _checked = node.data(checkedName);

        if(!_checked){
            this.checked(node);
        }/*else{
         this.unChecked(node);
         }*/
        return node.data(checkedName);
    }
    //切换到选中状态
    checked(node){
        node.data(checkedName, true);
        node.addClass(clsOpacity)
    }
    //切换到未选中状态
    unChecked(node){
        node.data(checkedName, false);
        node.removeClass(clsOpacity);
    }
    //卸载所有状态
    unCheckedAll(nodeList){
        var _this = this;
        nodeList.forEach(function(node, i){
            _this.unChecked(node);
        });
    }
}

//前进 后退
class WS extends Operate{
    constructor(id){
        super();
        this.svg = SVG(id).viewbox(panelViewBox);
        $(this.svg.defs().node).append(rightStyle.clone());
    }

    initial(){
        const svg = this.svg;
        this.first = svg.image(piecePath.first).move(-50, 0).attr('name', '第一步');
        this.retreat = svg.image(piecePath.back).move(25, 0).attr('name', '退一步');
        this.advance = svg.image(piecePath.next).move(110, 0).attr('name', '前进一步');
        this.last = svg.image(piecePath.last).move(190, 0).attr('name', '最后一步');
        super.addPublicAttr([this.first, this.retreat, this.advance, this.last]);
        return this;
    }
    //切换选中状态
    toggleChecked(node){
        let checked = super.toggleChecked(node);
        if(checked){
            super.resetAllCheck(node, [this.first, this.retreat, this.advance, this.last]);
        }
        return checked;
    }
    checked(node){
        super.checked(node);
    }
    unChecked(node){
        super.unChecked(node);
    }
}

//黑白交替
class BlackAndWhite extends Operate{
    constructor(id){
        super();
        this.svg = SVG(id).viewbox(panelViewBox);
        $(this.svg.defs().node).append(rightStyle.clone());
    }

    initial(){
        const svg = this.svg;
        this.wb = svg.image(piecePath.whiteBlack).move(-50, 0).attr('name', '黑白棋');
        this.w = svg.image(piecePath.white).move(25, 0).attr('name', '白棋');
        this.b = svg.image(piecePath.black).move(110, 0).attr('name', '黑棋');
        this.del = svg.image(piecePath.del).move(190, 0).attr('name', '提子');
        super.addPublicAttr([this.wb, this.w, this.b, this.del]);
        return this;
    }
    //切换选中状态
    toggleChecked(node){
        let checked = super.toggleChecked(node);
        if(checked){
            super.resetAllCheck(node, [this.wb, this.w, this.b, this.del]);
        }
        return checked;
    }
    checked(node){
        super.checked(node);
    }
    unChecked(node){
        super.unChecked(node);
    }
    unCheckedAll(){
        super.unCheckedAll([this.wb, this.w, this.b, this.del]);
    }
}

//标记
class Sign extends Operate{
    constructor(id){
        super();
        this.svg = SVG(id).viewbox(panelViewBox);
        $(this.svg.defs().node).append(rightStyle.clone());
    }
    initial(){
        const svg = this.svg;
        this.triangle = svg.image(piecePath.triangle).move(-55, -0).attr('name', '三角形');
        this.square = svg.image(piecePath.square).move(5, -0).attr('name', '方形');
        this.roundness = svg.image(piecePath.roundness).move(65, -0).attr('name', '圆形');
        this.fork = svg.image(piecePath.fork).move(125, -0).attr('name', '叉');
        this.wipe = svg.image(piecePath.wipe).move(190, -0).attr('name', '擦除');
        super.addPublicAttr([this.triangle, this.square, this.roundness, this.fork, this.wipe], 60, 60);
        return this;
    }
    //切换选中状态
    toggleChecked(node){
        let checked = super.toggleChecked(node);
        if(checked){
            super.resetAllCheck(node, [this.triangle, this.square, this.roundness, this.fork, this.wipe]);
        }
        return checked;
    }
    checked(node){
        super.checked(node);
    }
    unChecked(node){
        super.unChecked(node);
    }
    unCheckedAll(){
        super.unCheckedAll([this.triangle, this.square, this.roundness, this.fork, this.wipe]);
    }
}

export {WS, BlackAndWhite, Sign};