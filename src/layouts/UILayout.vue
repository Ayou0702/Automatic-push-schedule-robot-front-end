<script lang="ts" setup>
import Breadcrumb from "@/components/Breadcrumb.vue";
import PageTitle from "@/components/PageTitle.vue";
import MainSidevar from "@/components/navigation/MainSidebar.vue";
import MainAppbar from "@/components/toolbar/MainAppbar.vue";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";

const customizeTheme = useCustomizeThemeStore();

</script>

<template>
    <div>
        <MainSidevar/>
        <MainAppbar/>
        <v-main
                v-touch="{
        right: () => (customizeTheme.mainSidebar = true),
      }"
                class="main-bg"
        >
            <v-container class="pa-0 pa-sm-4" fluid>
                <div class="pa-4 pa-sm-0">
                    <PageTitle></PageTitle>
                    <Breadcrumb></Breadcrumb>
                </div>
                <slot></slot>
            </v-container>
        </v-main>
    </div>
</template>

<style scoped>
.scrollnav {
    height: calc(100vh - 326px);
}

.main-bg {
    min-height: calc(100vh - 64px);
}
</style>
