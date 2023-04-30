// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";
import vuetify from "./plugins/vuetify";
import MasonryWall from "@yeger/vue-masonry-wall";
import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueApexCharts from "vue3-apexcharts";
import piniaPersist from "pinia-plugin-persist";
import PerfectScrollbar from "vue3-perfect-scrollbar";
import "@/styles/main.scss";
import router from "./router";
import i18n from "./plugins/i18n";
import "vue3-lottie/dist/style.css";
import Vue3Lottie from "vue3-lottie";
import ElementPlus from 'element-plus'
import 'dayjs/locale/zh-cn' //ElementPlus中文
import locale from 'element-plus/lib/locale/lang/zh-cn' //ElementPlus中文
import globalFunctionPlugin from './plugins/globalFunctionPlugin'
import "./styles/elementPlusTheme.scss";

const pinia = createPinia();
pinia.use(piniaPersist);
const app = createApp(App);

app.use(globalFunctionPlugin);
app.use(ElementPlus, {locale});
app.use(router);
app.use(PerfectScrollbar);
app.use(MasonryWall);
app.use(VueVirtualScroller);
app.use(VueApexCharts);
app.use(pinia);
app.use(i18n);
app.use(Vue3Lottie, { name: "LottieAnimation" });
app.use(vuetify);

app.mount("#app");

