import {piecePath} from './piecePath';

/**
 * 常量定义
 */
const whiteCls = 'cls-white';               //白棋类名
const blackCls = 'cls-black';               //黑棋类名
const triangleCls = 'cls-triangle';         //三角形
const squareCls = 'cls-square';             //正方形
const roundnessCls = 'cls-roundness';       //圆形
const forkCls = 'cls-fork';                 //叉形
const params = {
    //9*9
    sz9 : {
        chess : {
            radius : 46
        },
        sign : {
            radius : 24
        }
    },
    //19*19
    sz19 : {
        chess : {
            radius : 23
        },
        sign : {
            radius : 12
        }
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
 * 创建棋子父类，供新棋子克隆
 * @param svg   svg节点
 * @param param 初始化参数
 * @returns {*}
 */
function getClonePieces(svg, param){
    let group = svg.group();
    let image = group.put(svg.image(param.imgData));

    group.size(param.svgWidth, param.svgHeight).move(param.cx, param.cy).data('pos', param.pos);
    image.size(param.width, param.height).move(param.imgX,param.imgY);
    return group;
}

//棋子 父类
class Pieces{
    /**
     * 构造函数
     * @param svg     svg对象
     */
    constructor(param){
        this.svg = param.svg || null;
        this.pos = param.pos || '';          //坐标标识
        this.cId = param.cId || '';         //圆ID
        this.cls = param.cls || '';              //圆类名
        this.cx = param.cx || -32;                //x轴偏移
        this.cy = param.cy || -32;                //y轴偏移
        this.radius = param.radius || 23;            //圆直径
        this.imgData = param.imgData || '';          //base64位 code
        this.imgId = param.imgId || '';                //图ID
        this.cloneGroup = param.cloneGroup || null;     //克隆对象容器

        this.imgX = -(this.radius/2);              //x轴
        this.imgY = -(this.radius/2);              //y轴
        this.width = this.radius;             //图片宽度
        this.height = this.radius;            //图片高度

        this.svgWidth = param.svgWidth || this.radius;
        this.svgHeight = param.svgHeight || this.radius;

        //拷贝 棋子
        this.parentPiece = getClonePieces(param.svg, this);
        this.parentPiece.hide();

        //添加到克隆集中
        if('object' === typeof this.cloneGroup){
            this.cloneGroup.put(this.parentPiece);
        }
    }

    /**
     * 重置图片大小
     * @param param 等于 createPieces函数opts
     */
    resetSize(param){
        this.imgX = -(this.radius/2);              //x轴
        this.imgY = -(this.radius/2);              //y轴
        this.width = this.radius;             //图片宽度
        this.height = this.radius;            //图片高度

        this.svgWidth = param.svgWidth || this.radius;
        this.svgHeight = param.svgHeight || this.radius;
    }

    /**
     * 重置参数
     * @param param 等于 createPieces函数opts
     */
    resetParam(param){
        if('undefined' !== typeof param.svg) this.svg = param.svg;
        if('undefined' !== typeof param.pos) this.pos = param.pos;
        if('undefined' !== typeof param.cId) this.cId = param.cId;
        if('undefined' !== typeof param.cls) this.cls = param.cls;
        if('undefined' !== typeof param.cx) this.cx = param.cx;
        if('undefined' !== typeof param.cy) this.cy = param.cy;
        if('undefined' !== typeof param.radius){
            this.radius = param.radius;
            this.resetSize(param);
        }
        if('undefined' !== typeof param.imgData) this.imgData = param.imgData;
        if('undefined' !== typeof param.imgId) this.imgId = param.imgId;
    }

    /**
     * 拷贝 创建 新棋子
     * @param opts
     * @returns {*}
     */
    createPieces(opts){
        if('object' === typeof opts){
            this.resetParam(opts);
        }
        let group = this.parentPiece.clone();
        group.size(this.svgWidth, this.svgHeight).move(this.cx, this.cy).data('pos', this.pos).show();
        return group;
    }

    /**
     * 创建棋子
     * @param opts      构造函数中所有param属性
     * @returns {*}
     */
    createPieces2(opts){
        if('object' === typeof opts){
            this.resetParam(opts);
        }
        let group = this.svg.group();
        let image = group.put(this.svg.image(this.imgData));

        group.size(this.svgWidth, this.svgHeight).move(this.cx, this.cy).data('pos', this.pos);
        image.size(this.width, this.height).move(this.imgX,this.imgY);
        return group;
    }
}

//黑棋
class Black extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
           "svg" : svg,
            "radius" : info.chess.radius,
            "imgData" : piecePath.black,
            "cls" : blackCls,
            "cloneGroup" : cloneGroup
        });
    }

    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//白棋
class White extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.chess.radius,
            "imgData" : piecePath.white,
            "cls" : whiteCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//三角形
class Triangle extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            //"svgWidth" : 23,
            //"svgHeight" : 23,
            "imgData" : piecePath.triangle,
            "cls" : triangleCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//三角形 黑
class TriangleBlack extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            //"svgWidth" : 23,
            //"svgHeight" : 23,
            "imgData" : piecePath.triangleBlack,
            "cls" : triangleCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//正方形
class Square extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.square,
            "cls" : squareCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//正方形 黑
class SquareBlack extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.squareBlack,
            "cls" : squareCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//圆形
class Roundness extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.roundness,
            "cls" : roundnessCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//圆形 黑
class RoundnessBlack extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.roundnessBlack,
            "cls" : roundnessCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//X形
class Fork extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.fork,
            "cls" : forkCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

//X形 黑
class ForkBlack extends Pieces{
    constructor(svg, cloneGroup, size){
        let info = params.switchSize(size);
        super({
            "svg" : svg,
            "radius" : info.sign.radius,
            "imgData" : piecePath.forkBlack,
            "cls" : forkCls,
            "cloneGroup" : cloneGroup
        });
    }
    //创建棋子
    createPieces(opts){ return super.createPieces(opts); }
}

/**
 * 导出功能函数
 */
export {White, Black, Triangle, TriangleBlack, Square, SquareBlack, Roundness, RoundnessBlack, Fork, ForkBlack};