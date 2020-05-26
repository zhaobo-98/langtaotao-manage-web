<template>
    <!--  <router-view></router-view>-->
    <router-view v-if="isRouterAlive"/>
</template>

<script>
    export default {
        name: 'App',
        provide: function () {
            return {
                reload: this.reload
            }
        },
        data() {
            return {
                isRouterAlive: true
            }
        },
        methods: {
            reload: function () {
                this.isRouterAlive = false;
                this.$nextTick(function () {
                    this.isRouterAlive = true
                })
            }
        }
    }
</script>
