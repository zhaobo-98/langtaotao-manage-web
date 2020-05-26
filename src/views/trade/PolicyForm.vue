<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="'设置秒杀规则'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-form v-model="valid" ref="myPolicyForm">
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex class="md12">
                            <v-text-field :value="oldSku.title" label="商品标题" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field :value="formatPrice(oldSku.price)" label="商品原价" disabled/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="policy.price" label="秒杀价格"/>
                        </v-flex>
                        <v-flex class="md12">
                            <v-text-field v-model="policy.quantity" label="秒杀库存"/>
                        </v-flex>
                        <v-flex class="md12">
                            <el-date-picker
                                    v-model="policy.beginTime"
                                    type="datetime"
                                    format="yyyy-MM-dd HH:mm:ss"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="开始日期">
                            </el-date-picker>
                        </v-flex>
                        <v-flex class="md12">
                            <el-date-picker
                                    v-model="policy.endTime"
                                    type="datetime"
                                    format="yyyy-MM-dd HH:mm:ss"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="结束日期">
                            </el-date-picker>
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
        name: "policy-form",
        props: {
            oldSku: {
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
                policy: {
                    skuId: '',
                    title: '',
                    price: '', // 用户名称
                    quantity: '',// 用户积分
                    beginTime: '',// 用户积分
                    endTime: '',// 用户积分
                }
            }
        },
        methods: {
            submit() {
                // 表单校验
                if (this.$refs.myPolicyForm.validate()) {
                    this.policy.skuId = this.oldSku.id
                    this.policy.title = this.oldSku.title
                    this.$http({
                        method: this.isEdit ? 'put' : 'post',
                        url: '/seckill/policy',
                        data: this.policy
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
                this.$refs.myPolicyForm.reset();
            },
            close() {
                this.$emit("close");
            },
            formatPrice(val) {
                if (typeof val === 'string') {
                    if (isNaN(val)) {
                        return null;
                    }
                    // 价格转为整数
                    const index = val.lastIndexOf(".");
                    let p = "";
                    if (index < 0) {
                        // 无小数
                        p = val + "00";
                    } else if (index === p.length - 2) {
                        // 1位小数
                        p = val.replace("\.", "") + "0";
                    } else {
                        // 2位小数
                        p = val.replace("\.", "")
                    }
                    return parseInt(p);
                } else if (typeof val === 'number') {
                    if (val == null) {
                        return null;
                    }
                    const s = val + '';
                    if (s.length === 0) {
                        return "0.00";
                    }
                    if (s.length === 1) {
                        return "0.0" + val;
                    }
                    if (s.length === 2) {
                        return "0." + val;
                    }
                    const i = s.indexOf(".");
                    if (i < 0) {
                        return s.substring(0, s.length - 2) + "." + s.substring(s.length - 2)
                    }
                    const num = s.substring(0, i) + s.substring(i + 1);
                    if (i === 1) {
                        // 1位整数
                        return "0.0" + num;
                    }
                    if (i === 2) {
                        return "0." + num;
                    }
                    if (i > 2) {
                        return num.substring(0, i - 2) + "." + num.substring(i - 2)
                    }
                }
            }
        }
    }
</script>

<style scoped>

</style>
