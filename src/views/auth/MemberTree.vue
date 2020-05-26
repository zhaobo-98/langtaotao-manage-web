<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="'角色授权'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-checkbox
                    v-model="selectedRole"
                    v-for="(role, index) in oldRole"
                    :key="index"
                    :label="role.name"
                    :value="role.roleId"
            ></v-checkbox>
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
        name: "member-tree",
        props: {
            oldMember: {
                type: Object
            },
            oldRole: {
                type: Array
            },
            oldSelectedRole: {
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
                selectedRole: []
            }
        },
        methods: {
            submit() {
                if(this.oldMember.id && this.selectedRole.length !== 0) {
                    this.$http.put("/user/member/setRole", {
                        memberId: this.oldMember.id,
                        roleIds: this.selectedRole
                    }).then(resp => {
                        // 关闭窗口
                        this.$emit("close");
                        this.$message.success("设置角色成功！");
                    }).catch(() => {
                        this.$message.error("设置角色失败！");
                    });
                } else {
                    this.$message.error("您还没有选择角色！");
                }
                console.log(this.selectedRole);
            },
            clear() {
                this.selectedRole = null
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldSelectedRole: {
                handler(newName, oldName) {
                    this.selectedRole = newName;
                    this.$emit('update:oldSelectedRole', newName);
                },
                immediate: true
            }
        }
    }
</script>

<style scoped>

</style>
