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
                :items="logistics"
                :pagination.sync="pagination"
                :total-items="totalLogistics"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.orderId }}</td>
                <td class="text-xs-center">{{ props.item.logisticsNumber }}</td>
                <td class="text-xs-center">{{ props.item.logisticsCompany }}</td>
                <td class="text-xs-center">{{ props.item.addressee }}</td>
                <td class="text-xs-center">{{ props.item.phone }}</td>
                <td class="text-xs-center">
                    {{ props.item.province }} {{ props.item.city }} {{ props.item.street }}
                </td>
                <td class="text-xs-center">{{ props.item.postCode }}</td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="editLogistics(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改物流</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="deleteLogistics(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除物流</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <logistics-form @close="closeWindow" :old-logistics="oldLogistics" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import LogisticsForm from './LogisticsForm'

    export default {
        name: "logistics",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalLogistics: 0, // 总条数
                logistics: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: '订单编号', align: 'center', value: 'orderId', sortable: false},
                    {text: '快递单号', align: 'center', sortable: false, value: 'logisticsNumber'},
                    {text: '快递公司', align: 'center', sortable: false, value: 'logisticsCompany'},
                    {text: '收货人', align: 'center', value: 'addressee', sortable: false},
                    {text: '手机号', align: 'center', value: 'phone', sortable: false},
                    {text: '收货地址', align: 'center', value: 'address', sortable: false},
                    {text: '邮政编码', align: 'center', value: 'postCode', sortable: false},
                    {text: '操作', align: 'center', value: 'orderId', sortable: false}
                ],
                show: false,// 控制对话框的显示
                oldLogistics: {}, // 即将被编辑的user数据
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
            }
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
                this.$http.get("/order/logistics/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage,// 每页大小
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.logistics = resp.data.items;
                    this.totalLogistics = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            editLogistics(oldLogistics) {
                // 根据品牌信息查询商品分类
                this.$http.get("/order/logistics/?id=" + oldLogistics.orderId)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的user
                        this.oldLogistics = oldLogistics
                    })
            },
            deleteLogistics(oldLogistics) {
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/order/logistics/?id=" + oldLogistics.orderId)
                            .then(() => {
                                this.$message.success("删除成功");
                                this.reload();
                            }).catch(
                            this.$message.error("删除失败")
                        )
                    })
            },
            closeWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.show = false;
            }
        }
        ,
        components: {
            LogisticsForm
        }
    }
</script>

<style scoped>

</style>