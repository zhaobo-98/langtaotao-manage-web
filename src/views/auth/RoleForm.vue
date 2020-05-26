<template>
  <v-card>
    <v-card-title>
      <span class="headline" v-text="isEdit ? '修改角色' : '新增角色'"></span>
    </v-card-title>
    <v-divider/>
    <v-card-text class="px-3">
      <v-form v-model="valid" ref="myRoleForm">
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex class="md6">
              <v-text-field v-model="role.name" label="角色名称" required :rules="nameRules"/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn depressed  small @click="submit">提交</v-btn>
      <v-btn depressed small @click="clear">重置</v-btn>
      <v-btn depressed  small @click="close">关闭</v-btn>
    </v-card-actions>
  </v-card>

</template>

<script>
  export default {
    name: "role-form",
    props: {
      oldRole: {
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
        role: {
          name: '' // 品牌名称
        },
        nameRules: [
          v => !!v || "角色名称不能为空",
          v => /^.{2,}$/.test(v) || "角色名称至少2位"
        ]
      }
    },
    methods: {
      submit() {
        // 表单校验
        if (this.$refs.myRoleForm.validate()) {
          // 定义一个请求参数对象，通过解构表达式来获取brand中的属性
          // 数据库中只要保存分类的id即可，因此我们对categories的值进行处理,只保留id，并转为字符串
          // 将数据提交到后台
          // this.$http.post('/item/brand', this.$qs.stringify(params))
          this.$http({
            method: this.isEdit ? 'put' : 'post',
            url: '/user/role',
            data: this.role
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
        this.$refs.myRoleForm.reset();
        // 需要手动清空商品分类
        this.categories = [];
      },
      close(){
        this.$emit("close");
      }
    },
    watch: {
      oldRole: {// 监控oldBrand的变化
        handler(val) {
          if (val) {
            // 注意不要直接复制，否则这边的修改会影响到父组件的数据，copy属性即可
            this.role = Object.deepCopy(val)
          } else {
            // 为空，初始化brand
            this.role = {
              name: '',
              letter: '',
              image: '',
              categories: [],
            };
            this.$refs.myRoleForm.reset();
          }
        },
        deep: true
      }
    }
  }
</script>

<style scoped>

</style>
