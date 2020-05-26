<template>
    <v-card>
        <v-card-title>
            <v-btn color="primary" @click="addRole">新增角色</v-btn>
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
                :items="roles"
                :pagination.sync="pagination"
                :total-items="totalRoles"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.roleId }}</td>
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center">{{ props.item.createTime | timefilters }}</td>
                <td class="text-xs-center">{{ props.item.updateTime | timefilters }}</td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="editRole(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改角色</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="deleteRole(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除角色</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="authorization(props.item)">
                            <i class="el-icon-finished"/>
                        </v-btn>
                        <span> 角色授权</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <role-form @close="closeWindow" :old-role="oldRole" :isEdit="isEdit"/>
        </v-dialog>
        <v-dialog max-width="500" v-model="showModule" persistent scrollable>
            <module-tree @close="closeModuleWindow" :old-module="oldModule" :old-role="oldRole" :old-selected.sync="selectedModule" :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import RoleForm from './RoleForm'
    import ModuleTree from './ModuleTree'

    export default {
        name: "role",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalRoles: 0, // 总条数
                roles: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: '角色Id', align: 'center', value: 'roleId'},
                    {text: '角色名称', align: 'center', sortable: false, value: 'name'},
                    {text: '创建时间', align: 'center', sortable: false, value: 'createTime'},
                    {text: '更新时间', align: 'center', value: 'updateTime', sortable: false,},
                    {text: '操作', align: 'center', value: 'id', sortable: false}
                ],
                show: false,// 控制对话框的显示
                showModule: false,// 控制对话框的显示
                oldRole: {}, // 即将被编辑的品牌数据
                oldModule: [], // 即将被编辑的品牌数据
                selectedModule: [],
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
                this.$http.get("/user/role/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage // 每页大小
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.roles = resp.data.items;
                    this.totalRoles = resp.data.total;
                    // 完成赋值后，把加载状态赋值为false
                    this.loading = false;
                })
            },
            addRole() {
                // 修改标记
                this.isEdit = false;
                // 控制弹窗可见：
                this.show = true;
                // 把oldBrand变为null
                this.oldBrand = null;
            },
            editRole(oldRole) {
                // 根据品牌信息查询商品分类
                this.$http.get("/user/role/?id=" + oldRole.roleId)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的brand
                        this.oldRole = oldRole
                    })
            },
            deleteRole(oldRole) {
                // 根据品牌信息查询商品分类
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/user/role/?id=" + oldRole.roleId)
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
            authorization(oldRole) {
                // 根据品牌信息查询商品分类
                this.$http.get("/user/module/all")
                    .then(({data}) => {
                        this.getSelected(oldRole)
                        // 控制弹窗可见：
                        this.showModule = true;
                        // 获取要编辑的brand
                        this.oldRole = oldRole
                        this.oldModule = data
                    })

            },
            getSelected(oldRole) {
                // 发起请求
                this.$http.get("/user/module/of/role?id=" + oldRole.roleId)
                    .then(({data}) => {
                        this.selectedModule = data
                    })
            },
            closeWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.show = false;
            },
            closeModuleWindow() {
                // 重新加载数据
                this.getDataFromServer();
                // 关闭窗口
                this.showModule = false;
            }
        },
        components: {
            RoleForm,
            ModuleTree
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
        }
    }
</script>

<style scoped>

</style>