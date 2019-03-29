// const KoaRouter = require("koa-router");
const path = require("path");
const fs = require("fs");
const serverWebpackConfig = require("../build/webpack.server.config.js");
const clientWebpackConfig = require("../build/webpack.client.config.js");
const {createBundleRenderer} = require("vue-server-renderer");
const memoryFs = require("memory-fs");
const webpack = require("webpack");
const render = require("./render");
const rimraf = require("rimraf");
const {
    TEMPLATE_PATH,
    PROD_CLIENT_MANIFEST_PATH,
    PROD_SERVER_MANIFEST_PATH
} = require("./config.js");


// const serverCompiler = webpack(webpackConfig);
//指定文件编译输出为内存
const mfs = new memoryFs();
// serverCompiler.outputFileSystem = mfs;

// const router = new KoaRouter({
//     prefix: "/api"
// });
// let serverCompiler;
const compiler = (configPath, type) => {
    return new Promise((resolve) => {
        let serverCompiler = webpack(configPath);
        if (type === "server") {
            serverCompiler.outputFileSystem = mfs;
        }
        serverCompiler.run((err, stats) => {
            // console.log("err", err);
            // console.log("stats", stats);
            resolve();
        });

    });
}
const bundlePath = path.join(
    serverWebpackConfig.output.path,
    "vue-ssr-server-bundle.json"
);

const removeDirectory = (path) => {
    return new Promise(resolve => {
        rimraf(path, resolve);
    });
}
const importComponent = (componentList) => {
    let componentJSONPath = path.resolve(__dirname, "../containers/test/import.json");
    let componentFilePath = path.resolve(__dirname, "../containers/test/import.js");
    let arr = [];
    // let components = {};
    let components = "", comPaths = "";
    //生成import语句
    componentList.forEach(item => {
        let str = `import ${item.type} from "${item.path}";`;
        // components[item.type] = item.type;
        components += `${item.type},`
        // 引入组件的路径们
        comPaths += `${item.path},`
        arr.push(str);
    });
    //生成component配置
    let code = `${arr.join("")}export default {components: {${components}}}`;
    fs.writeFileSync(componentFilePath, code);
    //生成component路径对比json
    fs.writeFileSync(componentJSONPath, JSON.stringify(comPaths));
}
const handle = async (ctx, next) => {
// router.post("/compiler", async (ctx, next) => {
    //获取参数
    let componentList = ctx.params.componentList;
    // console.log("接收到参数", componentList);
    //按需引入组件
    importComponent(componentList);
    //删除完毕，开始编译
    await removeDirectory(path.resolve(__dirname, "../client-dist"));
    console.log("删除完毕，开始编译");
    //打包编译客户端的文件
    await compiler(clientWebpackConfig("development"), "client");
    await compiler(serverWebpackConfig, "server");
    const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    let bundle;
    try {
        bundle = JSON.parse(mfs.readFileSync(bundlePath, "utf-8"));
    } catch(err) {
        console.log("err", err);
        
    }
    const clientManifest = require(PROD_CLIENT_MANIFEST_PATH);
    let renderer = createBundleRenderer(bundle, {
        runInNewContext: false,
        template,
        clientManifest
    });
    let html = await render(ctx, renderer);
    //鉴于srcdoc的问题，这里写入文件，返回链接地址
    // ctx.body = html;
    const distPath = path.resolve(__dirname, "../client-dist/public/test.html");
    fs.writeFileSync(distPath, html);
    ctx.body = "http://127.0.0.1:3000/public/test.html";
};

// module.exports = router;
module.exports = handle;