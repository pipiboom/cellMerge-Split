<template>
  <div class="page">
    <!-- <el-button @click="openCreateDialog(false)" class="floatFirght" icon="el-icon-plus">创建楼层模板</el-button> -->
    <div class="create-template_box">
      <div class="template-box_left">
        <el-form label-width="55px" :model="templateInfo" ref="templateForm" label-position="left">
          <el-row>
            <el-col :xs="24">
              <el-form-item label="名称" prop="templateName">
                <el-input placeholder="请输入名称" clearable v-model="templateInfo.templateName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <span class="column-name">每行单元格设置</span>
              <ul class="column-set">
                <li v-for="(item, index) in retiaList" :key="index">
                  <span class="column-index">{{ `${index+1}行` }}</span>
                  <el-select v-model="retiaList[index]" @change="createTemplate">
                    <el-option
                      :key="index"
                      :label="item"
                      :value="item"
                      v-for="(item, index) in retiaFlx"
                    ></el-option>
                  </el-select>
                  <el-button
                    icon="el-icon-minus"
                    circle
                    @click="reduceColumn(index)"
                    :disabled="retiaList.length === 1"
                  ></el-button>
                </li>
                <el-button icon="el-icon-plus" circle @click="addColumn"></el-button>
              </ul>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="列" required>
                <el-select
                  v-model="templateInfo.column"
                  placeholder="select"
                  style="width: 90px"
                  @change="createTemplate"
                >
                  <el-option
                    :key="index"
                    :label="item"
                    :value="item"
                    v-for="(item, index) in column"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24">
              <el-form-item label="描述">
                <el-input
                  placeholder="请输入描述"
                  clearable
                  v-model="templateInfo.description"
                  type="textarea"
                  :autoSize="{min:2, max: 4}"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <ul class="template-box_right" ref="templateContent">
        <li
          v-for="(item, index) in templateData"
          :key="index"
          :style="item.style"
          @contextmenu.prevent.stop="contextmenu($event, item)"
          :class="[item.class]"
          @click="chooseCell(item)"
        >
          <i class="el-icon-circle-close close-btn" @click.stop="closeCell(item, index)"></i>
          <img src="./choose.png" alt v-show="item.isChoose" class="chooseCell" />
          {{ item.retions }}
        </li>
      </ul>
    </div>
    <ul class="right-menu" ref="contextmenu">
      <li @click="mergeCell">合并</li>
      <li @click="splitCell">分离</li>
      <li @click="chooseRow">选择行</li>
    </ul>
  </div>
</template>

<script>
import TemplateFun from "../utils/template";
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      templateInfo: {
        column: 6
      },
      retiaFlx: ["1:1", "16:9", "3:4"],
      retiaList: ["1:1"],
      column: [1, 2, 3, 4, 5, 6],
      templateObj: {},
      templateData: [],
      checkItem: {}
    };
  },
  created() {
    document.querySelector("body").addEventListener("click", this.closeMenu);
    this.createTemplate();
  },
  methods: {
    closeMenu() {
      this.$refs.contextmenu.style = "display: none";
    },
    // 隐藏单元格
    closeCell(item, index) {
      this.templateData.splice(index, 1);
    },
    // 合并单元格
    mergeCell() {
      let arr = this.templateData.filter(item => {
        return item.isChoose;
      });
      let obj = this.templateObj.compress(arr);
      if (obj.msg) {
        this.$openMessage(obj.msg, "warning");
        return;
      }
      obj.display = true;
      this.$nextTick(() => {
        this.templateData = this.templateData.filter(item => {
          return !item.isChoose;
        });
        this.templateData.push(obj);
      });
    },
    // 选中单元格
    chooseCell(item) {
      item.isChoose = !item.isChoose;
    },
    // 分离单元格
    splitCell() {
      let arr = this.templateData.filter(item => {
        return item.isChoose;
      });
      let child = this.templateObj.expand(arr);
      if (child.msg) {
        this.$openMessage(child.msg, "warning");
        return;
      }
      this.$nextTick(() => {
        this.templateData = this.templateData.filter(item => {
          return !item.isChoose;
        });
        this.templateData.push(...child);
      });
    },
    // 选择行
    chooseRow() {
      this.templateData.forEach(item => {
        if (item.top === this.checkItem.top) {
          item.isChoose = true;
        }
      });
    },
    // 绘制模版
    createTemplate() {
      this.templateObj = new TemplateFun({
        _rowRatios: this.retiaList,
        _maxColCount: this.templateInfo.column,
        _rowCount: this.retiaList.length
      });
      let tpm = this.templateObj.add_start();
      this.$nextTick(() => {
        this.templateData = tpm;
      });
    },
    reduceColumn(index) {
      this.retiaList.splice(index, 1);
      this.createTemplate();
    },
    // 增加行
    addColumn() {
      this.retiaList.push("1:1");
      this.createTemplate();
    },
    contextmenu(e, item) {
      this.checkItem = item;
      e.preventDefault();
      this.$refs.contextmenu.style = `display: block;left:${e.x}px;top:${e.y}px;z-index:99999`;
      return false;
    },
    $openMessage: (msg, type = "success") => {
      Message({
        message: msg,
        type: type,
        showClose: true
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.create-template_box {
  display: flex;

  .template-box_left {
    flex: 0 0 200px;
    height: 400px;

    .column-name {
      margin-bottom: 5px;
      display: block;
    }

    .column-set {
      padding-bottom: 12px;
      max-height: 150px;
      overflow: auto;

      li {
        display: flex;
        margin-bottom: 10px;
        align-items: center;
        justify-content: space-around;

        .el-select {
          width: 90px;
        }
      }
    }
  }

  .template-box_right {
    margin-left: 20px;
    position: relative;
    flex: 1;
    overflow: auto;

    li {
      position: absolute;
      color: #fff;
      border: 1px #eee solid;
      display: flex;
      justify-content: center;
      align-items: center;

      .chooseCell {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        position: absolute;
        bottom: -3px;
        right: -3px;
        font-size: 30px;
      }

      .close-btn {
        position: absolute;
        right: 5px;
        top: 5px;
        cursor: pointer;
        font-size: 20px;
      }
    }

    .bg-title1 {
      background-color: #BB9DCF;
    }

    .bg-title2 {
      background-color: #EE9A00;
    }

    .bg-title3 {
      background-color: #E57B87;
    }

    .bg-title4 {
      background-color: #879E46;
    }

    .bg-title5 {
      background: #79CEED;
    }
  }
}

.bg-blue {
  background: #4b8df8;
}

.right-menu {
  position: fixed;
  background: #fff;
  padding: 1px 0;
  min-width: 40px;
  border-radius: 4px;
  border: 1px solid #c3ced5;
  z-index: 999;
  display: none;
  list-style: none;

  li {
    width: 100px;
    margin: 0px;
    padding: 0px 10px 0 8px;
    height: 22px;
    color: #222;
    line-height: 22px;
    text-align: left;
    cursor: default;
    white-space: nowrap;
    font-family: 'Verdana', 'Tahoma', 'Lucida Grande', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
    font-size: 12px;
  }

  li:hover {
    background-color: #d9e7f2;
    cursor: pointer;
  }
}
</style>
