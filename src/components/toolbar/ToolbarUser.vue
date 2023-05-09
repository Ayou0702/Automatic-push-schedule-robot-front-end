<script lang="ts" setup>
import StatusMenu from "./StatusMenu.vue";
import {useAuthStore} from "@/stores/authStore";
import {useRouter} from "vue-router";
import {Icon} from "@iconify/vue";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import {useTheme} from "vuetify";
import axios from "axios";
import {onBeforeMount, onMounted, ref, Ref} from "vue";
import {ElMessage} from "element-plus";
import i18n from "@/plugins/i18n";
import {elMessage, setThemeColor} from "@/utils/globalFunctions";

const router = useRouter();
const userId = "1";
let userData = reactive({})
const authStore = useAuthStore();
const userAvatar = ref('')
const handleLogout = (event: MouseEvent | KeyboardEvent) => {
  authStore.logout();
  console.log("---");
  console.log(router);
};
let headImage = ref<string | null>(null);

interface Color {
  colorId: number;
  colorName: string;
  colorValue: string;
}

function setDarkTheme() {
  customizeTheme.setDarkTheme()
  if (customizeTheme.darkTheme) {
    console.log("dark theme");
    setThemeColor("#705cf6")

  } else {
    setThemeColor(theme.themes.value.light.colors.primary)
  }
}

interface UserData {
  userId: number,
  userName: string,
  userEmail: string,
  userAvatar: Uint8Array
}

onBeforeMount(() => {

  axios.post('http://localhost:8089/queryUserDataByUserId', {
    "userId": userId
  })
       .then(response => {

         response.data.data.userAvatar = 'data:image/jpeg;base64,' + response.data.data.userAvatar

         userAvatar.value = response.data.data.userAvatar

         userData = response.data.data

         console.log(userData)

       })
       .catch(error => {
         elMessage(error.message, "error")
       });
});

const primaryColors = ref([
  {
    colorId: 1,
    colorName: "grey",
    colorValue: "#344767",
  },
  {
    colorId: 2,
    colorName: "info",
    colorValue: "#17C1E8",
  },
  {
    colorId: 3,
    colorName: "success",
    colorValue: "#82D616",
  },
  {
    colorId: 4,
    colorName: "warning",
    colorValue: "#F2825A",
  },
  {
    colorId: 5,
    colorName: "error",
    colorValue: "#EA0606",
  },
]);

const navs = [
  {
    title: "Profile Details",
    key: "menu.profileDetails",
    link: "/profile",
    icon: "mdi-account-box-outline",
  },
  {
    title: "Plans and Billing",
    key: "menu.plansAndBilling",
    link: "/plans-and-billing",
    icon: "mdi-credit-card-outline",
  },
  {
    title: "Team",
    key: "menu.team",
    link: "/team",
    icon: "mdi-account-group-outline",
  },
  {
    title: "API Dashboard",
    key: "menu.apiDashboard",
    link: "/api-dashboard",
    icon: "mdi-monitor-dashboard",
  },
  {
    title: "Integrations",
    key: "menu.integrations",
    link: "/integrations",
    icon: "mdi-puzzle-outline",
  },
  {
    title: "Ask the Community",
    key: "menu.askCommunity",
    link: "/ask-the-community",
    icon: "mdi-help-circle-outline",
  },
];

interface Color {
  colorId: number;
  colorName: string;
  colorValue: string;
}

const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();
const currentColor = ref<Color>({
  colorId: 1,
  colorName: "grey",
  colorValue: "#344767",
});
watch(currentColor, (newVal) => {
  if (customizeTheme.darkTheme) {
    tips();
  } else {
    customizeTheme.setPrimaryColor(newVal);
    theme.themes.value.light.colors.primary = newVal.colorValue;
    // theme.themes.value.dark.colors.primary = newVal.colorValue;
    setThemeColor(newVal.colorValue)
  }
});

function tips() {
  ElMessage({
    // @ts-ignore   在类型实例化时此处可能导致造成内存溢出或无限递归
    message: i18n.global.t("toolbar.toolbarUser.tips"),
    grouping: true,
    type: 'error',
  })
}
</script>

<template>
  <v-menu
    :close-on-content-click="false"
    location="bottom right"
    transition="slide-y-transition"
  >
    <!-- ---------------------------------------------- -->
    <!-- Activator Btn -->
    <!-- ---------------------------------------------- -->
    <template v-slot:activator="{ props }">
      <v-btn class="mx-2" icon v-bind="props">
        <v-badge bordered color="success" content="2" dot>
          <v-avatar size="50">
            <el-image :src=userAvatar />
          </v-avatar>
        </v-badge>
      </v-btn>
    </template>

    <v-card max-width="300">
      <v-list density="compact" lines="three">
        <!-- ---------------------------------------------- -->
        <!-- Profile Area -->
        <!-- ---------------------------------------------- -->
        <v-list-item to="/profile">
          <template v-slot:prepend>
            <v-avatar size="50">
              <el-image :src="userAvatar"></el-image>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-primary">
            YANG J.K.
            <StatusMenu/>
          </v-list-item-title>
          <v-list-item-subtitle>
            yjkbako@gmail.com
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <v-divider/>
      <!-- ---------------------------------------------- -->
      <!-- Menu Area -->
      <!-- ---------------------------------------------- -->
      <v-list :lines="false" density="compact" elevation="0" variant="flat">
        <v-list-item
          v-for="(nav, i) in navs"
          :key="i"
          :to="nav.link"
          color="primary"
          density="compact"
          link
        >
          <template v-slot:prepend>
            <v-avatar size="30">
              <v-icon>{{ nav.icon }}</v-icon>
            </v-avatar>
          </template>

          <div>
            <v-list-item-subtitle class="text-body-2">{{
                nav.title
              }}
            </v-list-item-subtitle>
          </div>
        </v-list-item>
        <v-list-item
          color="primary"
          density="compact"
          link
          @click="handleLogout($event)"
        >
          <template v-slot:prepend>
            <v-avatar size="30">
              <v-icon>mdi-logout</v-icon>
            </v-avatar>
          </template>

          <div>
            <v-list-item-subtitle class="text-body-2">
              Logout
            </v-list-item-subtitle>
          </div>
        </v-list-item>
      </v-list>
      <v-divider/>

      <!--主题-->
      <v-list :lines="false" density="compact" elevation="0" variant="flat">
        <v-list-item color="primary">
          <div class="primary-color-area">
            <div v-if="customizeTheme.darkTheme" class="px-3" style="padding-top: 5px">
              <v-btn
                class="text-white"
                color="grey-darken-4"
                icon
                @click="setDarkTheme"
              >
                <Icon icon="line-md:moon-filled-loop" width="30"/>
              </v-btn>
              <span class="ml-5">{{ $t("toolbar.toolbarUser.darkTheme") }}</span>
            </div>
            <div v-else class="px-3" style="padding-top: 5px">
              <v-btn
                class="text-red"
                color="white"
                icon
                @click="setDarkTheme"
              >
                <Icon
                  icon="line-md:moon-filled-alt-to-sunny-filled-loop-transition"
                  width="30"
                />
              </v-btn>
              <span class="ml-5">{{ $t("toolbar.toolbarUser.lightTheme") }}</span>
            </div>
            <v-item-group
              v-model="currentColor"
              :prop="customizeTheme.darkTheme"
              class="mt-3"
              mandatory
              selected-class="elevation-12"
            >
              <div style="margin-top: 5px;margin-bottom: 6px">
                <v-item
                  v-for="color in primaryColors"
                  :key="color.colorId"
                  v-slot="{ isSelected, toggle,props}"
                  :value="color"
                >
                  <v-btn
                    :color="color.colorValue"
                    class="text-white mr-1"
                    icon
                    size="30"
                    @click="customizeTheme.darkTheme?tips():toggle()"
                  >
                    <Icon v-if="customizeTheme.darkTheme?null:isSelected" icon="line-md:confirm" width="22"/>
                  </v-btn>
                </v-item>
              </div>
            </v-item-group>
          </div>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<style lang="scss" scoped>
.mt-3 {
  display: flex;
  justify-content: center;
}
</style>
