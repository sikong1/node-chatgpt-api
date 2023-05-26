/*
 * @Author: liul
 * @Date: 2022-08-29 09:10:23
 * @Discription:
 */
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const IconResolver = require("unplugin-icons/resolver");
// const path = require("path");
// import path from 'path'
// function resolve(dir) {
//   return path.join(__dirname, dir);
// }
const Version = new Date().getTime() + "-1.0.1";
// const libraryAPI = "http://202.109.255.147:8010";
// const weatherAPI = "http://wthrcdn.etouch.cn";

module.exports = {
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  // 设置别名
  // chainWebpack: (config) => {
  //   config.resolve.alias
  //     .set("@", resolve("src"))
  //     .set("~", resolve("src"))
  //     // .set("assets", resolve("src/assets"))
  //     // .set("components", resolve("src/components"))
  //     // .set("views", resolve("src/views"));

  //   // 导入全局scss样式
  //   // const oneOfsMap = config.module.rule("scss").oneOfs.store;
  //   // oneOfsMap.forEach((item) => {
  //   //   item
  //   //     .use("sass-resources-loader")
  //   //     .loader("sass-resources-loader")
  //   //     .options({
  //   //       // Provide path to the file with resources
  //   //       // 要公用的scss的路径
  //   //       resources: "./src/assets/css/public.scss"
  //   //     })
  //   //     .end();
  //   // });
  // },
  // devServer: {
  //   proxy: {
  //     "/library": {
  //       target: libraryAPI,
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "^/library": "/library"
  //       }
  //     },
  //     "/admin": {
  //       target: 'https://bike-system-test.test.goktech.cn',
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "^/admin": "/admin"
  //       }
  //     },
  //     "/bike": {
  //       // target: 'https://bike-system-test.test.goktech.cn',
  //       target: 'http://brain-gateway-dev.dev.goktech.cn',
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "^/bike": "/bike"
  //       }
  //     },
  //     "/urbanSituation": {
  //       target: 'https://city-big-screen.test.goktech.cn',
  //       // target: 'http://brain-gateway-dev.dev.goktech.cn',
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "^/urbanSituation": "/urbanSituation"
  //       }
  //     },
  //     "/weatherInfo": {
  //       target: weatherAPI,
  //       // secure: false,  // 如果是https接口，需要配置这个参数
  //       changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
  //       pathRewrite: {
  //         "^/weatherInfo": ""
  //       }
  //     },
  //     "/bikeenjoy": {
  //       target: 'http://119.3.149.220:10023',
  //       changeOrigin: true,
  //       pathRewrite: {
  //         "^/bikeenjoy": "/bikeenjoy"
  //       }
  //     }
  //   }
  // },
  configureWebpack: {
    output: {
      filename: `js/[name].${Version}.js`,
      chunkFilename: `js/[name].${Version}.js`
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconResolver({ componentPrefix: "icon" })] // 遇到前缀为icon自动解析
      })
      // Icons({ compiler: 'vue3', scale: 1, defaultClass: 'inline-block', autoInstall: true })
    ]
  },
  // css配置版本号防止缓存，
  // css: {
  //   extract: {
  //     ignoreOrder: true,
  //     // 打包后css文件名称添加时间戳
  //     filename: `css/[name].${Version}.css`,
  //     chunkFilename: `css/[name].${Version}.css`
  //   }
  // }
};
