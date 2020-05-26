<template>
    <v-card>
        <v-card-title>
            <v-btn color="primary" @click="addMember">新增人员</v-btn>
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
                :items="members"
                :pagination.sync="pagination"
                :total-items="totalMembers"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.username }}</td>
                <td class="text-xs-center">{{ props.item.roleName }}</td>
                <td class="text-xs-center">
                    <span v-if="props.item.state === true">启用</span>
                    <span v-if="props.item.state !== true">未启用</span>
                </td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="editMember(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改人员</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="deleteMember(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除人员</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="setRole(props.item)">
                            <i class="el-icon-user"/>
                        </v-btn>
                        <span> 用户角色</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <member-form @close="closeWindow" :old-member="oldMember" :isEdit="isEdit"/>
        </v-dialog>
        <v-dialog max-width="500" v-model="showRole" persistent scrollable>
            <member-tree @close="closeTreeWindow" :old-member="oldMember" :old-role="oldRole"
                         :old-selected-role.sync="oldSelectedRole" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import MemberForm from './MemberForm'
    import MemberTree from "./MemberTree";

    export default {
        name: "module",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalMembers: 0, // 总条数
                members: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: '人员Id', align: 'center', value: 'id', sortable: false},
                    {text: '人员名称', align: 'center', sortable: false, value: 'username'},
                    {text: '人员角色', align: 'center', value: 'roleName', sortable: false,},
                    {text: '状态', align: 'center', value: 'state', sortable: false,},
                    {text: '操作', align: 'center', value: 'id', sortable: false}
                ],
                show: false,// 控制对话框的显示
                showRole: false,
                oldMember: {}, // 即将被编辑的品牌数据
                oldSelectedRole: [],
                oldRole: [],
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
                    this.getOldParentModules();
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
                this.$http.get("/user/member/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage // 每页大小
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.members = resp.data.items;
                    this.totalMembers = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            addMember() {
                // 修改标记
                this.isEdit = false;
                // 控制弹窗可见：
                this.show = true;
                // 把oldBrand变为null
                this.oldModule = null;
            },
            editMember(oldMember) {
                // 根据品牌信息查询商品分类
                this.$http.get("/user/member/?id=" + oldMember.id)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的brand
                        this.oldMember = oldMember
                    })
            },
            deleteMember(oldMember) {
                // 根据品牌信息查询商品分类
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/user/member/?id=" + oldMember.id)
                            .then(() => {
                                // 关闭窗口
                                this.$emit("close");
                                this.$message.success("删除成功！");
                                this.reload();
                            }).catch(
                            () => {
                                this.$message.error("删除失败！");
                            });
                    })
            },
            setRole(oldMember) {
                this.$http.get("/user/role/all")
                    .then((resp) => {
                        this.showRole = true;
                        this.oldRole = resp.data
                        this.getMemberData(oldMember)
                        this.getSelectedRole(oldMember)
                    });

            },
            getMemberData(oldMember) {
                this.$http.get("/user/member/?id=" + oldMember.id)
                    .then(({data}) => {
                        this.oldMember = oldMember
                    })
            },
            getSelectedRole(oldMember) {
                this.$http.get("/user/role/of/member?id=" + oldMember.id)
                    .then((resp) => {
                        this.oldSelectedRole = resp.data
                    });
            },
            getOldParentModules() {
                // 发起请求
                this.$http.get("/user/module/getOldParentModules").then(resp => { // 这里使用箭头函数
                    this.oldParentModules = resp.data;
                })
            },
            closeWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.show = false;
            },
            closeTreeWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.showRole = false;
            }
        },
        components: {
            MemberTree,
            MemberForm
        }
    }
</script>

<style scoped>

</style>