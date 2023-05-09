<script lang="ts" setup>
import CopyLabel from "@/components/common/CopyLabel.vue";
import {onBeforeMount, ref, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {elMessage} from "@/utils/globalFunctions";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import {useTheme} from "vuetify";

const loading = ref(true);
// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

let curriculumData: Ref<Array<any>> = ref([])
let teacherData: Ref<Array<any>> = ref([])
let courseData: Ref<Array<any>> = ref([])
const search = ref('')

// 通过Vue的生命周期函数获取数据库中的线性课表数据，并写入一份到本地缓存，用以比较线性课表信息差异
onBeforeMount(() => {
  getCurriculumData().then(response => {
    if (response.data.code === 200) {
      elMessage(response.data.message, "success")
    }
  })

})


function getCurriculumData(): Promise<AxiosResponse<any>> {
  return axios.get('http://localhost:8089/queryNowCurriculumData')
              .then(response => {

                if (response.data.code !== 200) {
                  elMessage(response.data.message, "error");
                  return Promise.reject({response: {data: {code: -1, message: response.data.message}}});
                }

                curriculumData.value = response.data.data.curriculumDataList;
                courseData.value = response.data.data.courseDataList;
                teacherData.value = response.data.data.teacherDataList;

                teacherData.value.map(data => data.teacherAvatar = 'data:image/jpeg;base64,' + data.teacherAvatar)
                courseData.value.map(data => data.courseAvatar = 'data:image/jpeg;base64,' + data.courseAvatar)

                // localStorage.setItem("curriculumData", JSON.stringify(curriculumData.value))
                // localStorage.setItem("teacherData", JSON.stringify(teacherData.value))
                // localStorage.setItem("courseData", JSON.stringify(courseData.value))

                return response;

              })
              .catch(error => {
                elMessage(error.message, "error")
                // 失败情况下返回约定错误格式（例如 code 字段为 -1）
                return Promise.reject({response: {data: {code: -1, message: error.message}}});
              });
}

const headers = [
  {text: "节次 Id", align: "start", value: "id"},
  {text: "课程名称", value: "user"},
  {text: "上课地点", value: "date"},
  {text: "周次", value: "company"},
  {text: "星期", value: "amount"},
  {text: "节次", value: "status"},
  {text: "专业", value: "status"},
  {text: "", sortable: false, align: "right", value: "action"},
];
const items = [
  {
    id: "2837",
    user: {
      name: "企业级应用开发",
      email: "冯天佑",
      avatar: "http://localhost:8089/image/prefersmin.jpg",
    },
    date: "2020-05-10",
    company: "BlobHill",
    amount: 52877,
    status: "PAID",
  },
  {
    id: "2838",
    user: {
      name: "Greg Cool J",
      email: "cool@caprimooner.com",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    date: "2020-05-11",
    company: "Caprimooner",
    amount: 2123,
    status: "PENDING",
  },
  {
    id: "2839",
    user: {
      name: "Samantha Bush",
      email: "bush@catloveisstilllove.com",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    date: "2020-05-11",
    company: "CatLovers",
    amount: 12313,
    status: "PENDING",
  },
  {
    id: "2840",
    user: {
      name: "Ben Howard",
      email: "ben@indiecoolers.com",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    date: "2020-05-12",
    company: "IndieCoolers",
    amount: 9873,
    status: "PAID",
  },
  {
    id: "2841",
    user: {
      name: "Jack Candy",
      email: "jack@candylooove.com",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    date: "2020-05-13",
    company: "CandyLooove",
    amount: 29573,
    status: "PAID",
  },
];


function updateCurriculumData(curriculumId) {

}

function deleteCurriculumData(curriculumId) {

}

// tableStyle和inputStyle和switchStyle使用computed适应深色模式和主题色，并将其动态绑定到el-table和el-input和el-switch-input上
const tableStyle = computed(() => {
  return {
    "--el-table-tr-bg-color": customizeTheme.darkTheme ? 'null' : 'null',
    "--el-table-bg-color": customizeTheme.darkTheme ? 'null' : 'null',
    "--el-table-header-bg-color": customizeTheme.darkTheme ? 'null' : 'null',
    "--el-table-text-color": customizeTheme.darkTheme ? '#ffffff' : 'null',
    "--el-table-row-hover-bg-color": customizeTheme.darkTheme ? '#39475e' : '#f5f7fa',
    "--el-table-border-color": customizeTheme.darkTheme ? '#253458' : '#ebeef5',
  }
})

const filterScheduleData = computed(() => {
  return curriculumData.value.filter(
    (data) => {
      return !search.value ||
        data.courseName.toLowerCase().includes(search.value.toLowerCase())
    }
  )
})

const tableRowClassName = ({ row, rowIndex, }) => {
  if ((row.curriculumWeek + row.curriculumPeriod) % 2 === 1) {
    return 'odd'
  } else {
    return 'even'
  }
}
</script>
<template>
  <v-card-title class="font-weight-bold">
    <span>{{ $t("menu.data.scheduleData.scheduleData") }}</span>
    <v-spacer></v-spacer>
    <div class="w-25">
      <v-text-field
        v-model="search"
        :placeholder="($t('menu.data.scheduleData.search'))"
        clearable
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        single-line
        variant="solo"
      ></v-text-field>
    </div>
  </v-card-title>
  <v-divider/>
  <v-card-text class="table-container">
    <!--通过:style动态绑定表格样式-->
    <el-table
      :row-class-name="tableRowClassName"
      :data="filterScheduleData"
      :style="tableStyle"
      height="610px"
    >
      <el-table-column :label="($t('menu.data.curriculumData.curriculumId'))" width="150px">
        <template v-slot="{ row }">
          <CopyLabel :text="'#'+row.curriculumId"/>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.courseName'))" width="550px">
        <template v-slot="{ row }">
          <div class="d-flex align-center py-2" style="margin-left: 50px">
            <v-avatar size="55" class="elevation-1 grey lighten-3">
              <img :src="courseData.find(item => item.courseId === row.courseId).courseAvatar"  alt="头像"/>
            </v-avatar>
            <div class="ml-1" style="padding-left: 10px;text-align: left">
              <div class="font-weight-bold">{{ courseData.find(item => item.courseId === row.courseId).courseName }}</div>
              <div class="text-caption">
                <copy-label :text="teacherData.find(item => item.teacherId === row.teacherId).teacherName" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.teacherName'))">
        <template v-slot="{ row }">
          <CopyLabel :text="teacherData.find(item => item.teacherId === row.teacherId).teacherName"/>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.curriculumPeriod'))" width="100px">
        <template v-slot="{ row }">
          <span> {{ row.curriculumPeriod }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.curriculumWeek'))" width="100px">
        <template v-slot="{ row }">
          <span> {{ row.curriculumWeek }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.curriculumSection'))" width="100px">
        <template v-slot="{ row }">
          <span> {{ row.curriculumSection }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.curriculumSpecialized'))" width="200px">
        <template v-slot="{ row }">

          <div v-if="courseData.find(item => item.courseId === row.courseId).courseSpecialized">
            <v-icon color="success" size="large">mdi-circle-medium</v-icon>
            <span>专业课</span>
          </div>
          <div v-else>
            <v-icon color="warning" size="large">mdi-circle-medium</v-icon>
            <span>公共课</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="($t('menu.data.curriculumData.edit'))" width="150px">
        <template v-slot="{ row }">
          <div
            style="display: flex;flex-direction: row;justify-content: center;align-items: center;gap: 5px;margin-left: 10px">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="updateCurriculumData(row.curriculumId)"
            >
            </v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="deleteCurriculumData(row.curriculumId)"
            >
            </v-btn>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </v-card-text>
</template>

<style lang="scss" scoped>

:deep(.cell) {
  text-align: center
}

:deep(.el-table tr) {
  height: 50px;
}

:deep(.el-upload-list) {
  margin-top: 0;
}

:deep(.el-upload-list) {
  display: none;
}

:deep(.el-table .odd) {
  --el-table-tr-bg-color: rgba(172, 172, 172, 0.15);
  --el-table-row-hover-bg-color: rgba(172, 172, 172, 0.15);
}
:deep(.el-table .even) {
  --el-table-tr-bg-color: rgba(172, 172, 172, 0.35);
  --el-table-row-hover-bg-color: rgba(172, 172, 172, 0.35);
}


</style>
