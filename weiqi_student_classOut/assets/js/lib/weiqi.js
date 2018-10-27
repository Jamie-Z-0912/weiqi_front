/*jshint esversion: 6*/
import {Board, Position} from './board';
import {WS, BlackAndWhite, Sign} from './operate';
import {parseFromSgf} from './nodeSgfParser';
import {Games} from './game';

(function(factory){
    module.exports = factory();
})(function(){
    var _Board,                 //棋盘对象
        _Game,                  //游戏
        _WS,                    //前进后退对象集
        _BW,                    //黑白棋对象集
        _SG,                     //标记对象集
        WQ_Object;

    //添加点击事件
    function addEvent(){
        $.each(Position.data, function(i, v){
            //点击事件
            v.circle.click(function(){
                _Game.start(v);
            });
        });
    }

    //匹配 棋子区域
    function getPos(_pos){
        for(var i = 0; i < Position.data.length; i++){
            if(_pos == Position.data[i].position){
                return Position.data[i];
            }
        }
        return null;
    }

    //前进后退 事件
    function wsEvent(){
        //第一步
        _WS.first.click(function(){
            _Game.switchFirst();
        });
        //后退一步
        _WS.retreat.click(function(){
            _Game.switchBack();
        });
        //前进一步
        _WS.advance.click(function(){
            _Game.switchNext();
        });
        //最后一步
        _WS.last.click(function(){
            _Game.switchLast();
        });
    }

    //黑白棋 事件
    function bwEvent(){
        _BW.checked(_BW.wb);        //默认黑白对弈

        //黑白 对弈
        _BW.wb.click(function(){
            var _checked = _BW.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _SG) _SG.unCheckedAll();         //卸载所有标记状态
                _Game.backChess();          //切换对弈状态
            }
        });

        //黑棋
        _BW.b.click(function(){
            var _checked = _BW.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _SG) _SG.unCheckedAll();         //卸载所有标记状态
                _Game.playBlack();
            }
        });

        //白棋
        _BW.w.click(function(){
            var _checked = _BW.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _SG) _SG.unCheckedAll();         //卸载所有标记状态
                _Game.playWhite();
            }
        });

        //提子
        _BW.del.click(function(){
            var _checked = _BW.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _SG) _SG.unCheckedAll();         //卸载所有标记状态
                _Game.takePieces();
            }
        });
    }

    //标记 事件
    function sgEvent(){
        //三角形 点击事件
        _SG.triangle.click(function(){
            var _checked = _SG.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _BW) _BW.unCheckedAll();         //卸载所有棋子状态
                _Game.playTriangle();
            }
        });

        //正方形 点击事件
        _SG.square.click(function(){
            var _checked = _SG.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _BW) _BW.unCheckedAll();         //卸载所有棋子状态
                _Game.playSquare();
            }
        });

        //圆形 点击事件
        _SG.roundness.click(function(){
            var _checked = _SG.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _BW) _BW.unCheckedAll();         //卸载所有棋子状态
                _Game.playRoundness();
            }
        });

        //叉形 点击事件
        _SG.fork.click(function(){
            var _checked = _SG.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _BW) _BW.unCheckedAll();         //卸载所有棋子状态
                _Game.playFork();
            }
        });

        //擦除操作 点击事件
        _SG.wipe.click(function(){
            var _checked = _SG.toggleChecked(this);
            if(_checked){
                if('undefined' !== typeof _BW) _BW.unCheckedAll();         //卸载所有棋子状态
                _Game.wipePieces();
            }
        });
    }

    WQ_Object = {
            /**
             * 禁止 棋子            //false 追加事件， true 不添加事件
             * @type {boolean}
             */
            disabled : false,
            isRender : 1,
            originPiece : null,    //专为【学生课后端】修炼塔用,初始棋子。
            finalPiece: '',   //专为【学生课后端】修炼塔用,最终棋子。
            /**
             * 返回sgf文件
             * @returns {*|string}
             */
            getSgf(){
              return _Game.getSgf();
            },
            /**
             * yk
             * 2018-5-9
             * 设置初始棋盘状态
             * 专为【学生课后端】修炼塔用
             */
            setOriginPiece(content){
                this.originPiece = content;
            },
            /**
             * yk
             * 2018-5-9
             * 获取最终棋盘状态
             * 专为【学生课后端】修炼塔用
             */
            getStudentPiece(){
                var _studentChess =  _Game.getChess();
                let _str = '';          //存储学生下的棋子字符串
                if (_studentChess.size){
                    for (let item of _studentChess.entries()){
                        if (item[1] == 'white'){
                            _str +=  ';W[' + item[0].toLocaleLowerCase() + ']'
                        }
                        if (item[1] == 'black'){
                            _str +=  ';B[' + item[0].toLocaleLowerCase() + ']'
                        }
                    }
                    let delRBracket = this.originPiece.substring(0,this.originPiece.length - 1);    //删除原字符串最后一个右括号
                    let addStr = delRBracket + _str;    //添加新棋子字符串到原字符串。
                    //let delLastSemicolon = addStr.substring(0,addStr.length - 1);   //删除棋子字符串中的最后一个分号
                    this.finalPiece = addStr + ')';    //添加最后一个右括号
                }
                _Game.cleanChess(); //清空棋子，方便下次重新填写。

                return this.finalPiece;
            },
            /**
             * yk
             * 2018-5-9
             * 使用提示卡，直接赋值最终棋盘状态
             * 专为【学生课后端】修炼塔用
             */
            setFinalPiece(content){
                this.finalPiece = '';
                this.finalPiece = content;  //直接赋值正确答案。
                _Game.cleanChess();     //清空棋子，方便下次重新填写。
            },
            /**
             * 移动棋子
             * @param arr
             */
            moveChess(arr){
                if($.isArray(arr)){
                    var _time = 0;
                    arr.forEach(function(v){
                        $.each(v, function(key, value){
                            setTimeout(function(){
                                var _key = key, _val = value, _param = getPos(_val);
                                _Game.handleMove(_key);
                                _Game.start(_param);
                            }, 1000 * _time);

                            _time++;
                        })
                    });
                    //forEach end
                }
            },
            /**
             * 绘制棋盘
             * @param id 围棋id名称
             * @param data
             */
            drawBoard(id, data){
                let _this = this,
                    _info = parseFromSgf(data),             //sgf数据转换为对象
                    _size = 19;
                _this.isRender++;

                if('object' === typeof _info && 'number' === typeof _info['size']){
                    if(9 == _info['size']){
                        _size = 9;
                    }
                }

                _Board = new Board(id, _size);                      //创建棋盘
                _Board.initial();                                   //初始化
                _Game = new Games(_Board.svg, _Board, _size);      //创建游戏
                _Game.initial(_info, function(){                    //数据初始化完成后，执行此函数
                    if(!_this.disabled) addEvent();                 //添加点击事件 及相关功能操作
                });
            },
            /**
             * 绘制前进后退
             * @param id
             */
            drawWS(id){
                _WS = new WS(id);             //创建svg
                _WS.initial();
                wsEvent();
            },
            /**
             * 绘制黑白棋
             */
            drawBlackWhite(id){
                _BW = new BlackAndWhite(id);        //创建svg
                _BW.initial();          //初始化数据
                bwEvent();              //添加事件
            },
            /**
             * 绘制标记符
             * @param id
             */
            drawSign(id){
                _SG = new Sign(id);             //创建svg
                _SG.initial();          //标记数据初始化
                sgEvent();              //添加事件
            }
        };

    return WQ_Object;
});