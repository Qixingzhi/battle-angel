Battle Angel
&nbsp;  
能看又能打。

### 组件编辑时预览功能的实现
1、操作台edit部分输入数据
&nbsp;&nbsp;  
2、点击应用按钮
&nbsp;&nbsp;  
3、操作台会向iframe发送postMessage事件——"changeComponentProps"，携带表单数据。
&nbsp;&nbsp;  
4、iframe页面接收到事件后，会将用户设置的数据存到vuex中，并trigger一个以组件id为名注册的回调事件，在这个事件中，会给组件的data赋值，从而达到实时更新组件的UI效果。

### 组件编辑时暂存功能的实现
该功能需要调用接口，调用方在操作台。
&nbsp;&nbsp;  
1、点击保存按钮
&nbsp;&nbsp;  
2、操作台向iframe发送postMessage事件——"getComList"。
&nbsp;&nbsp;  
3、iframe接收到事件后，向操作台发送postMessage事件——"returnComList"，携带vuex中保存的componentList数组。
&nbsp;&nbsp;  
4、操作台接收到事件后，会去调用save接口，传给服务器componentList，服务器会写入db文件夹中。
&nbsp;&nbsp;  
5、服务端（可供下载的）的vue代码中的store，会默认加载db中的componentList，从而达到保存的效果。

### 组件删除功能的实现
&nbsp;&nbsp;  
1、点击iframe中组件的删除按钮，发送postMessage事件——"deleteComponentById"，携带组件id，group。
&nbsp;&nbsp;  
2、操作台接收到事件后，弹窗确认是否删除，确认后删除store中componentProps对象里的对应项、判断store中当前editId与要删除的组件id是否一致，如果是，置空editId、向iframe发送postMessage事件——"deleteThisComponent"，携带参数id, group。
&nbsp;&nbsp;  
3、iframe接收到事件后，调用mutation--deleteComponentById，删除iframe的store中对应组件。

### 组件参数回显功能的实现
首先，回显功能的含义是什么？在此应用中，有两层。
&nbsp;&nbsp;  
1、在操作台中，组件编辑面板的表单会显示当前组件的参数信息。
&nbsp;&nbsp;  
2、iframe里的页面（下载之后的页面）会自动应用保存在db文件里的参数配置项。
&nbsp;&nbsp;  
先说第一点。
&nbsp;&nbsp;  
用户在点击某个组件的编辑按钮或拖拽某个组件时，表单信息会自动切换到对应的组件，显示该组件当前的配置参
数。这个是如何实现的呢？
&nbsp;&nbsp;  
点击编辑按钮或拖拽组件（该操作是在iframe中触发）都会给操作台发送事件——"getComponentProps",并携带一个对象作为参数，该对象形如{id: "", group: "", config: {}}。在取得config的过程中，我们对其做了一层包装：遍历config的key，判断该key是否属于css样式，如果属于，再判断该key是否有值，如果没有我们就取得该组件默认的样式值并赋给该key（详见util/setConfig.js）。
&nbsp;&nbsp;  
操作台接收到"getComponentProps"事件后，首先会切换到组件编辑面板，因为某些情况下组件编辑面板可能没有初始化完毕，这里采用了一个17ms的nexttick；然后很简单了，就是把config赋值给表单就好了。
&nbsp;&nbsp;  
再说第二点，组件自动应用参数配置。
&nbsp;&nbsp;  
本质上，我们是在组件的生命周期函数中执行了data的赋值操作，还记得我们前面说的vuex中会默认导入db文件夹下的componentList吗？既然有了初始数据，我们只要在created方法中取得并赋值就可以了。
&nbsp;&nbsp;  
为了简化开发流程，为了组件开发者无需过多关注这方面的东西，我们声明了一个基类。在基类中我们会做好所有的工作，组件开发者可以通过npm安装，在mixins中使用即可。
