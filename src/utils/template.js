class TemplateFun {
    constructor({_normal_spaces = 5, _rowCount = 1, _maxColCount = 6, _deFaultColCount = 6, _rowRatios = ['1:1'], boxWidth = 1090} = {}) {
        //单元格行距
        this._normal_spaces = _normal_spaces;
        //每行的行比
        this._rowRatios = _rowRatios;
        //全局单元格宽度及高度
        this._singleWidth = 0;
        this._singleHeights = [];
        //化行间距
        this._rowSpaces = [];
        this._colSpaces = [];
        //行数
        this._rowCount = _rowCount;
        //最大列数
        this._maxColCount = _maxColCount;
        //默认一行最大能画几个单元格，超过这个数就要平滑框。如果设置成0,使用平滑框
        this._deFaultColCount = _deFaultColCount;
        this.boxWidth = boxWidth;
    }
    add_start() {
        return this._initialDrawEnv();
    }
    _drawTemplateByWidth(){
        var rowSize = this._rowSpaces.length;
        var colSize = this._colSpaces.length;
        let arr = [];
        for (var i = 0; i<rowSize; i++){
            let retions = this._rowRatios[i]
            var singleHeight = this._singleHeights[i];
            var singleWidth = this._singleWidth
            for(var j = 0; j<colSize; j++){
                var leftAbsolute = this._computeLeftAbsolute(this._colSpaces, this._singleWidth, j);
                var topAbsolute = this._computeTopAbsolute(this._rowSpaces, this._singleHeights, i);
                let style = `width:${singleWidth}px;height:${singleHeight}px;left:${leftAbsolute}px;top:${topAbsolute}px`;
                let obj = {
                    isChoose: false,
                    retions: retions,
                    top: i,
                    left: j,
                    style: style,
                    width: 1,
                    height: 1,
                    class: 'bg-blue'
                };
                arr.push(obj);
            }
        };
        return arr;
    }
    _initialDrawEnv() {
        // this._rowCount = rowCount;
        // this._maxColCount = colCount;
        // this._rowRatios = ratios;
        this._buildRowSpaces();
        this._buildColSpaces();
        
        this._computeSingleWidth();
        this._computerHeight();
        return this._drawTemplateByWidth();
    }
    //计算单元格间距，预留了修改单元格间距的口子
    _buildRowSpaces() {
        this._rowSpaces = [];
        for(var i =0;i< this._rowCount;i++){
            this._rowSpaces[i] = this._normal_spaces;
        }
    };
    _buildColSpaces() {
        this._colSpaces = [];
        for(var i =0;i< this._maxColCount;i++){
            this._colSpaces[i] = this._normal_spaces;
        }
    };
    _computeSingleWidth() {
        // var totalRowSpaces = _sumArray(_rowSpaces);
        let totalColSpaces = this._sumArray(this._colSpaces);
        
        //var templateEditDiv = $('#templateEditDiv',$.CurrentDialog);
        //减去竖滚动条的宽度
        var totalWidth = this.boxWidth-10;
        // 需要设值为全局变量
        if(this._deFaultColCount && this._deFaultColCount > 0 && this._maxColCount > this._deFaultColCount){
            this._singleWidth = (totalWidth - totalColSpaces) / this._deFaultColCount;
        }else{
            this._singleWidth = (totalWidth - totalColSpaces) / this._maxColCount;
        }
    }
    _sumArray(array){
        var sum = 0;
        array.forEach(item => {
            sum+=parseInt(item)
        });
        return sum;
    };
    // 计算高度
    _computerHeight(){
        this._singleHeights = [];
        for (var i = 0; i<this._rowSpaces.length; i++){
            var singleHeight = this._computeSingleHeight(this._singleWidth, this._rowRatios[i])
            this._singleHeights[i] = singleHeight;
        }
    };
    // 计算单元格高度
    _computeSingleHeight(signleWidth, ratio){
        console.log(ratio);
        var xxyy =  ratio.split(":");
        var singleHeight = (signleWidth*parseInt(xxyy[1]))/xxyy[0];
        return singleHeight;
    };
    //计算单元格距离左边距离
    _computeLeftAbsolute(array, single, index){
        var spaces = 0;
        for(var i=0;i<=index;i++){
            spaces+=parseInt(array[i]);
        }
        return spaces + single * index;
    };
    //计算单元格距离顶端距离
    _computeTopAbsolute(array, heightArray, index){
        var spaces = 0;
        for(var i=0;i<=index;i++){
            spaces+=parseInt(array[i]);
        }
        var heights = 0;
        for(var i=0; i<index; i++){
            heights += heightArray[i];
        }
        return spaces + heights;
    }
    // 合并单元格
    compress(arr) {
        if (arr.length <= 1) {
            return {
                msg: "至少选择两个单元格进行合并"
            };
        };
        let areaMerge = this._areaComputeObject(arr);
        if(!areaMerge.isCanOper){
            return {
                msg: "待合并单元格非矩形，无法合并，请重新选择"
            };
        };
        // 生成新的单元格
        let mergeWidth = this._buildMergeScaleWidth(this._colSpaces, areaMerge.minLeft, areaMerge.maxLeft);
        let mergeHeigh = this._buildMergeScaleHeight(this._rowSpaces, areaMerge.minTop,  areaMerge.maxTop);
        let leftAbsolute = this._computeLeftAbsolute(this._colSpaces, this._singleWidth, areaMerge.left);
        let topAbsolute = this._computeTopAbsolute(this._rowSpaces, this._singleHeights, areaMerge.top);
        return {
            isChoose: false,
            retions: `${areaMerge.width}:${areaMerge.height}`,
            width: areaMerge.width,
            height: areaMerge.height,
            top: areaMerge.top,
            left: areaMerge.left,
            class: this._tileColor(areaMerge.width,areaMerge.height),
            style: `width:${mergeWidth}px;height:${mergeHeigh}px;left:${leftAbsolute}px;top:${topAbsolute}px`
        }
    }
    // 分离单元格
    expand(arr) {
        if(arr.length>1){
            return {
                msg: '只支持单个单元格分离'
            };
        }
        let cell = arr[0];
        if(cell.width==1 && cell.height==1){
            return {
                msg: '已是最小单元格，无需分离'
            };
        }
        let childArr = [];
        for(let i = 0; i < cell.height; i++) {
            let singleHeight = this._singleHeights[cell.top+i];
            for(let j=0;j<cell.width;j++){
                let leftAbsolute = this._computeLeftAbsolute(this._colSpaces, this._singleWidth, j + cell.left);
                let topAbsolute = this._computeTopAbsolute(this._rowSpaces, this._singleHeights, i + cell.top);
                let style = `width:${this._singleWidth}px;height:${singleHeight}px;left:${leftAbsolute}px;top:${topAbsolute}px`;
                let obj = {
                    isChoose: false,
                    retions: '1:1',
                    top: i + cell.top,
                    left: j + cell.left,
                    style: style,
                    width: 1,
                    height: 1,
                    class: 'bg-blue'
                };
                childArr.push(obj);
            }
        };
        return childArr;
    }
    // 判断是否可以合并
    _areaComputeObject(arr) {
        let minLeft = -1;
        let minTop = -1;
        let maxLeft = 0;
        let maxTop = 0;
        let area = 0;
        let haseRepeat = false;
        console.log(arr);
        arr.forEach(obj => {
            if(obj.hasRepeat && obj.hasRepeat == 'true'){
                haseRepeat = true;
            }
            let top = obj.top + obj.height;
            let left = obj.left + obj.width;
            if (minLeft == -1 || minLeft > obj.left){
                minLeft = obj.left;
            }
            
            if(maxLeft == 0 || maxLeft < left){
                maxLeft = left; 
            }
            
            if(minTop == -1 || minTop > obj.top){
                minTop = obj.top;
            }
            
            if(maxTop == 0 || maxTop < top){
                maxTop = top;
            }
            
            area += obj.height * obj.width;
        });
        return {
            "minLeft": minLeft,
            "maxLeft": maxLeft,
            "minTop": minTop,
            "maxTop": maxTop,
            "width": maxLeft - minLeft,
            "height": maxTop - minTop,
            "left": minLeft,
            "top": minTop,
            "isCanOper": (maxLeft - minLeft)*(maxTop - minTop) == area,
            "haseRepeat": haseRepeat
        }
    }
    //计算合并后的单元格宽
    _buildMergeScaleWidth(array, start, end){
        var space = 0;
        for(var i = start + 1; i<end; i++){
            space += parseInt(array[i]);
        }
        space += this._singleWidth * (end - start);
        return space;
    }
    //计算合并后的单元格高
    _buildMergeScaleHeight(array, start, end){
        var space = 0;
        var height = 0;
        for(var i = start + 1; i<end; i++){
            space += parseInt(array[i]);
        }
        for(var i = start; i<end; i++){
            height += parseInt(this._singleHeights[i]);
        }
        
        space += height;
        return space;
    }
    _tileColor(width, height) {
        if(width == 1 && height == 1){
            return 'bg-title1';
        }else if(width == 1 && height == 2){
            return 'bg-title2';
        }else if(width == 2 && height == 1){
            return 'bg-title3';
        }else if(width == 2 && height == 2){
            return 'bg-title4';
        }else{
            return 'bg-title5';
        }
    }
}
export default TemplateFun