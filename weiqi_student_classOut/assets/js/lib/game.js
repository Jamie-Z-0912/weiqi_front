import {Black, White, Triangle, TriangleBlack, Square, SquareBlack, Roundness, RoundnessBlack, Fork, ForkBlack} from './pieces';
import {PiecesText} from './piecesText';
import DataSet from './dataSet';

//棋子类型
const constantPieces = {
    W : 'white',                //白棋
    B : 'black',                //黑棋
    T : 'triangle',             //三角形
    S : 'square',               //正方形
    R : 'roundness',            //圆形
    F : 'fork'                  //叉
};
//操作类型
const constantOperate = {
    chess : 'chess',            //对弈
    alone : 'alone',            //单子
    sign : 'sign',               //标记
    take : 'take',              //提子
    wipe : 'wipe'            //擦除
};

/* 专为【学生课后端】修炼塔 */
let setChess = new Map(); //map存放学生添加的棋子,然后在weiqi.js中和原始棋子拼接。

let rememberPieces = constantPieces.B;          //记录最新 黑白棋子 状态（当切换标记操作时,返回可正常落子）
                                                //默认:白棋
/**
 * 重置黑白棋
 * @param _this
 */
function resetRememberPieces(_this){
    rememberPieces = _this.currentPieces == constantPieces.B ? constantPieces.W : constantPieces.B;
}

/*———————————————————————————— 棋子功能操作 ————————————————————————————*/
/**
 * 当前棋子切换
 * @param _chess
 */
function changeCurrentPieces(){
    let _lastItem = DataSet.getLastItem();

    if(_lastItem.move.c == DataSet.WGo.B){              //黑
        rememberPieces = constantPieces.B;
    }else if(_lastItem.move.c == DataSet.WGo.W){        //白
        rememberPieces = constantPieces.W;
    }
}

/**
 * 添加手数
 * @param _this
 * @param circle
 * @param x
 * @param y
 * @param _chess
 * @param _value
 */
function createNumber(_this, circle, x, y, _chess, _value){
    let color = _this.piecesText.getBlackColor();                              //DataSet.WGo.W 白
    if(_chess == DataSet.WGo.B) color = _this.piecesText.getWhiteColor();      //DataSet.WGo.B 黑

    //判断设置数值是否存在
    _value = 'number' === typeof _value ? _value : (function(_text){
        _text.setIndex(_text.getIndex() + 1);               //递增手数值
        DataSet.setNumber(_this.piecesText.getIndex());     //记录中 存储手数
        return _text.getIndex();                            //返回当前手数值
    })(_this.piecesText);

    circle.setNumber(_this.piecesText.getIndex());          //编辑区域 添加手数 标识

    //创建手数，并添加到手数集 容器中， 且手数上添加区域坐标标识
    _this.board._textGroup.put(_this.piecesText.createText(_value, x, y, color)).data('pos', circle.getPos());          //
}

/**
 * 记录数据 棋子
 * @param _piecesObj
 * @param _param
 * @param _mark
 * @returns {*}
 * @constructor
 */
function CreateChess(_piecesObj, _param, _mark){
    _param.circle.setChess(_mark);                  //添加该区域存放的 棋子类型

    return _piecesObj.createPieces({
        pos : _param.position,
        cx : _param.x,
        cy : _param.y
    });
}

/**
 * 对弈
 * @param _this
 * @param param
 */
function playChess(_this, param){
    let _pieces,
        _circle = param.circle,
        _wb = -1;
    if(_circle.hasChess()) return;         //如果存在棋子， 则结束操作
    DataSet.createHandle();                 //创建新记录对象
    //changeCurrentPieces();                  //切换当前为黑棋或白棋

    //判断下白棋或黑棋
    DataSet.judgeChess(() => {
        _this.currentPieces = constantPieces.W;
    }, () => {
        _this.currentPieces = constantPieces.B;
    }, () => {
        _this.currentPieces = constantPieces.B;     //默认 黑棋
    });

    //白棋
    if(_this.currentPieces == constantPieces.W){
        _this.currentPieces = constantPieces.B;                             //切换到   黑子
        _pieces = CreateChess(_this.WhitePieces, param, DataSet.WGo.W);     //创建    白子
        //保存记录 白子
        DataSet.setChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.W });
        _wb = DataSet.WGo.W;    // 白棋
    }
    //黑棋
    else if(_this.currentPieces == constantPieces.B){
        _this.currentPieces = constantPieces.W;                             //切换到   白子
        _pieces = CreateChess(_this.BlackPieces, param, DataSet.WGo.B);     //创建    黑子
        //保存记录 黑子
        DataSet.setChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.B });
        _wb = DataSet.WGo.B;    //黑棋
    }
    _this.board.setPieces(_pieces);                         //添加到棋子集中
    rememberPieces = _this.currentPieces;                   //记录最新 黑白棋子 状态
    DataSet.setPosition(_circle.getPos());                  //存储坐标 标识

    createNumber(_this, _circle, param.x, param.y, _wb);    //添加手数
}

/**
 * 下单子
 * @param _this
 * @param param
 */
function playSingle(_this, param){
    let _pieces,
        _circle = param.circle,
        _dataList = DataSet.getList();
    if(_circle.hasChess()) return;         //如果存在棋子， 则结束操作

    //如果初始化数据结束位置，存在辅助节点仓库，则重新创建
    if(DataSet.getStartIndex() == _dataList.length - 1 && DataSet.lastHasAssist()){
        DataSet.createAssistNode();     //重新创建辅助节点
    }else{
        DataSet.getAssistNode();        //添加辅助节点(如果存在，则创建)
    }

    //白
    if(constantPieces.W == _this.currentPieces) {
        _pieces = CreateChess(_this.WhitePieces, param, DataSet.WGo.W);        //创建    白子
        //保存记录 添加白子
        DataSet.setAWChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.W });
    }
    //黑
    else if(constantPieces.B == _this.currentPieces) {
        _pieces = CreateChess(_this.BlackPieces, param, DataSet.WGo.B);        //创建    黑子
        //保存记录 添加黑子
        DataSet.setABChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.B });
    }

    _this.board.setPieces(_pieces);                     //添加到棋子集中
    //rememberPieces = _this.currentPieces;               //记录最新 黑白棋子 状态
}

/**
 * 删除棋子
 * @param _this
 * @param _param
 */
function clearPieces(_this, _param){
    //添加辅助节点
    DataSet.getAssistNode();
    //保存记录 删除棋子
    DataSet.setAEChess({ pos : _param.position, x : _param.info.x , y : _param.info.y, c : _param.circle.getChess().mark });

    //删除棋盘上棋子节点
    _this.board.clearPieces(_param.position, _param.circle);

    //判断是否存在标记
    if(_param.circle.hasNumber()){
       _this.board.clearNumber(_param.circle.getPos());
    }
}

/*———————————————————————————— 标记功能操作 ————————————————————————————*/
/**
 * 获取当前点击区域状态
 * @param _circle
 */
function getSignWB(_circle){
    return (function(_chess){
        if('undefined' === typeof _chess.mark) return 1;            //如果空白区域，为白色标记
        else return _chess.mark;                                    //-1白子区域为黑色标记, 1黑子区域为白色标记
    })(_circle.getChess());
}

/**
 * 记录数据 标记
 * @param _piecesObj
 * @param _param
 * @param _mark
 * @returns {*}
 * @constructor
 */
function CreateSign(_piecesObj, _param, _mark){
    _param.circle.setSign(_mark);                  //添加该区域存放的 标记类型

    return _piecesObj.createPieces({
        pos : _param.position,
        cx : _param.x,
        cy : _param.y
    });
}

/**
 * 标记
 * @param _this
 * @param param
 */
function playSign(_this, param){
    let _pieces,
        _circle = param.circle,
        _dataList = DataSet.getList(),
        _wb = getSignWB(_circle);       //1黑 -1白

    //如果初始化数据结束位置，存在辅助节点仓库，则重新创建
    if(DataSet.getStartIndex() == _dataList.length - 1 && DataSet.lastHasAssist()){
        DataSet.createAssistNode();     //重新创建辅助节点
    }else{
        DataSet.getAssistNode();        //添加辅助节点(如果存在，则创建)
    }

    //如果存在棋子 相关操作
    if(_circle.hasSign()){
        //删除记录中标记数据
        DataSet.clearSign(param.position, param.circle.getSign().mark);
        //删除之前标记，重新添加
        _this.board.clearSign(_circle.getSign().pos);
    }

    //三角形
    if(constantPieces.T == _this.currentPieces){
        _pieces = CreateSign(_wb == 1 ? _this.trianglePieces : _this.triangleBlackPieces, param, DataSet.WGo.T);
        //保存记录 三角形
        DataSet.setTRSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.T });
    }
    //正方形
    else if(constantPieces.S == _this.currentPieces){
        _pieces = CreateSign(_wb == 1 ? _this.squarePieces : _this.squareBlackPieces, param, DataSet.WGo.S);
        //保存记录 方形
        DataSet.setSQSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.S });
    }
    //圆形
    else if(constantPieces.R == _this.currentPieces){
        _pieces = CreateSign(_wb == 1 ? _this.roundnessPieces : _this.roundnessBlackPieces, param, DataSet.WGo.C);
        //保存记录 圆形
        DataSet.setCRSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.C });
    }
    //叉形
    else if(constantPieces.F == _this.currentPieces){
        _pieces = CreateSign(_wb == 1 ? _this.forkPieces : _this.forkBlackPieces, param, DataSet.WGo.M);
        //保存记录 标记X
        DataSet.setMASign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.M });
    }

    _this.board.setSign(_pieces);                                   //添加到标记集中
}

/**
 * 删除标记
 * @param _this
 * @param _param
 */
function clearSign(_this, _param){
    //删除记录中标记数据
    DataSet.clearSign(_param.position, _param.circle.getSign().mark);

    _this.board.clearSign(_param.position, _param.circle);         //删除棋盘上标记节点
}

/*———————————————————————————— 前进后退功能 ————————————————————————————*/
/**
 * 第一步
 * @param _this
 * @param _callbackName
 * @returns {boolean}
 */
function backInfo(_this, _callbackName){
    if('string' !== typeof _callbackName) return false;       //如果执行函数为空，不执行后续操作

    let _data = DataSet[_callbackName]();         //获取第一步后 所有数据
    if(null == _data) return false;         //如果数据不存在，则不行

    //清除所有棋子或标识
    _data.allClear(function(_chess){
        //chess do something...
        //清除棋子
        if('object' === typeof _chess && 'string' === typeof _chess.pos){
            _this.board.clearPieces(_chess.pos);
        }
    }, function(_sign){
        //sing do something...
        //清除标记
        if('object' === typeof _sign && 'string' === typeof _sign.pos){
            _this.board.clearSign(_sign.pos);
        }
    }, function(_number, _pos){
        //number do something...
        let _param = _this.board.getCircle(_pos);      //获取节点区域对象集
        //如果存在 手数 则清除
        if('string' === typeof _pos &&　_param.circle.hasNumber()){
            _this.piecesText.setIndex(parseInt(_number)-1); //设置手数值
            _this.board.clearNumber(_pos);                  //清除手数
        }
    });
}

/**
 * 追加棋子
 * @param _this
 * @param _chess
 */
function appendPieces(_this, _chess){
    if('undefined' === typeof _chess.pos) return;
    let _obj,
        _pieces,
        _param = _this.board.getCircle(_chess.pos);

    if(_param.circle.hasChess()) return;         //如果存在棋子， 则结束操作

    if(_chess.c == DataSet.WGo.B) _obj = _this.BlackPieces;                 //黑
    else if(_chess.c == DataSet.WGo.W) _obj = _this.WhitePieces;            //白

    _pieces = CreateChess(_obj, _param, _chess.c);          //创建棋子
    _this.board.setPieces(_pieces);                         //添加到棋子集中
    DataSet.setPosition(_param.circle.getPos());           //存储坐标 标识

    //createNumber(_this, _param.circle, _param.x, _param.y, _chess.c);      //添加手数
}

/**
 * 追加标记
 * @param _this
 * @param _sign
 */
function appendSign(_this, _sign){
    let _obj,
        _pieces,
        _param = _this.board.getCircle(_sign.pos),
        _wb = getSignWB(_param.circle);

    if(_sign.c == DataSet.WGo.T) _obj = 1 == _wb ? _this.trianglePieces : _this.triangleBlackPieces;            //三角形
    else if(_sign.c == DataSet.WGo.S) _obj = 1 == _wb ? _this.squarePieces : _this.squareBlackPieces;           //方形
    else if(_sign.c == DataSet.WGo.C) _obj = 1 == _wb ? _this.roundnessPieces : _this.roundnessBlackPieces;     //圆形
    else if(_sign.c == DataSet.WGo.M) _obj = 1 == _wb ? _this.forkPieces : _this.forkBlackPieces;               //标记X

    _pieces = CreateSign(_obj, _param, _sign.c);        //创建标记
    _this.board.setSign(_pieces);                       //设置标记标识
}

/**
 * 添加手数
 * @param _this
 * @param _number
 * @param _pos
 */
function appendNumber(_this, _number, _pos){
    let _param = _this.board.getCircle(_pos);
    if(!_param.circle.hasNumber()){
        _this.piecesText.setIndex(_number);                                                             //设置手数值
        createNumber(_this, _param.circle, _param.x, _param.y, getSignWB(_param.circle), _number);      //添加手数
    }
}

/**
 * 最后一步
 * @param _this
 * @param _callbackName
 * @returns {boolean}
 */
function advanceInfo(_this, _callbackName){
    if('string' !== typeof _callbackName) return false;       //如果执行函数为空，不执行后续操作

    let _data = DataSet[_callbackName]();              //获取最后一步所有数据
    if(null == _data) return false;                 //如果数据不存在，则不行

    _data.append(function(_chess){
        //_this.board.clearAllSign();             //清除所有标记
        appendPieces(_this, _chess, 'chess');   //添加对弈棋子
    }, function(_chess){
        appendPieces(_this, _chess);            //添加单子
    }, function(_sign){
        appendSign(_this, _sign);               //添加标记
    }, function(_number, _pos){
        appendNumber(_this, _number, _pos);     //添加手数
    });
}

/*———————————————————————————— 生成棋谱 操作 ————————————————————————————*/
/**
 * 追加 标记信息
 * @param param
 * @param _mark
 */
function appendLoadInfo(param, _mark){
    if('object' !== typeof param) return false;
    DataSet.createHandle();                 //创建新记录对象
    DataSet.setChess({ pos : param.position, x : param.info.x , y : param.info.y, c : _mark });
}

/**
 * 追加 单独棋子
 * @param param
 * @param _mark
 */
function appendLoadAlone(param, _mark){
    if('object' !== typeof param) return false;
    DataSet.getAssistNode();      //添加辅助节点
    if(_mark == 1){
        //保存记录 添加黑子
        DataSet.setABChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.B });
    }else if(_mark == -1){
        //保存记录 添加白子
        DataSet.setAWChess({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.W });
    }
}

/**
 * 追加 属性
 * @param param
 * @param _type
 */
function appendLoadProp(param, _type){
    if('object' !== typeof param) return false;
    let _circle = param.circle;

    //如果存在棋子 相关操作
    if(_circle.hasSign()){
        //删除记录中标记数据
        DataSet.clearSign(param.position, param.circle.getSign().mark);
    }

    if('TR' == _type){
        //保存记录 三角形
        DataSet.setTRSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.T });
    }else if('SQ' == _type){
        //保存记录 方形
        DataSet.setSQSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.S });
    }else if('MA' == _type){
        //保存记录 标记X
        DataSet.setMASign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.M });
    }else if("CR" == _type){
        //保存记录 圆形
        DataSet.setCRSign({ pos : param.position, x : param.info.x , y : param.info.y, c : DataSet.WGo.C });
    }
}

/**
 * 解析数据
 * @param _this
 * @param data
 */
function getInitialChild(_this, data){
    //单子
    if('undefined' !== typeof data.setup){
        data.setup.forEach(function(value){
            appendLoadAlone(_this.board.getPosition({x : value.x, y : value.y}), value.c);
        });
    }
    //标记
    if('undefined' !== typeof data.markup){
        data.markup.forEach(function(value){
            appendLoadProp(_this.board.getPosition({x : value.x, y : value.y}), value.type);
        });
    }
    //生成棋子
    if('undefined' !== typeof data.move){
        appendLoadInfo(_this.board.getPosition(data.move), data.move.c);
    }

    if($.isArray(data.children)){
        data.children.forEach(function(item){
            //生成棋子
            if('undefined' !== typeof item.move){
                appendLoadInfo(_this.board.getPosition(item.move), item.move.c);
            }
            //单子
            if('undefined' !== typeof item.setup){
                item.setup.forEach(function(value){
                    appendLoadAlone(_this.board.getPosition({x : value.x, y : value.y}), value.c);
                });
            }
            //标记
            if('undefined' !== typeof item.markup){
                item.markup.forEach(function(value){
                    appendLoadProp(_this.board.getPosition({x : value.x, y : value.y}), value.type);
                });
            }
            //判断是否存在子项
            if('undefined' !== typeof item.children){
                item.children.forEach(function(value){
                    getInitialChild(_this, value);
                });
            }
        });
    }
    //end
}

/*———————————————————————————— 游戏类 ————————————————————————————*/
/**
 * 游戏控制柄
 */
class Games{
    //构造函数
    constructor(svg, board, _size){
        this.currentPieces = rememberPieces;        //当前棋子
        this.status = constantOperate.chess;        //状态,默认对弈

        this.board = board;                         //棋盘对象
        this.svg = svg;                             //棋盘svg对象
        this.cloneGroup = this.board._cloneGroupBox;

        this.WhitePieces = new White(svg, this.cloneGroup, _size);   //白棋
        this.BlackPieces =  new Black(svg, this.cloneGroup, _size);             //黑棋
        this.trianglePieces = new Triangle(svg, this.cloneGroup, _size);        //三角形
        this.triangleBlackPieces = new TriangleBlack(svg, this.cloneGroup, _size);
        this.squarePieces = new Square(svg, this.cloneGroup, _size);            //正方形
        this.squareBlackPieces = new SquareBlack(svg, this.cloneGroup, _size);
        this.roundnessPieces = new Roundness(svg, this.cloneGroup, _size);      //圆形
        this.roundnessBlackPieces = new RoundnessBlack(svg, this.cloneGroup, _size);
        this.forkPieces = new Fork(svg, this.cloneGroup, _size);                //叉形
        this.forkBlackPieces = new ForkBlack(svg, this.cloneGroup, _size);
        this.piecesText = new PiecesText(svg, this.cloneGroup, _size);          //棋子手数

        DataSet.clearChessList();           //清除数据
    }

    //初始化数据
    initial(_info, callback){
        let _this = this,
            loadList;
        if('undefined' !== typeof _info.root && 'undefined' !== typeof _info.root.children){
            //console.log('root', _info.root);
            //console.log('info', _info);

            getInitialChild(_this, _info.root);             //解析数据，转换成当前程序可识别数据格式
            DataSet.setBoardSize(_info.size);               //设置棋盘大小
            DataSet.setNodeCount(_info.nodeCount);          //设置棋子数
            DataSet.setPropertyCount(_info.propertyCount);  //设置辅助节点数
            loadList = DataSet.getList();       //获取初始化数组

            //判断是否存在数组
            if($.isArray(loadList)){
                DataSet.setStartIndex(loadList.length-1);   //设置记录开始位置
            }
        }
        rememberPieces = constantPieces.B;
        this.currentPieces = rememberPieces;

        backInfo(this, 'getZero');      //从第零位 渲染
        //1秒后切换到最后步
        setTimeout(function(){
            _this.switchLast();

            //禁止该棋子操作
            $.each(DataSet.getList(), function(i, item){
                item['isMove'] = false;
            });

            if('function' === typeof callback) callback();
        }, 600);
    }

    /**
     * 获取sgf文件代码
     * @returns {string}
     */
    getSgf(){
        return DataSet.toSGF();
    }

    //- - - - - - - - - - - - - 切换状态 - - - - - - - - - - - - -
    //切换到正常 对弈
    backChess(){
        this.status = constantOperate.chess;        //对弈
        this.currentPieces = rememberPieces;
    }

    //只下白棋
    playWhite(){
        this.status = constantOperate.alone;        //单子
        this.currentPieces = constantPieces.W;
    }

    //只下黑棋
    playBlack(){
        this.status = constantOperate.alone;        //单子
        this.currentPieces = constantPieces.B;
    }

    //切换到提子
    takePieces(){
        this.status = constantOperate.take;         //提子
        resetRememberPieces(this);
    }

    //切换到三角形
    playTriangle(){
        this.status = constantOperate.sign;         //标记
        resetRememberPieces(this);                  //重置下个棋子
        this.currentPieces = constantPieces.T;      //三角形
    }

    //切换到正方形
    playSquare(){
        this.status = constantOperate.sign;
        resetRememberPieces(this);
        this.currentPieces = constantPieces.S;
    }

    //切换到圆形
    playRoundness(){
        this.status = constantOperate.sign;
        resetRememberPieces(this);
        this.currentPieces = constantPieces.R;
    }

    //切换到叉形
    playFork(){
        this.status = constantOperate.sign;
        resetRememberPieces(this);
        this.currentPieces = constantPieces.F;
    }

    //切换到擦除操作
    wipePieces(){
        this.status = constantOperate.wipe;
        resetRememberPieces(this);
    }

    //切换手动添加
    handleMove(type){
        this.status = constantOperate.alone;
        if('B' == type){
            this.currentPieces = constantPieces.B;
        }else if('W' == type){
            this.currentPieces = constantPieces.W;
        }
    }

    //- - - - - - - - - - - - - 前进后退操作 - - - - - - - - - - - - -
    //切换到第一步
    switchFirst(){
        backInfo(this, 'getFirst');
    }
    //切换到返回一步
    switchBack(){
        backInfo(this, 'getBack');
    }
    //切换到最后一步
    switchLast(){
        advanceInfo(this, 'getLast');
    }
    //前进一步
    switchNext(){
        advanceInfo(this, 'getNext');
    }

    /*
     * 添加或删除棋子(专为【学生课后端】修炼塔用)
     * yk
     * 2018-5-9
     */
    changeChess(_this,_param){
        //获取棋子状态（chess: 对弈;alone: 单子,take: 提子(即擦除))
        var _status = _this.status;
        //获取当前棋子颜色 (white: 白色;black: 黑色)
        var _chessColor = _this.currentPieces;
        //获取点击位置
        var _pos = _param.position;
        // 如果棋子是擦除操作，则执行删除，否则为添加操作
        if (_status == 'take'){
            // 如果map中有了位置，说明已经有了棋子，才会进行擦除操作。没有位置的情况下，不做擦除操作。
            if(setChess.has(_pos)){
                setChess.delete(_pos);
            }
        }else{
            // 如果map中已经有了位置，说明已经有了棋子，则不做添加操作。没有位置的情况下，才添加该位置的棋子到map中。
            if (!setChess.has(_pos)) {
                setChess.set(_pos, _chessColor); //设置棋子位置对应的颜色
            }
        }
    }

    /*
     * 获取学生下的所有棋子map(专为【学生课后端】修炼塔用)
     * yk
     * 2018-5-9
     */
    getChess(){
        return setChess;
    }
    /*
     * 清除学生下的棋子map(专为【学生课后端】修炼塔用)
     * yk
     * 2018-5-9
     */
    cleanChess(){
        setChess.clear();
    }

    //- - - - - - - - - - - - - 下棋功能 - - - - - - - - - - - - -
    /**
     * 开始
     * @param param 参数{
     *                      circle : 点击区域对象,
     *                      info : { x : 横向位置索引, y : 竖向位置索引}，
     *                      position : 位置字母标识，
     *                      x : 节点位置,
     *                      y : 节点位置
     *                  }
     */
    start(param){
        DataSet.isRecord();     //判断是否前进后退， 后期添加分支 去除
        this.changeChess(this,param);
        //对弈
        if(this.status == constantOperate.chess){
            //this.board.clearAllSign();      //清除所有标记
            playChess(this, param);
        }
        //单子
        else if(this.status == constantOperate.alone){
            playSingle(this, param);
        }
        //删除棋子
        else if(this.status == constantOperate.take){
            clearPieces(this, param);
        }
        //标记
        else if(this.status == constantOperate.sign){
            playSign(this, param);
        }
        //删除标识
        else if(this.status == constantOperate.wipe){
            clearSign(this, param);
        }
    }
}

export {Games};