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
                :items="users"
                :pagination.sync="pagination"
                :total-items="totalUsers"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.username }}</td>
                <td class="text-xs-center">
                    <span v-if="props.item.level === 1">黑铁会员</span>
                    <span v-if="props.item.level === 2">铜牌会员</span>
                    <span v-if="props.item.level === 3">银牌会员</span>
                    <span v-if="props.item.level === 4">金牌会员</span>
                    <span v-if="props.item.level === 5">钻石会员</span>
                    <span v-if="props.item.level === 6">星钻会员</span>
                </td>
                <td class="text-xs-center">{{ props.item.integral }}</td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="editUser(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改会员</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="deleteUser(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除会员</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <user-form @close="closeWindow" :old-user="oldUser" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import UserForm from './UserForm'

    export default {
        name: "user",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalUsers: 0, // 总条数
                users: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: 'id', align: 'center', value: 'id', sortable: false},
                    {text: '会员名称', align: 'center', sortable: false, value: 'username'},
                    {text: '会员等级', align: 'center', sortable: false, value: 'level'},
                    {text: '会员积分', align: 'center', value: 'integral', sortable: true},
                    {text: '操作', align: 'center', value: 'id', sortable: false}
                ],
                show: false,// 控制对话框的显示
                oldUser: {}, // 即将被编辑的user数据
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
                this.$http.get("/user/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage,// 每页大小
                        sortBy: this.pagination.sortBy,// 排序字段
                        desc: this.pagination.descending// 是否降序
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.users = resp.data.items;
                    this.totalUsers = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            editUser(oldUser) {
                // 根据品牌信息查询商品分类
                this.$http.get("/user/?id=" + oldUser.id)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的user
                        this.oldUser = oldUser
                    })
            },
            deleteUser(oldUser) {
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/user/?id=" + oldUser.id)
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
        },
        components: {
            UserForm
        }
    }
</script>

<style scoped>

</style>