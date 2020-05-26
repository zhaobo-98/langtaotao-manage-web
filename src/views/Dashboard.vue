<template>
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex xs10 md6>
                <v-card>
                    <v-card-text class="px2">
                        <div ref="sale" style="width: 100%;height:350px"></div>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs10 md6>
                <v-card>
                    <v-card-text class="px2">
                        <div ref="pie" style="width: 100%;height:350px"></div>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    // 引入 ECharts 主模块
    import Cookies from "js-cookie";

    var echarts = require('echarts/lib/echarts');
    require('echarts/lib/chart/bar');
    require('echarts/lib/chart/pie');

    export default {
        name: "dashboard",
        data() {
            return {
                categorys: [],
                nums: [],
                fan: []
            }
        },
        methods: {
            getBarData() {
                this.$http.get("item/dashboard/bar").then(resp => {
                    this.categorys = resp.data.category;
                    this.nums = resp.data.num;
                    this.initEChartsBan();
                })
            },
            getFanData() {
                this.$http.get("order/fan").then(resp => {
                    this.fan = resp.data;
                    this.initEChartsFan();
                })
            },
            isLogin() {
                this.$http.get("/auth/verify").then(resp => {
                    this.user = resp.data;
                    this.getBarData();
                    this.getFanData();
                }).catch(error => {
                    // 去登录
                    this.gotoLogin();
                })
            },
            gotoLogin() {
                this.$router.push("/login");
            },
            logout() {
                this.$message.confirm("您确定要退出登录吗？")
                    .then(() => {
                        Cookies.remove("LTT_TOKEN", {
                            path: "/",
                            domain: "manage.langtaotao.com"
                        });
                        window.location = 'http://manage.langtaotao.com'
                    })
            },
            initEChartsFan() {
                const pie = echarts.init(this.$refs.pie);

                pie.setOption({
                    roseType: 'angle',
                    title: {
                        text: '访问来源'
                    },
                    series: [
                        {
                            name: '访问来源',
                            type: 'pie',
                            radius: '55%',
                            data: this.fan
                        }
                    ],
                    itemStyle: {
                        emphasis: {
                            // 阴影的大小
                            shadowBlur: 200,
                            // 阴影水平方向上的偏移
                            shadowOffsetX: 0,
                            // 阴影垂直方向上的偏移
                            shadowOffsetY: 0,
                            // 阴影颜色
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                })
            },
            initEChartsBan() {
                var sale = echarts.init(this.$refs.sale);
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '销售统计'
                    },
                    tooltip: {},
                    legend: {
                        data: ['销量']
                    },
                    xAxis: {
                        data: this.categorys
                    },
                    yAxis: {},
                    series: [{
                        name: '销量',
                        type: 'bar',
                        data: this.nums
                    }]
                };
                // 使用刚指定的配置项和数据显示图表。
                sale.setOption(option);
            },
        },
        created() {
            this.isLogin();
        },
    }
</script>

<style scoped>

</style>
