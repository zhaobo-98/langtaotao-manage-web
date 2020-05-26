<template>
    <v-card>
        <v-card-title>
            <v-btn color="primary" @click="addRole">新增权限</v-btn>
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
                :items="modules"
                :pagination.sync="pagination"
                :total-items="totalModules"
                :loading="loading"
                class="elevation-1"
        >
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.moduleId }}</td>
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center">{{ props.item.parentId }}</td>
                <td class="text-xs-center">{{ props.item.parentName }}</td>
                <td class="text-xs-center">{{ props.item.curl }}</td>
                <td class="text-xs-center"><v-icon>{{ props.item.action }}</v-icon></td>
                <td class="text-xs-center">{{ props.item.level }}</td>
                <td class="text-xs-center">
                    <span v-if="props.item.state === true">启用</span>
                    <span v-if="props.item.state !== true">未启用</span>
                </td>
                <td class="justify-center layout px-0">
                    <v-tooltip left>
                        <v-btn slot="activator" icon @click="editRole(props.item)">
                            <i class="el-icon-edit"/>
                        </v-btn>
                        <span> 修改权限</span>
                    </v-tooltip>
                    <v-tooltip left>
                        <v-btn icon slot="activator" @click="deleteRole(props.item)">
                            <i class="el-icon-delete"/>
                        </v-btn>
                        <span> 删除权限</span>
                    </v-tooltip>
                </td>
            </template>
            <template v-slot:pageText="props">
                当前 {{ props.pageStart }} - {{ props.pageStop }} 共 {{ props.itemsLength }}条
            </template>
        </v-data-table>
        <!--弹出的对话框-->
        <v-dialog max-width="500" v-model="show" persistent scrollable>
            <module-form @close="closeWindow" :old-module="oldModule" :old-parent-module="oldParentModules"
                         :isEdit="isEdit"/>
        </v-dialog>
    </v-card>
</template>

<script>
    // 导入自定义的表单组件
    import ModuleForm from './ModuleForm'

    export default {
        name: "module",
        inject: ["reload"],
        data() {
            return {
                key: '', // 搜索过滤字段
                totalModules: 0, // 总条数
                modules: [], // 当前页品牌数据
                loading: true, // 是否在加载中
                pagination: {}, // 分页信息
                headers: [
                    {text: '权限Id', align: 'center', value: 'roleId', sortable: false},
                    {text: '权限名称', align: 'center', sortable: false, value: 'name'},
                    {text: '父权限Id', align: 'center', sortable: false, value: 'parentId'},
                    {text: '父权限名称', align: 'center', value: 'parentName', sortable: false,},
                    {text: '访问路径', align: 'center', value: 'curl', sortable: false,},
                    {text: '图标', align: 'center', value: 'action', sortable: false,},
                    {text: '菜单级别', align: 'center', value: 'level', sortable: false,},
                    {text: '状态', align: 'center', value: 'state', sortable: false,},
                    {text: '操作', align: 'center', value: 'id', sortable: false}
                ],
                show: false,// 控制对话框的显示
                oldModule: {}, // 即将被编辑的品牌数据
                oldParentModules: [],
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
                this.$http.get("/user/module/page", {
                    params: {
                        key: this.key, // 搜索条件
                        page: this.pagination.page,// 当前页
                        rows: this.pagination.rowsPerPage // 每页大小
                    }
                }).then(resp => { // 这里使用箭头函数
                    this.modules = resp.data.items;
                    this.totalModules = resp.data.total;
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
                this.oldModule = null;
            },
            editRole(oldModule) {
                // 根据品牌信息查询商品分类
                this.$http.get("/user/module/?id=" + oldModule.moduleId)
                    .then(({data}) => {
                        // 修改标记
                        this.isEdit = true;
                        // 控制弹窗可见：
                        this.show = true;
                        // 获取要编辑的brand
                        this.oldModule = oldModule
                    })
            },
            deleteRole(oldModule) {
                // 根据品牌信息查询商品分类
                this.$message.confirm("您确定要删除吗？")
                    .then(() => {
                        this.$http.delete("/user/module/?id=" + oldModule.moduleId)
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
            }
        },
        components: {
            ModuleForm
        }
    }
</script>

<style scoped>

</style>