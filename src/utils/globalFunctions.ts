import tinycolor from 'tinycolor2';
import {ElMessage} from "element-plus";

export const setThemeColor = (color) => {

  const newColor = tinycolor(color);

  // 设置element-plus的主题色
  document.documentElement.style.setProperty("--el-color-primary", newColor);

  // 设置element-plus的边框色
  document.documentElement.style.setProperty("--el-border-color", newColor);

}

export const elMessage = (message, type) => {
  ElMessage({
    showClose: true, grouping: true, message: message, type: type,
  })
}
