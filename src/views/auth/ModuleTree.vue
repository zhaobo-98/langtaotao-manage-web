<template>
    <v-card>
        <v-card-title>
            <span class="headline" v-text="'角色授权'"></span>
        </v-card-title>
        <v-divider/>
        <v-card-text class="px-3">
            <v-treeview
                    v-model="selectedModule"
                    selectable
                    selected-color="red"
                    :items="oldModule"
            ></v-treeview>
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
        name: "module-form",
        props: {
            oldRole: {
                type: Object
            },
            oldModule: {
                type: Array
            },
            oldSelected: {
                type: Array
            },
        },
        data() {
            return {
                selectedModule: this.oldSelected
            }
        },
        methods: {
            submit() {
                console.log(this.selectedModule)
                console.log(typeof this.selectedModule)
            },
            clear() {
            },
            close() {
                this.$emit("close");
            }
        },
        watch: {
            oldSelected: {
                handler(newName, oldName) {
                    this.selectedModule = newName;
                    this.$emit('update:oldSelected', newName);
                },
                immediate: true
            }
        }
    }
</script>

<style scoped>

</style>
