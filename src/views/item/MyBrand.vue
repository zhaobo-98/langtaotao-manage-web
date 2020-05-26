<template>
    <v-card>
        <v-card-title>
            <v-flex xs3>
                <v-btn color="primary" small>新增</v-btn>
            </v-flex>
            <!--空间隔离组件-->
            <v-spacer/>
            <!--搜索框，与search属性关联-->
            <v-flex xs3>
                <v-text-field label="输入关键字搜索" v-model="keyword" append-icon="search" hide-details/>
            </v-flex>
        </v-card-title>
        <!-- 分割线 -->
        <v-divider/>
        <v-data-table
                :headers="headers"
                :items="brands"
                :pagination.sync="pagination"
                :total-items="totalBrands"
                :loading="loading"
                class="elevation-1"
        >
            <template v-slot:items="props">
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center"><img :src="props.item.image"></td>
                <td class="text-xs-center">{{ props.item.letter }}</td>
                <td class="justify-center layout">
                    <v-btn flat icon color="cyan">
                        <v-icon>edit</v-icon>
                    </v-btn>
                    <v-btn flat icon color="red">
                        <v-icon>delete</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
    export default {
        data() {
            return {
                totalBrands: 0,
                brands: [],
                loading: false,
                pagination: {},
                keyword: "",
                headers: [
                    {text: '品牌Id', align: 'center', value: 'id'},
                    {text: '品牌名称', align: 'center', sortable: false, value: 'name'},
                    {text: 'LOGO', align: 'center', sortable: false, value: 'image'},
                    {text: '首字母', align: 'center', value: 'letter'},
                    {text: '操作', align: 'center', sortable: false, value: 'id'}
                ]
            }
        },
        created() {
            this.getBrands();
        },
        methods: {
            getBrands() {
                //开启进度条
                this.loading = true;
                this.$http.get("/item/brand/page", {
                    params:{
                        key: this.keyword,
                        page: this.pagination.page,
                        rows: this.pagination.rowsPerPage,
                        sortBy: this.pagination.sortBy,
                        desc: this.pagination.descending
                    }
                }).then(resp => {
                    this.brands = resp.data.items;
                    this.totalBrands = resp.data.total;
                    //关闭进度条
                    this.loading = false;
                });
            }
        },
        watch: {
            keyword() {
                this.getBrands();
            },
            pagination: {
                deep: true,
                handler() {
                    this.getBrands();
                }
            }
        }
    }
</script>

<style scoped>

</style>