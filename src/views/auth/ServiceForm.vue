<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改服务' : '新增服务'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myServiceForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="service.serviceName" label="服务名称"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="service.info" label="功能描述"/>
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
        name: "service-form",
        props: {
            oldService: {
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
                service: {
                    serviceName: '', // 服务名称
                    info: '',// 功能描述
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
                if (this.$refs.myServiceForm.validate()) {
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/auth/service',
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
                this.$refs.myServiceForm.reset();
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
                        this.service = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.service = {
                            serviceName: '',
                            info: ''
                        };
                        this.$refs.myServiceForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
