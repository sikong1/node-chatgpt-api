/*
 * @Author: liul
 * @Date: 2022-08-29 10:11:44
 * @Discription: 插件注册
 */
import { App } from "vue";
import registerElementPlus from "./element-plus";
import registerElementIcon from "./element-icon";
import registerProperties from "./register-properties";
export default function registerGlobalPlugins(app: App) {
  app.use(registerElementPlus);
  app.use(registerElementIcon);
  app.use(registerProperties);
}
