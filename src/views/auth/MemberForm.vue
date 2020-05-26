<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改人员' : '新增人员'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myMemberForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="member.username" label="人员名称"/>
                        </v-flex>
                        <br>
                        <v-flex>
                            <v-select
                                    v-model="member.state"
                                    :items="states"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="是否启用"
                            ></v-select>
                        </v-flex>
                        <!--                        <v-flex class="md12">-->
                        <!--                            <v-text-field v-model="user.level" label="会员等级" required/>-->
                        <!--                        </v-flex>-->
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
        name: "member-form",
        props: {
            oldMember: {
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
                member: {
                    username: '', // 用户名称
                    state: '',// 用户积分
                },
                states: [
                    {"label": "启用", "value": true},
                    {"label": "禁用", "value": false}
                ]
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myMemberForm.validate()) {
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/user/member',
                        data: this.member
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
                this.$refs.myMemberForm.reset();
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldMember: {// 监控oldBrand的变化
                handler(val) {
                    if (val) {
                        // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
                        this.member = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.member = {
                            username: '',
                            state: ''
                        };
                        this.$refs.myMemberForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
