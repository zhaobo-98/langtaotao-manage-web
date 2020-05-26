<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改物流' : '新增物流'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myLogisticsForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.orderId" label="订单编号" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.logisticsNumber" label="快递单号" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.logisticsCompany" label="快递公司" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.addressee" label="收件人"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.phone" label="手机号"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.province" label="省份"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.city" label="城市"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.street" label="街道"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="logistics.postCode" label="邮编"/>
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
        name: "logistics-form",
        props: {
            oldLogistics: {
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
                logistics: {
                    logisticsNumber: '',
                    logisticsCompany: '',
                    addressee: '',
                    phone: '',
                    province: '',
                    city: '',
                    street: '',
                    postCode: ''
                }
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myLogisticsForm.validate()) {
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/order/logistics',
                        data: this.logistics
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
                this.$refs.myOrderForm.reset();
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldLogistics: {// 监控oldBrand的变化
                handler(val) {
                    if (val) {
                        // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
                        this.logistics = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.logistics = {
                            logisticsNumber: '',
                            logisticsCompany: '',
                            addressee: '',
                            phone: '',
                            province: '',
                            city: '',
                            street: '',
                            postCode: ''
                        };
                        this.$refs.myLogisticsForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
