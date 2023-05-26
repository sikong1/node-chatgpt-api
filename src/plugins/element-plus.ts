/*
 * @Author: liul
 * @Date: 2022-08-29 10:11:12
 * @Discription: element-plus
 */
import { App } from "vue";
import { ElButton } from "element-plus";
const components = [ElButton];
export default function registerElementPlus(app: App) {
  for (const component of components) {
    app.component(component.name, component);
  }
}
