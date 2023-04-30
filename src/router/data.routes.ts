// 数据路由配置

export default [
  {
    path: "/data/course-info-data",
    component: () => import("@/views/data/CourseInfoDataPage.vue"),
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "Data",
      title: "课表数据",
    },
  },
  {
    path: "/data/enterprise-data",
    component: () => import("@/views/data/EnterpriseDataPage.vue"),
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "Data",
      title: "配置数据",
    },
  },
];
