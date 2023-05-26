import { createApp } from "vue";
import App from "./App.vue";
// import router from "./router";

// import "normalize.css";
// import { createPinia } from "pinia";
// import regComponts from '@/views/CMap/reg-components'
// import loading from './directives/loading'
// import empty from './directives/empty'
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 实例创建
const app = createApp(App);
// 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 插件注册
import "element-plus/dist/index.css";
// import "@/assets/style/font.css";
// import "@/assets/iconfont-third/self/iconfont.css";
// import "@/assets/iconfont-third/self/esri.css";
// import "@/assets/iconfont-third/self/popup.scss";
// import "@/assets/style/reset.css";
import registerGlobalPlugins from "@/plugins";
import { formContextKey } from "element-plus";
// import "@/assets/style/global.scss";
// app.directive('customLoading', loading)
// app.directive('customEmpty', empty)

app.use(registerGlobalPlugins);
// 全局注册
// app.use(regComponts)
// app.use(createPinia());
// app.use(router);
app.mount("#app");

