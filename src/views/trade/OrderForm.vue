<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="isEdit ? '修改订单' : '新增订单'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myOrderForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field v-model="order.orderId" label="订单编号" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="order.username" label="下单用户" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="order.totalFee" label="总金额"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="order.actualFee" label="实付金额"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="order.paymentType" label="支付方式" disabled/>
                        </v-flex>
                        <v-flex>
                            <v-select
                                    v-model="order.status"
                                    :items="status"
                                    :item-text="'label'"
                                    :item-value="'value'"
                                    label="订单状态"
                            disabled></v-select>
                        </v-flex>
<!--                        <v-flex class="md12">-->
<!--                            <v-text-field v-model="user.level" label="会员等级" required/>-->
<!--                        </v-flex>-->
                        <br>
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
        name: "order-form",
        props: {
            oldOrder: {
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
                order: {
                    username: '', // 订单名称
                    level: '', // 订单等级
                    integral: '',// 订单积分
                },
                status: [
                    {"label":"未付款", "value": 1},
                    {"label":"已付款", "value": 2},
                    {"label":"已发货", "value": 3},
                    {"label":"已收货", "value": 4},
                    {"label":"已关闭", "value": 5}
                ]
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myOrderForm.validate()) {
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/order',
                        data: this.order
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
                // 需要手动清空商品分类
                this.categories = [];
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldOrder: {// 监控oldBrand的变化
                handler(val) {
                    if (val) {
                        // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
                        this.order = Object.deepCopy(val)
                    } else {
                        // 为空，初始化brand
                        this.order = {
                            username: '',
                            level: '',
                            integral: ''
                        };
                        this.$refs.myOrderForm.reset();
                    }
                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>
