/**
 * created by gw
 * 2019-4-17
 */
import StyleLoader from "../../plugin/edit/css-modules";
import store from "../store";
/**
 * 
 * @param {Object} vm 
 * @param {Object} data 
 */
const mapData = (vm, data) => {
    let mStyle = {}
    Object.keys(data).forEach(key => {
        let value = data[key];
        if (value) {
            //属于样式标签
            if (key in document.documentElement.style) {
                mStyle[key] = value;
            } else {
                vm[key] = value
            }
        }
    });
    //设置样式属性
    if (Object.keys(mStyle).length) {
        vm.mStyle = StyleLoader(mStyle);
    }
}
export const initListenerCallback = (vm) => {
    window.PSEvent.listen(vm.componentId, (data) => {
        mapData(vm, data)
    });
}

export const initData = (vm) => {
    // console.log("store", );
    
    
    let component = vm.$store.state.componentList.find(item => item.id === vm.componentId);
    // console.log("id", vm.componentId);
    // console.log("config", config);
    if (component && component.config) {
        mapData(vm, component.config);
    }
}