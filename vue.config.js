const path = require('path');
module.exports = {
  // 关闭eslint方式（或者直接删除packjson.json里面的eslintConfig对象也可达到效果）
  lintOnSave: false, // 代码保存后eslint执行
  devServer: {
    overlay: { // 警告信息/错误信息不在浏览器中显示
      warnings: false,
      errors: false
    }
  }
}