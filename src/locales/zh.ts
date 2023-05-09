export default {
  toolbar: {
    toolbarUser: {
      darkTheme: "深色模式",
      lightTheme: "浅色模式",
      tips: "当启用深色模式时，不允许设置主题色",
    },
  },
  utils: {
    clipboardUtils: {
      copySuccess: '已复制到粘贴板',
      copyError: '复制失败',
    }
  },
  menu: {
    dashboard: "仪表板",
    data: {
      curriculumData: {
        curriculumData: "课程推送队列",
        search: "搜索课程名称",
        curriculumId: "序列ID",
        courseName: "课程名称",
        teacherName: "教师名称",
        curriculumPeriod:"课程周期",
        curriculumWeek:"课程星期",
        curriculumSection:"课程节次",
        curriculumSpecialized: "专业",
        edit:"编辑",
      },
      scheduleData: {
        scheduleData: "课表数据",
        search: "搜索课表名称",
        scheduleId: "课表ID",
        courseName: "课程名称",
        teacherName: "教师名称",
        schedulePeriod:"课程周期",
        scheduleWeek:"课程星期",
        scheduleSection:"课程节次"
      },
      courseData: {
        courseData: "课程数据",
        search: "搜索课程名称",
        courseName: "课程名称",
        courseVenue: "上课地点",
        courseId: "课程ID",
        courseAvatar: "课程头像",
        courseSpecialized: "专业",
      },
      teacherData: {
        teacherData: "教师数据",
        search: "搜索教师名称",
        teacherId: "教师ID",
        teacherName: "教师名称",
        teacherPhone: "联系方式",
        teacherInstitute: "所在学院",
        teacherAvatar: "教师头像",
        teacherSpecialized: "专业",
      },
      enterpriseData: {
        enterpriseData: "配置数据",
        search: "搜索配置项名称",
        dataName: "配置名称",
        dataValue: "配置数据",
        dataAnnotation: "配置注释",
      },
      revocation: "取消修改",
      addCourse: "新增课程",
      addTeacher: "新增教师",
      delete: "删除所选行",
      confirm: "确认修改",
      quitEdit: "退出编辑模式",
      edit: "进入编辑模式",
      yes: "是",
      no: "否",
    }
  },
  // Vuetify 组件内部翻译
  $vuetify: {
    badge: "徽章",
    close: "关",
    dataIterator: {
      noResultsText: "未找到匹配的记录",
      loadingText: "正在载入项目...",
    },
    input: {
      clear: "清除",
    }
  },
}
