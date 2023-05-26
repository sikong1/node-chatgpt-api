/*
 * @Author: liul
 * @Date: 2022-08-29 10:20:16
 * @Discription: 全局过滤器
 */
import { App } from "vue";

export default function registerProperties(app: App) {
  app.config.globalProperties.$filters = {
    foo() {
      console.log("foo");
    },
    formatTime(value: string) {
      console.log("aaaaaaaaa");
    }
  };
}
