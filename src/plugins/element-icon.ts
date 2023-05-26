/*
 * @Author: liul
 * @Date: 2022-08-29 10:11:33
 * @Discription: element-icon
 */
import { App } from "vue";
import { House, HomeFilled } from "@element-plus/icons-vue";
const iconList = [House, HomeFilled];
export default function registerElementIcon(app: App): void {
  for (const icon of iconList) {
    app.component(icon.name, icon);
  }
}
