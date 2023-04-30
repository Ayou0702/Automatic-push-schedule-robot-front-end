<script setup lang="ts">
import { useDisplay } from "vuetify";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import ToolbarLanguage from "@/components/toolbar/ToolbarLanguage.vue";
import ToolbarUser from "./ToolbarUser.vue";
const { mdAndUp } = useDisplay();
const customizeTheme = useCustomizeThemeStore();
const showMobileSearch = ref(false);
</script>

<template>
  <v-app-bar :density="mdAndUp ? 'default' : 'compact'">
    <div class="d-flex flex-fill align-center" v-if="showMobileSearch">
      <v-text-field
        color="primary"
        variant="solo"
        prepend-inner-icon="mdi-magnify"
        append-inner-icon="mdi-close"
        @click:append-inner="showMobileSearch = false"
        hide-details
        placeholder="Search"
      ></v-text-field>
    </div>
    <div v-else class="px-2 d-flex align-center justify-space-between w-100">
      <v-app-bar-nav-icon
        @click="customizeTheme.mainSidebar = !customizeTheme.mainSidebar"
      ></v-app-bar-nav-icon>

      <div>
        <ToolbarLanguage />
        <ToolbarUser />
      </div>
    </div>
  </v-app-bar>
</template>

<style scoped lang="scss"></style>
