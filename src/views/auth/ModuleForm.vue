<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改权限' : '新增权限'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myModuleForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="module.name" label="权限名称" required :rules="nameRules"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-select
                                    v-model="module.parentId"
                                    :items="oldParentModule"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="父权限"
                            ></v-select>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="module.curl" label="请求路径" required/>
                        </v-flex>
                        <v-flex class="md12" v-if="module.parentId === ''">
                            <v-text-field v-model="module.action" label="图标" required/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-select
                                    v-model="module.action"
                                    :items="icons"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    append-icon="map"
                                    label="图标"
                            ></v-select>
                        </v-flex>
                        <v-flex class="md12">
                            <v-select
                                    v-model="module.level"
                                    :items="levels"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="菜单级别"
                            ></v-select>
                        </v-flex>
                        <v-flex class="md12">
                            <v-select
                                    v-model="module.state"
                                    :items="states"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="是否启用"
                            ></v-select>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn depressed small @click="submit">提交</v-btn>
            <v-btn depressed small @click="clear">重置</v-btn>
            <v-btn depressed small @click="close">关闭</v-btn>
        </v-card-actions>
    </v-card>

</template>

<script>
    export default {
        name: "module-form",
        props: {
            oldModule: {
                type: Object
            },
            oldParentModule: {
                type: Array
            },
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                valid: false, // 表单校验结果标记
                module: {
                    name: '',  // 品牌名称
                    parentId: '',
                    parentName: '',
                    curl: '',
                    action: '',
                    level: '',
                    state: ''
                },
                states: [
                    {"label": "启用", "value": true},
                    {"label": "禁用", "value": false}
                ],
                levels: [
                    {"label": "一级菜单", "value": 1},
                    {"label": "二级菜单", "value": 2}
                ],
                icons: [
                    {"label": '<v-icon>home</v-icon>', "value": 'home'},
                    {"label": '<v-icon>apps</v-icon>', "value": 'apps'}
                ],
                nameRules: [
                    v => !!v || "权限名称不能为空",
                    v => /^.{2,}$/.test(v) || "权限名称至少2位"
                ]
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myModuleForm.validate()) {
                    // 定义一个请求参数对象，通过解构表达式来获取brand中的属性
                    // 数据库中只要保存分类的id即可，因此我们对categories的值进行处理,只保留id，并转为字符串
                    // 将数据提交到后台
                    // this.$http.post('/item/brand', this.$qs.stringify(params))
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/user/module',
                        data: this.module
                    }).then(() => {
                        // 关闭窗口
                        this.$emit("close");
                        this.$message.success("保存成功！");
                    })
                        .catch(() => {
                            this.$message.error("保存失败！");
                        });
                }
            },
            clear() {
                // 重置表单
                this.$refs.myModuleForm.reset();
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldModule: {// 监控oldBrand的变化
                handler(val) {
                    if (val) {
                        // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
                        this.module = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.module = {
                            name: '',  // 品牌名称
                            parentId: '',
                            parentName: '',
                            curl: '',
                            active: '',
                            level: '',
                            state: ''
                        };
                        this.$refs.myModuleForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
