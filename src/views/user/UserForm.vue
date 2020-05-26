<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改用户' : '新增用户'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myUserForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="user.username" label="会员名称" disabled/>
                        </v-flex>
                        <br>
                        <v-flex>
                            <v-select
                                    v-model="user.level"
                                    :items="levels"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="会员等级"
                            ></v-select>
                        </v-flex>
<!--                        <v-flex class="md12">-->
<!--                            <v-text-field v-model="user.level" label="会员等级" required/>-->
<!--                        </v-flex>-->
                        <br>
                        <v-flex class="md12">
                            <v-text-field v-model="user.integral" label="会员积分" required/>
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
        name: "user-form",
        props: {
            oldUser: {
                type: Object
            },
            isEdit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                valid: false, // 表单校验结果标记
                user: {
                    username: '', // 用户名称
                    level: '', // 用户等级
                    integral: '',// 用户积分
                },
                levels: [
                    {"label":"黑铁会员", "value": 1},
                    {"label":"铜牌会员", "value": 2},
                    {"label":"银牌会员", "value": 3},
                    {"label":"金牌会员", "value": 4},
                    {"label":"钻石会员", "value": 5},
                    {"label":"星钻会员", "value": 6}
                ]
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myUserForm.validate()) {
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/user',
                        data: this.user
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
                this.$refs.myBrandForm.reset();
                // 需要手动清空商品分类
                this.categories = [];
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldUser: {// 监控oldBrand的变化
                handler(val) {
                    if (val) {
                        // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
                        this.user = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.user = {
                            username: '',
                            level: '',
                            integral: ''
                        };
                        this.$refs.myUserForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
