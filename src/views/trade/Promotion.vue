<template>
    <v-card>
        <v-card-title>
            <!--搜索框，与search属性关联-->
            <v-spacer/>
            <v-flex xs3>
                <!--v-model.lazy="search"-->
                <v-text-field label="输入关键字搜索" @keyup.enter="search" v-model.lazy="key" append-icon="search"
                              hide-details/>
            </v-flex>
        </v-card-title>
        <v-divider/>
        <v-data-table
                :headers="headers"
                :items="skus"
                :pagination.sync="pagination"
                :total-items="totalSkus"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.title }}</td>
                <td class="text-xs-center"><img width="50" height="50" :src="props.item.images" alt="商品图片"></td>
                <td class="text-xs-center">{{ formatPrice(props.item.price) }}</td>
                <td class="text-xs-center">{{ props.item.stock }}</td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="setPolicy(props.item)">
                            <i class="el-icon-sell"/>
                        </v-btn>
                        <span> 设置秒杀规则</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <policy-form @close="closeWindow" :old-sku="oldSku" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import PolicyForm from './PolicyForm'

    export default {
        name: "policy",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalSkus: 0, // 总条数
                skus: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: 'skuId', align: 'center', value: 'id', sortable: false},
                    {text: '标题', align: 'center', sortable: false, value: 'title'},
                    {text: '图片', align: 'center', sortable: false, value: 'images'},
                    {text: '价格', align: 'center', sortable: false, value: 'price'},
                    {text: '库存', align: 'center', sortable: false, value: 'stock'},
                    {text: '操作', align: 'center', value: 'id', sortable: false}
                ],
                show: false,// 控制对话框的显示
                oldSku: {}, // 即将被编辑的品牌数据
                isEdit: false, // 是否是编辑
            }
        },
        mounted() { // 渲染后执行
            // 查询数据
            this.isLogin();
        },
        watch: {
            pagination: { // 监视pagination属性的变化
                deep: true, // deep为true，会监视pagination的属性及属性中的对象属性变化
                handler() {
                    // 变化后的回调函数，这里我们再次调用getDataFromServer即可
                    this.getDataFromServer();
                }
            }/*,
            search: { // 监视搜索字段   有bug
                handler() {
                    // this.getDataFromServer();
                    if (this.pagination.page !== 1) {
                        this.pagination.page = 1;
                    }
                    this.getDataFromServer();
                }
            }*/
        },
        methods: {
            isLogin() {
                this.$http.get("/auth/verify").then(resp => {
                    this.user = resp.data;
                    this.getDataFromServer()
                }).catch(error => {
                    // 去登录
                    this.gotoLogin();
                })
            },
            gotoLogin() {
                this.$router.push("/login");
            },
            search() {
                if (this.pagination.page !== 1) {
                    this.pagination.page = 1;
                }
                this.getDataFromServer();
            },
            getDataFromServer() { // 从服务的加载数的方法。
                // 发起请求
                this.$http.get("/item/sku/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage // 每页大小
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.skus = resp.data.items;
                    this.totalSkus = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            setPolicy(oldSku) {
                // 根据品牌信息查询商品分类
                this.$http.get("/item/sku/" + oldSku.id)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = false;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的brand
                        this.oldSku = oldSku
                    })
            },
            closeWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.show = false;
            },
            formatPrice(val) {
                if (typeof val === 'string') {
                    if (isNaN(val)) {
                        return null;
                    }
                    // 价格转为整数
                    const index = val.lastIndexOf(".");
                    let p = "";
                    if (index < 0) {
                        // 无小数
                        p = val + "00";
                    } else if (index === p.length - 2) {
                        // 1位小数
                        p = val.replace("\.", "") + "0";
                    } else {
                        // 2位小数
                        p = val.replace("\.", "")
                    }
                    return parseInt(p);
                } else if (typeof val === 'number') {
                    if (val == null) {
                        return null;
                    }
                    const s = val + '';
                    if (s.length === 0) {
                        return "0.00";
                    }
                    if (s.length === 1) {
                        return "0.0" + val;
                    }
                    if (s.length === 2) {
                        return "0." + val;
                    }
                    const i = s.indexOf(".");
                    if (i < 0) {
                        return s.substring(0, s.length - 2) + "." + s.substring(s.length - 2)
                    }
                    const num = s.substring(0, i) + s.substring(i + 1);
                    if (i === 1) {
                        // 1位整数
                        return "0.0" + num;
                    }
                    if (i === 2) {
                        return "0." + num;
                    }
                    if (i > 2) {
                        return num.substring(0, i - 2) + "." + num.substring(i - 2)
                    }
                }
            }
        },
        components: {
            PolicyForm
        }
    }
</script>

<style scoped>

</style>
