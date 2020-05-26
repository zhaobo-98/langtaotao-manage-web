import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import './config/http'
import MyComponent from './components/MyComponent'
import qs from 'qs'
Vue.prototype.$qs=qs;
Vue.use(MyComponent);
Vue.config.productionTip = false

import {DatePicker} from 'element-ui' //element-ui的全部组件
import 'element-ui/lib/theme-chalk/index.css'//element-ui的css
Vue.use(DatePicker) //使用elementUI

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
