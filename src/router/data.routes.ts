// 数据路由配置

export default [
  {
    path: "/data/course-data",
    component: () => import("@/views/data/CourseDataPage.vue"),
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "Data",
      title: "课程数据",
    },
  },
  {
    path: "/data/teacher-data",
    component: () => import("@/views/data/TeacherDataPage.vue"),
    meta: {
      requiresAuth: true,
      layout: "ui",
      category: "Data",
      title: "教师数据",
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
