<script>
// <a-icon type="picture" theme="twoTone"/>
import Vue from "vue";
import Component from "vue-class-component";
import {Collapse, Icon, Checkbox, Button, message} from "ant-design-vue";
import {componentsList} from "./config";
import axios from "axios";
import {postMessage} from "../../util";
import {generatorId} from "../../../../plugin/edit/util";
Vue.use(Collapse);
Vue.use(Icon);
Vue.use(Checkbox);
Vue.use(Button);
@Component
export default class List extends Vue {
    activeKey = ["1"];
    componentsList = componentsList;
    //记录需要导入的组件列表
    needImportComponentList = [];
    //记录已经导入的组件
    importedComponent = ''

    onChange(group, component) {
        component.group = group;
        // let arr = [].concat(needImportComponentList);
        let _index = -1;
        this.needImportComponentList.forEach((item, index) => {
            if (item.type === component.type) {
                _index = index;
            }
        });
        if (_index > -1) {
            this.needImportComponentList.splice(_index, 1);
        } else {
            this.needImportComponentList.push(component);
        }
        this.$store.commit("gw/setNeedImportComponentList", this.needImportComponentList);
        // console.log(component);
        // console.log(this.needImportComponentList);
    }
    //导入组件，开始编译
    async _import() {
        await this.$store.dispatch("getIframeSrc", this.needImportComponentList);
        //请求页面配置
        this.$store.dispatch("gw/getPagePropsList", {});
        //请求已导入的组件
        this.getReadyKits();
    }
    /**
     * 添加组件
     */  
    add(group, itemInfo) {
        // 判断是否导入
        // let regExp = new RegExp(itemInfo.path)
        // if(!regExp.test(this.importedComponent)) {
        //     message.warning('请先导入组件', 1.5)
        //     return
        // }
        let item = {
            ...itemInfo,
            id: generatorId(),//为组件生成一个id
            group
        }
        postMessage({
            type: "addComponent",
            data: {
                component: item
            }
        });
    }
    /**
     * 获取列表
    */
    async getList() {
        let url = "/api/getKitsList";
        try {
            let list = await axios(url);
            this.componentsList = list.data.data;
        }catch (err) {
            console.log('err: ', err)
        }
    }
    /**
     * 获取已导入的组件
    */
    async getReadyKits() {
        let url = "/api/getReadyKits";
        try {
            let res = await axios(url);
            this.importedComponent = res.data.data
        }catch(err) {
            this.importedComponent = ''
        }
    }
    render() {
        return (
            <div class="component-list-box">
                <div class="btn-box">
                    <a-button onClick={this._import} size="small">导入</a-button>
                </div>
                <a-collapse activeKey={this.activeKey}>
                    {
                        this.componentsList.map((item, index) => {
                            return (
                                <a-collapse-panel header={item.title} key={index + 1 + ""}>
                                    <div class="component-item-box">
                                        {
                                            item.list.map((item2, index2) => {
                                                return (
                                                    <div class="component-item">
                                                        <span onClick={() => this.add(item.group, item2)}>{item2.name}</span>
                                                        <a-checkbox onChange={() => this.onChange(item.group, item2)}></a-checkbox>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </a-collapse-panel>
                            )
                        })
                    }
                </a-collapse>
            </div>
        )
        
    }

    mounted() {
        this.getList()
    }
}
</script>
<style scoped lang="scss">
.component-list-box {
    height: 100%;

    .btn-box {
        background: #fafafa;
        padding: 10px;
        display: flex;
        justify-content: flex-end;
    }

    .ant-collapse {
        height: 100%;
    }
    .component-item {
        display: flex;
        justify-content: space-between;
        width: 100%;
        &>span {
            cursor: pointer;
        }
    }
}

</style>

