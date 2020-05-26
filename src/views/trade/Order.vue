<template>
    <v-card>
        <v-layout row justify-center>
            <v-dialog v-model="confirmFlag" persistent max-width="600px">
                <v-card>
                    <v-card-title>
                        <span class="headline">订单发货信息</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs10>
                                    <v-text-field label="物流单号" v-model="logisticsNumber" required></v-text-field>
                                </v-flex>
                                <v-flex xs2>
                                    <v-btn color="info" @click="generateLogisticNumber">生成单号</v-btn>
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-select
                                            :items="['圆通快递', '申通快递', '中通快递', 'EMS快递', '韵达快递', '顺丰快递', '宅急送快递', '天天快递', '邮政包裹', '百世快递', '全峰快递', '增益快递']"
                                            label="物流公司"
                                            v-model="logisticsCompany"
                                            required
                                    ></v-select>
                                </v-flex>
                            </v-layout>
                        </v-container>
                        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<small style="color: red">*请仔细确认信息</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="closeConfirmFlag">关闭</v-btn>
                        <v-btn color="blue darken-1" flat @click="confirmOrder">提交并发货</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
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
                :items="orders"
                :pagination.sync="pagination"
                :total-items="totalOrders"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.orderId }}</td>
                <td class="text-xs-center">{{ props.item.totalFee }}</td>
                <td class="text-xs-center">{{ props.item.actualFee }}</td>
                <td class="text-xs-center">
                    <span v-if="props.item.paymentType === 1">在线支付</span>
                    <span v-if="props.item.paymentType === 2">货到付款</span>
                </td>
                <td class="text-xs-center">{{ props.item.username }}</td>
                <td class="text-xs-center">
                    <span v-if="props.item.sourceType === 1">手机客户端</span>
                    <span v-if="props.item.sourceType === 2">PC端</span>
                    <span v-if="props.item.sourceType === 3">微信端</span>
                </td>
                <td class="text-xs-center">
                    <span v-if="props.item.status === 1">未付款</span>
                    <span v-if="props.item.status === 2">已付款</span>
                    <span v-if="props.item.status === 3">已发货</span>
                    <span v-if="props.item.status === 4">已收货</span>
                    <span v-if="props.item.status === 5">已关闭</span>
                </td>
                <td class="text-xs-center">{{ props.item.createTime | timefilters}}</td>
                <td class="text-xs-center">{{ props.item.payTime | timefilters}}</td>
                <td class="justify-center layout px-0">
                    <v-tooltip left v-if="props.item.status === 1">
                        <v-btn slot="activator" icon @click="editOrder(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改订单</span>
                    </v-tooltip>
                    <v-tooltip left v-if="props.item.status === 5">
                        <v-btn icon slot="activator" @click="deleteOrder(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除订单</span>
                    </v-tooltip>
                    <v-tooltip left v-if="props.item.status === 2">
                        <v-btn icon slot="activator" @click="showConfirmFlag(props.item)">
                            <i class="el-icon-location-outline"/>
                        </v-btn>
                        <span> 确认订单并安排发货</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <order-form @close="closeWindow" :old-order="oldOrder" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import OrderForm from './OrderForm'

    export default {
        name: "order",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalOrders: 0, // 总条数
                orders: [], // 当前页品牌数据
                logisticsNumber: '', //快递单号
                logisticsCompany: '', //快递公司
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: '编号', align: 'center', value: 'orderId', sortable: false},
                    {text: '总金额', align: 'center', sortable: true, value: 'totalFee'},
                    {text: '实付金额', align: 'center', sortable: true, value: 'actualFee'},
                    {text: '支付方式', align: 'center', value: 'paymentType', sortable: false},
                    {text: '下单用户', align: 'center', value: 'username', sortable: false},
                    {text: '订单来源', align: 'center', value: 'sourceType', sortable: false},
                    {text: '订单状态', align: 'center', value: 'status', sortable: false},
                    {text: '创建时间', align: 'center', value: 'createTime', sortable: false},
                    {text: '付款时间', align: 'center', value: 'payTime', sortable: false},
                    {text: '操作', align: 'center', value: 'orderId', sortable: false}
                ],
                show: false,// 控制对话框的显示
                confirmFlag: false,
                oldOrder: {}, // 即将被编辑的user数据
                isEdit: false, // 是否是编辑
            }
        },
        mounted() { // 渲染后执行
            // 查询数据
            this.isLogin();
        },
        filters: {
            timefilters(val) {
                if (val == null || val == "") {
                    return "暂无时间";
                } else {
                    let d = new Date(val);   //val 为表格内取到的后台时间
                    let month =
                        d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
                    let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
                    let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
                    let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
                    let sec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
                    let times = d.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec;
                    return times;
                }
            }
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
                this.$http.get("/order/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage,// 每页大小
                        sortBy: this.pagination.sortBy,// 排序字段
                        desc: this.pagination.descending// 是否降序
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.orders = resp.data.items;
                    this.totalOrders = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            editOrder(oldOrder) {
                // 根据品牌信息查询商品分类
                this.$http.get("/order/?id=" + oldOrder.orderId)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的user
                        this.oldOrder = oldOrder
                    })
            },
            deleteOrder(oldOrder) {
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/order/?id=" + oldOrder.orderId)
                            .then(() => {
                                this.$message.success("删除成功");
                                this.reload();
                            }).catch(
                            this.$message.error("删除失败")
                        )
                    })
            },
            showConfirmFlag(oldOrder) {
                this.$message.confirm("您要确定此订单,并安排发货吗？")
                    .then(() => {
                        this.confirmFlag = true
                        this.oldOrder = oldOrder
                    })
            },
            confirmOrder() {
                this.$message.confirm("您要确定此物流信息吗?")
                    .then(() => {
                        //已发货 3
                        this.$http.put("/order/confirmOrder?logisticNumber=" + this.logisticsNumber + "&logisticCompany=" + this.logisticsCompany + "&orderId=" + this.oldOrder.orderId)
                            .then(() => {
                                this.$message.success("发货成功");
                                this.reload();
                            })
                    })
            },
            generateLogisticNumber() {
                if (this.logisticsCompany === '') {
                    this.$message.error("请先选择快递公司");
                } else {
                    //'', '', '', '', '', '', '', '', '', '', '', ''
                    if (this.logisticsCompany === '圆通快递') {
                        this.logisticsNumber = 'YT' + Math.random().toString().slice(-10)
                    } else if (this.logisticsCompany === '申通快递') {
                        this.logisticsNumber = 'ST' + Math.random().toString().slice(-12)
                    } else if (this.logisticsCompany === '中通快递') {
                        this.logisticsNumber = 'ZT' + Math.random().toString().slice(-12)
                    } else if (this.logisticsCompany === 'EMS快递') {
                        this.logisticsNumber = 'EMS' + Math.random().toString().slice(-13)
                    } else if (this.logisticsCompany === '韵达快递') {
                        this.logisticsNumber = 'YD' + Math.random().toString().slice(-13)
                    } else if (this.logisticsCompany === '顺丰快递') {
                        this.logisticsNumber = 'SF' + Math.random().toString().slice(-12)
                    } else if (this.logisticsCompany === '宅急送快递') {
                        this.logisticsNumber = 'ZJS' + Math.random().toString().slice(-10)
                    } else if (this.logisticsCompany === '天天快递') {
                        this.logisticsNumber = 'TT' + Math.random().toString().slice(-14)
                    } else if (this.logisticsCompany === '邮政包裹') {
                        this.logisticsNumber = 'ZY' + Math.random().toString().slice(-10)
                    } else if (this.logisticsCompany === '百世快递') {
                        this.logisticsNumber = 'BS' + Math.random().toString().slice(-12)
                    } else if (this.logisticsCompany === '全峰快递') {
                        this.logisticsNumber = 'QF' + Math.random().toString().slice(-10)
                    } else if (this.logisticsCompany === '增益快递') {
                        this.logisticsNumber = 'ZY' + Math.random().toString().slice(-10)
                    }
                }
            },
            closeConfirmFlag() {
                this.confirmFlag = false
                this.logisticsNumber = ''
                this.logisticsCompany = ''
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
            OrderForm
        }
    }
</script>

<style scoped>

</style>