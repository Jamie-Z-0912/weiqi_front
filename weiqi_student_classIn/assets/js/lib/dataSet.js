/**
 * 属性名
 * @type {{B: string, W: string, AB: string, AE: string, AW: string, C: string, AR: string, CR: string, MA: string, SQ: string, TR: string, AP: string, SZ: string}}
 */
const PropsName = {
    B : "B",        //黑子 走子棋 Black
    W : "W",        //白子 走子棋 White
    AB : "AB",       //添加黑子 Add Black
    AE : "AE",       //删除棋子 Add Empty
    AW : "AW",       //添加白子 Add White
    C : "C",        //注释 Comment
    AR : "AR",       //箭头 Arrow
    CR : "CR",       //圆形 Circle
    MA : "MA",       //X形记号 Mark
    SQ : "SQ",       //方块 Square
    TR : "TR",       //三角 Triangle
    AP : "AP",       //应用软件  Application
    CA : "CA",      //棋谱文件格式
    HA : "HA",      //让子数
    SZ : "SZ"     //棋盘大小 Size，默认19×19
};

/**
 * 棋子 标识值
 * @type {{B: number, W: number, T: number, S: number, C: number, M: number}}
 */
let WGo = {
    B : 1,          //黑子
    W : -1,          //白子
    T : 2,          //三角形
    S : 3,          //方形
    C : 4,          //圆形
    M : 5           //标记X
};

/**
 * 棋盘 节点
 */
class KF_Node{
    constructor(){
        this.N = '';                //标题
        this.comment = '';          //说明
        this.index = -1;             //索引
        this.number = 0;            //手数
        this.move = {};
        this.props = {};            //属性集
        this.children = [];         //集子
        this.pos = null;
        this.parent = null;         //父对象
        this.status = '';           //状态 1表示棋子，2表示辅助节点
        this.isMove = true;         //该节点是否可进行历史记录操作，默认为true
    }
}

/**
 * 清除棋子
 * @param _arr
 * @param _callback
 * @param key
 * @returns {boolean}
 */
function clearProps(_arr, _callback, key){
    if('undefined' === typeof _arr) return false;
    _arr.forEach(function(item){
        if('object' === typeof item && 'undefined' !== typeof item.x && 'undefined' !== typeof item.x){
            _callback(item, key);
        }
    });
}

/**
 * 循环处理 所有步骤棋子或标记
 * @param that              当前对象
 * @param kfNode            记录集对象
 * @param _callbackChess    清除棋子 回调函数
 * @param _callbackSign     清除标记 回调函数
 * @param _callbackNumber   清除手数 回调函数
 */
function allClearChess(that, kfNode, _callbackChess, _callbackSign, _callbackNumber){
    that.data.forEach(function(item, key){
        //当前为棋子
        if('undefined' !== typeof item.status && item.status == kfNode.nodeStatus.chess){
            _callbackChess(item.move, key);
        }
        clearProps(item.props.AB, _callbackChess, key);      //添加的黑子
        clearProps(item.props.AW, _callbackChess, key);      //添加的白子

        clearProps(item.props.AR, _callbackSign, key);       //箭头
        clearProps(item.props.CR, _callbackSign, key);       //圆形
        clearProps(item.props.MA, _callbackSign, key);       //标记X
        clearProps(item.props.SQ, _callbackSign, key);       //方块
        clearProps(item.props.TR, _callbackSign, key);       //三角形

        //手数清除
        if(item.number > 0){
            _callbackNumber(item.number, item.pos, key);
        }
    });
}

/**
 * 添加属性
 * @param _arr
 * @param _callback
 * @param key
 * @returns {boolean}
 */
function appendProps(_arr, _callback, key){
    if('undefined' === typeof _arr) return false;
    _arr.forEach(function(item){
        if('object' === typeof item && 'undefined' !== typeof item.x && 'undefined' !== typeof item.x){
            _callback(item, key);
        }
    });
}

/**
 * 循环添加 步骤棋子 或标记
 * @param that
 * @param kfNode
 * @param _callbackChess
 * @param _callbackAlone
 * @param _callbackSign
 * @param _callbackNumber
 */
function appendChess(that, kfNode, _callbackChess, _callbackAlone, _callbackSign, _callbackNumber){
    that.data.forEach(function(item, key){
        //当前为棋子
        if('undefined' !== typeof item.status && item.status == kfNode.nodeStatus.chess){
            _callbackChess(item.move, key);
        }
        appendProps(item.props.AB, _callbackAlone, key);      //添加的黑子
        appendProps(item.props.AW, _callbackAlone, key);      //添加的白子

        appendProps(item.props.AR, _callbackSign, key);       //箭头
        appendProps(item.props.CR, _callbackSign, key);       //圆形
        appendProps(item.props.MA, _callbackSign, key);       //标记X
        appendProps(item.props.SQ, _callbackSign, key);       //方块
        appendProps(item.props.TR, _callbackSign, key);       //三角形

        if(item.number > 0){
            _callbackNumber(item.number, item.pos);
        }
    });
}

/**
 * 判断属性 子项是否存在
 * @param arr
 * @param chess
 */
function hasProps(arr, chess){
    if($.isArray(arr)){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].c == chess.c && arr[i].pos == chess.pos){
                return true;
            }
        }
    }
    return false;
}

/**
 * 生成棋子SGF代码
 * @param _move
 * @returns {string}
 */
function getChess2Sgf(_move){
    let _content = '';
    if('undefined' !== typeof _move['c'] && 'string' === typeof _move['pos'] && 2 == _move['pos'].length){
        //黑
        if(1 == _move['c']){
            _content = _content + ';' + PropsName.B + '[' + _move['pos'].toLowerCase() + ']';
        }
        //白
        else if(-1 == _move['c']){
            _content = _content + ';' + PropsName.W + '[' + _move['pos'].toLowerCase() + ']';
        }
    }
    return _content;
}

/**
 * 生成辅助节点sgf字符串
 * @param _arr
 * @returns {string}
 */
function getPropertyListSgf(_arr){
    var _content = '';
    $.each(_arr, function(i, item){
        if('object' === typeof item && 'string' === typeof item['pos'] && 2 == item['pos'].length){
            _content += '[' + item['pos'].toLowerCase() + ']'
        }
    });
    return _content;
}

/**
 * 生成辅助节点SGF代码
 * @param _props
 */
function getProperty2Sgf(_props){
    var _content = '';
    $.each(_props, function(key, value){
        //辅助节点 黑子
        if(PropsName.AB == key){
            _content += PropsName.AB + getPropertyListSgf(value);
        }
        //辅助节点 白子
        if(PropsName.AW == key){
            _content += PropsName.AW + getPropertyListSgf(value);
        }
        //辅助节点 圆形
        if(PropsName.CR == key){
            _content += PropsName.CR + getPropertyListSgf(value);
        }
        //辅助节点 X形
        if(PropsName.MA == key){
            _content += PropsName.MA + getPropertyListSgf(value);
        }
        //辅助节点 方块
        if(PropsName.SQ == key){
            _content += PropsName.SQ + getPropertyListSgf(value);
        }
        //辅助节点 三解形
        if(PropsName.TR == key){
            _content += PropsName.TR + getPropertyListSgf(value);
        }
    });
    return _content.length > 0 ? ';' + _content : _content;
}

/**
 * 将记录中值转换为SGF
 * @param _this
 * @returns {string}
 * @constructor
 */
function ArrayList2SGF(_this){
    let _content = '(;GM[1]AP[StoneBase:SGFParser.3.0.1]',
        _list = _this.chessList;

    //添加棋盘大小
    _content = _content + PropsName.SZ + '[' + _this.boardSize + ']';
    //编码格式
    _content = _content + PropsName.CA + '[' + _this.charset + ']';
    //让子数
    _content = _content + PropsName.HA + '[' + _this.backChessSize + ']';
    //循环数据
    $.each(_list, function(i, item){
        if('object' === typeof item){
            //转换棋子
            if('object' === typeof item['move']){
                _content += getChess2Sgf(item['move']);
            }
            //转换辅助节点
            if('object' === typeof item['props']){
                _content += getProperty2Sgf(item['props']);
            }
        }
        //item end
    });

    return _content + ')';
}

//记录 操作类
class KiFu{
    /**
     * 构造函数
     */
    constructor() {
        this.chessList = [];
        this.propertys = {
            B: "B",                    //黑子 走子棋 Black
            W: "W",                    //白子 走子棋 White
            KO: "KO",                  //强制走子 KO
            MN: "MN",                  //设置手数 Set Move Number
            AB: "AB",                  //添加黑子 Add Black
            AE: "AE",                  //删除棋子 Add Empty
            AW: "AW",                  //添加白子 Add White
            PL: "PL",                   //轮谁走 PLayer to play
            C: "C",                     //注释 Comment
            AR: "AR",      //箭头 Arrow
            CR: "CR",      //圆形 Circle
            DD: "DD",      //模糊变虚 Dim position
            LB: "LB",      //棋盘标签 Lable
            LN: "LN",      //直线 Line
            MA: "MA",      //X形记号 Mark
            SL: "SL",      //选择 Selected
            SQ: "SQ",      //方块 Square
            TR: "TR",       //三角 Triangle
            AP: "AP",      //应用软件  Application
            CA: "CA",      //字符集   Charset
            FF: "FF",      //文件格式 File Format
            GM: "GM",      //对局类别 Game
            ST: "ST",      //分支显示风格 Style
            SZ: "SZ"       //棋盘大小 Size
        };
        this.index = 0;         //数据数组长度 索引
        this.start = 0;         //默认第一个为0项
        this.WGo = WGo;
        this.nodeStatus = {
            chess : 1,          //表示棋子
            assist : 2          //表示辅助节点
        };
        this.nodeCount = 0;         //棋子数
        this.propertyCount = 0;     //辅助节点数
        this.boardSize = 0;          //棋盘大小
        this.charset = 'gb2312';     //文件编码格式
        this.backChessSize = 0;     //让子数

        this.chessList[this.index] = new KF_Node();     //创建一个默认根节点，存放头部信息
        this.chessList[this.index].props[PropsName.AP] = 'LIME WQ 1.0.0';
        this.chessList[this.index].status = this.nodeStatus.assist;     //默认第一个为辅助节点
    }

    /**
     * 转换成SGF棋谱代码
     * @returns {string}
     */
    toSGF(){
        return ArrayList2SGF(this);     //返回SGF格式文件
    }

    /**
     * 判断最后位是否为辅助节点
     */
    lastHasAssist(){
        if(this.chessList.length > 0){
            let _status = this.chessList[this.chessList.length - 1]['status'];

            if(!isNaN(parseInt(_status))){
                return this.nodeStatus.assist == _status;
            }else{
                return false;
            }
        }
        return false;
    }

    /**
     * 设置棋盘大小
     * @param value
     */
    setBoardSize(value){
        if('number' === typeof value) this.boardSize = value;
    }

    /**
     * 设置辅助节点数
     * @param value
     */
    setPropertyCount(value){
        if('number' === typeof value) this.propertyCount = value;
    }

    /**
     * 设置棋子数
     * @param value
     */
    setNodeCount(value){
        if('number' === typeof value) this.nodeCount = value;
    }

    /**
     * 设置开始位置
     * @param value
     */
    setStartIndex(value){
        if('number' === typeof value) this.start = value;
    }

    /**
     * 获取开始位
     * @returns {number|*}
     */
    getStartIndex(){
        return this.start;
    }

    /**
     * 清除记录
     */
    clearChessList(){
        this.chessList = [];
    }

    /**
     * 获取记录列表
     * @returns {Array}
     */
    getList(){
        return this.chessList;
    }

    /**
     * 获取最后一位元素
     * @returns {*}
     */
    getLastItem(){
        return this.chessList[this.chessList.length-1];
    }

    /**
     * 获取最后一位棋子
     */
    getLastChess(){
        var _this = this, _list = _this.getList(), _chess;

        for(var i = this.getIndex();  i >= 0; i--){
            if('undefined' !== typeof _list[i]['move'] && 'number' === typeof _list[i]['move']['c']){
                _chess = _list[i];
                break;
            }
        }
        return _chess;
    }

    /**
     * 判断最后一个棋子
     * @param blackCallback
     * @param whiteCallback
     * @param noneCallback
     */
    judgeChess(blackCallback, whiteCallback, noneCallback){
        let _lastChess = this.getLastChess();

        if('undefined' !== typeof _lastChess){
            if(WGo.B == _lastChess['move']['c']){
                blackCallback(this.getIndex());
            }else if(WGo.W == _lastChess['move']['c']){
                whiteCallback(this.getIndex());
            }else{
                noneCallback();
            }
        }else{
            noneCallback();
        }
    }

    /**
     * 判断 是否前进后退
     */
    isRecord(){
        if(this.index != this.chessList.length){
            this.chessList.length = this.index+1;
        }
    }

    /**
     * 获取数据长度
     * @returns {{index: (number|*), size: Number}}
     */
    getListInfo(){
        return {
            index : this.index,
            size : this.chessList.length
        };
    };

    /**
     * 设置索引
     * @param _index
     */
    setIndex(_index){
        this.index = _index;
    }

    /**
     * 返回记录索引
     * @returns {number|*}
     */
    getIndex(){
        return this.index;
    }

    /**
     * 设置坐标标识
     * @param _pos
     */
    setPosition(_pos){
        if('string' === typeof _pos){
            this.chessList[this.index].pos = _pos;
        }
    }

    /**
     * 设置手数
     * @param _num
     */
    setNumber(_num){
        if('number' === typeof _num){
            this.chessList[this.index].number = _num;
        }
    }

    /**
     * 创建新记录
     */
    createHandle(){
        let _node = new KF_Node();                  //创建节点
        _node.status = this.nodeStatus.chess;       //标记节点 状态属性
        this.index = this.chessList.length;         //标记当前索引
        this.chessList[this.index] = _node;         //节点对象赋值
    }

    /**
     * 添加 棋子
     * @param _chess        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setChess(_chess){
        if('object' === typeof _chess) {
            this.chessList[this.index].move = _chess;
        }
    }

    /**
     * 设置属性
     * @param _chess
     * @param _name
     */
    setProp(_chess, _name){
        let _node = this.chessList[this.index];         //获取节点
        let _prop = _node.props[_name];                 //获取数据
        //判断属性是否存在，不存在创建 再赋值给该属性
        if('undefined' === typeof _prop){
            _prop = [_chess];
            _node.props[_name] = _prop;
        }
        //存在， 先判断是否存储该棋子，不存在添加，添加不处理
        else{
            if(!hasProps(_prop, _chess)){
                _prop[_prop.length] = _chess;
            }
        }
    }

    /**
     * 删除棋子
     * @param _pos
     * @param _name
     */
    removeProp(_pos, _name){
        let _node = this.chessList[this.index];         //获取节点
        let _prop = _node.props[_name];                 //获取数据
        if('undefined' === typeof _prop) return;        //如果不存在，则直接退出

        let _arr = [];
        _prop.forEach(function(item){
            if(item.pos != _pos) _arr[_arr.length] = item;
        });

        //如果数据为空，则删除该 属性
        if(_arr.length == 0){
            delete _node.props[_name];
        }
        //重置新数据
        else{
            _node.props[_name] = _arr;
        }
    }

    /**
     * 获取辅助节点
     * @returns {*}
     */
    getAssistNode(){
        let _node;
        for(var i = this.index; i < this.chessList.length; i++){
            _node = this.chessList[i];
            if('undefined' !== typeof _node && !isNaN(parseInt(_node['status'])) && _node.status == this.nodeStatus.assist){
                this.index = i;
                return _node;
            }
        }
        _node = this.createAssistNode();        //创建辅助节点
        return _node;
    }

    /**
     * 创建辅助节点
     */
    createAssistNode(){
        let _node;
        //如果不存在辅助节点，则创建一个
        this.createHandle();
        _node = this.chessList[this.index];         //获取节点
        _node.status = this.nodeStatus.assist;      //添加辅助节点
        return _node;
    }

    /**
     * 获取清除棋子或标识数据
     * @param _index    开始
     * @param _end      结束
     * @returns {Array}
     */
    getClearNode(_index, _end){
        let _nodes = [],                                                                                //创建节点
            _isRange = 'number' === typeof _end && (_end >= 0 && _end <= this.chessList.length);       //判断是否区间 取值

        //循环提取
        for(var i = _isRange ? _index : 0,                          //索引
                _list = this.chessList,                             //循环数组
                _size =  _isRange ? _end : _list.length; i < _size;  //取值结束位置
                i++                                                  //自增
        ){
            //如果索引大小开始位置，则追加
            if((i > _index || _index == 0) && _list[i]['isMove']){
                _nodes[_nodes.length] = _list[i];
            }
            //if(i > _index) _nodes[_nodes.length] = _list[i];
        }
        return _nodes;
    }

    /**
     * 获取节点数据，并创建对应节点操作功能函数
     * @param _index 起点
     * @param _end   始点
     * @returns {*}
     */
    getNodeObject(_index, _end){
        if(_index < -1) return null;     //如果索引超出数据范围，则结束
        let that = this;
        return {
            data : that.getClearNode(_index, _end),
            index : _index,                 //当前索引
            /**
             * 清除data中所有棋子或标识
             * @param _callbackChess    棋子回调函数
             * @param _callbackSign     标记回调函数
             * @param _callbackNumber   手数回调函数
             */
            allClear (_callbackChess, _callbackSign, _callbackNumber){
                if(this.data.length == 0) return false;
                //调用清除棋子功能函数
                allClearChess(this, that, _callbackChess, _callbackSign, _callbackNumber);
            },
            /**
             * 追加棋子 或标识
             * @param _callbackChess    对弈棋子
             * @param _callbackAlone    单子
             * @param _callbackSign     标记
             * @param _callbackNumber   手数
             */
            append (_callbackChess, _callbackAlone, _callbackSign, _callbackNumber){
                //调用添加棋子功能函数
                appendChess(this, that, _callbackChess, _callbackAlone, _callbackSign, _callbackNumber);
            }
        };
    }
}

//历史操作记录 数据集合
class DataSet extends KiFu{
    /**
     * 构造函数
     */
    constructor(){
        super();
    }

    /**
     * 获取辅助节点，不存在则创建 并追加
     */
    getAssistNode(){
        super.getAssistNode();
    }

    /**
     * 设置位置
     * @param _pos
     */
    setPosition(_pos){
        if('string' === typeof _pos) super.setPosition(_pos);
    }

    /**
     * 设置手数
     * @param _num
     */
    setNumber(_num){
        if('number' === typeof _num) super.setNumber(_num);
    }

    /**
     * 添加 黑子
     * @param _chess        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setABChess(_chess){
        if('object' === typeof _chess) super.setProp(_chess, PropsName.AB);
    }

    /**
     * 添加 白子
     * @param _chess        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setAWChess(_chess){
        if('object' === typeof _chess) super.setProp(_chess, PropsName.AW);
    }

    /**
     * 删除棋子
     * @param _chess        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setAEChess(_chess){
        if('object' === typeof _chess) super.setProp(_chess, PropsName.AE);
    }

    /**
     * 箭头
     * @param _sign        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setARSign(_sign){
        if('object' === typeof _sign) super.setProp(_sign, PropsName.AR);
    }

    /**
     * 圆形
     * @param _sign        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setCRSign(_sign){
        if('object' === typeof _sign) super.setProp(_sign, PropsName.CR);
    }

    /**
     * 标记X
     * @param _sign        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setMASign(_sign){
        if('object' === typeof _sign) super.setProp(_sign, PropsName.MA);
    }

    /**
     * 方块
     * @param _sign        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setSQSign(_sign){
        if('object' === typeof _sign) super.setProp(_sign, PropsName.SQ);
    }

    /**
     * 三角形
     * @param _sign        棋子参数{ pos : 字符标识, x : 坐标 , y : 坐标, c : color }
     */
    setTRSign(_sign){
        if('object' === typeof _sign) super.setProp(_sign, PropsName.TR);
    }

    /**
     * 删除标识
     * @param _pos      字符标识
     * @param _mark     判断标识
     */
    clearSign(_pos, _mark){
        switch (_mark){
            case WGo.T : super.removeProp(_pos, PropsName.TR);      //三角形
                break;
            case WGo.S : super.removeProp(_pos, PropsName.SQ);      //方形
                break;
            case WGo.C : super.removeProp(_pos, PropsName.CR);      //圆形
                break;
            case WGo.M : super.removeProp(_pos, PropsName.MA);      //标记X
                break;
        }
    }

    /**
     * 设置开始位置
     * @param value
     */
    setStartIndex(value){
        super.setStartIndex(value);
    }

    /**
     * 零位 设置
     * @returns {{data, index, allClear, append}|*}
     */
    getZero(){
        super.setIndex(0);
        return super.getNodeObject(-1);
    }

    /**
     * 返回第一步
     */
    getFirst(){
        let _index = super.getListInfo().index, _start = super.getStartIndex();
        if(_index > _start){
            super.setIndex(_start);
            return super.getNodeObject(_start);
        }else{
            return null;
        }
    }

    /**
     * 后退一步
     * @returns {{data, allClear, append}|*}
     */
    getBack(){
        let _index = super.getListInfo().index, _start = super.getStartIndex();
        if(_index > _start){
            super.setIndex(_index-1 < 0 ? 0 : _index - 1);
            return super.getNodeObject(_index-1);
        }else{
            return null;
        }/*else{
            return super.getNodeObject(_index-1);
        }*/
    }

    /**
     * 返回最后一步
     * @returns {{data, allClear}|*}
     */
    getLast(){
        let _index = super.getListInfo();

        super.setIndex(_index.size - 1);
        return super.getNodeObject(_index.index, _index.size);
    }

    /**
     * 前进一步
     */
    getNext(){
        let _index = super.getListInfo(), _end;

        _index.index = _index.index + 1 <= _index.size ? _index.index + 1 : _index.index;
        _end = _index.index >= _index.size ? _index.size : _index.index + 1;

        super.setIndex(_index.index);
        return super.getNodeObject(_index.index-1, _end);
    }

    /**
     * 添加备注
     * @param _text
     */
    setComment(_text){

    }
}

export default new DataSet();