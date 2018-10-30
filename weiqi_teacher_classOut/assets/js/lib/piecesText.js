//常量 参数
const params = {
    //9*9
    sz9 : {
        fontSize : '16px',
        xCha : .75,
        yCha : 3.2
    },
    //19*19
    sz19 : {
        fontSize : '8px',
        xCha : .7,
        yCha : 1.7
    },
    switchSize(_size){
        let info;
        switch (_size){
            case 9:
                info = this.sz9;
                break;
            default:
                info = this.sz19;
                break;
        }
        return info;
    }
};

/**
 * 棋子手数
 */
class PiecesText{
    /**
     * 构造函数
     * @param svg
     * @param cloneGroup
     * @param _size
     */
    constructor(svg, cloneGroup, _size){
        let info = params.switchSize(_size);
        this.info = info;
        this.svg = svg || null;
        this.cloneGroup = cloneGroup || null;
        this.index = 0;             //手数，默认0
        this._x = 0;
        this._y = 0;
        this.colors = {
            black : '#000000',
            white : '#ffffff'
        };
        this._color = '#000';

        //父对象，克隆使用
        this.parentText = this.svg.plain('-1').move(this._x, this._y).font({
            family: 'Helvetica',
            size: info.fontSize,
            anchor: 'middle',
            leading : ''
        }).hide();

        //添加到克隆集中
        if('object' === typeof this.cloneGroup){
            this.cloneGroup.put(this.parentText);
        }
    }

    //返回黑色
    getBlackColor(){
        return this.colors.black;
    }

    //返回白色
    getWhiteColor(){
        return this.colors.white;
    }

    //获取 手数
    getIndex(){
        return this.index;
    }

    /**
     * 设置手数
     * @param index
     */
    setIndex(index){
        if('number' === typeof index) this.index = index;
    }

    /**
     * 判断是否为颜色值
     * @param value
     * @returns {boolean}
     */
    isColor(value){
        return 'string' === typeof value && '#' == value.charAt(0);
    }

    //获取 颜色
    getColor(){
        return this._color;
    }

    /**
     * 设置颜色
     * @param value
     */
    setColor(value){
        if(this.isColor(value)){
            this._color = value;
        }
    }

    /**
     * 创建文字
     * @param value
     * @param x
     * @param y
     * @param color
     */
    createText(value, x, y, color){
        //内容存在时，添加对应位置
        if('number' === typeof value && '' != $.trim(value) && 'number' === typeof x && 'number' === typeof y){
            let _this = this,
                _text = _this.parentText.clone();
            /*
                _viewbox = this.svg.viewbox(),
                _xPercent = .5 / 368 * _viewbox.width,
                _yPercent = 1.5 / 367.36 * _viewbox.height;*/

            //_text.plain(value).move(x, y).show();       //
            _text.plain(value).dx(x-_this.info.xCha).dy(y+_this.info.yCha).show();       //

            if(_this.isColor(color)){
                _text.fill(color);
            }else{
                _text.fill(_this._color);
            }

            return _text;
        }
        return null;
    }
}

export {PiecesText};