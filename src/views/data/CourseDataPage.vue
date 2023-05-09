<script lang="ts" setup>
import {onBeforeMount, Ref, ref} from 'vue'
import axios, {AxiosResponse} from "axios";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import CopyLabel from "@/components/common/CopyLabel.vue";
import {useTheme} from "vuetify";
import {elMessage} from "@/utils/globalFunctions";
import { ElMessageBox } from 'element-plus'

let editing = ref(false)
let courseData: Ref<Array<any>> = ref([])
let addCourseData: Ref<Array<any>> = ref([])
let deleteCourseData: Ref<Array<any>> = ref([])
let courseAvatarList: Ref<Array<any>> = ref([])

// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

const search = ref('')
const multipleSelection = ref<CourseData[]>([]);
const diffCourse: Ref<Array<any>> = ref([]);

// 通过Vue的生命周期函数获取数据库中的课程数据，并写入一份到本地缓存，用以比较课程信息差异
onBeforeMount(() => {
  getCourseData().then(response => {
    if (response.data.code === 200) {
      elMessage(response.data.message, "success")
    }
  })
})

function getCourseData(): Promise<AxiosResponse<any>>  {
  return axios.get('http://localhost:8089/getCourseData')
              .then(response => {

                if (response.data.code !== 200) {
                  elMessage(response.data.message, "error");
                  return Promise.reject({response: {data: {code: -1, message: response.data.message}}});
                }

                response.data.data.map(data => data.courseAvatar = 'data:image/jpeg;base64,' + data.courseAvatar)

                courseData.value = response.data.data;
                localStorage.setItem("courseData", JSON.stringify(courseData.value, (key, value) => {
                  if (key === 'courseAvatar') {
                    return undefined;
                  }
                  return value;
                }));

                courseAvatarList.value = response.data.data.map(item => item.courseAvatar);

                return response;

              })
              .catch(error => {
                elMessage(error.message, "error");
                // 失败情况下返回约定错误格式（例如 code 字段为 -1
                return Promise.reject({response: {data: {code: -1, message: error.message}}});
              });
}

function noDiff() {
  if (deleteCourseData.value.length == 0 && addCourseData.value.length == 0 && diffCourse.value.length == 0) {
    elMessage("未修改数据", "warning")
    return true;
  }
  return false;
}

// 使用computed对课程信息进行过滤
const filterCourseData = computed(() => {
  return [...courseData.value, ...addCourseData.value].filter(
    (data) => {
      return !search.value ||
        data.courseName.toLowerCase().includes(search.value.toLowerCase())
    }
  )
})

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

const inputStyle = computed(() => {
  return {
    "width": "350px",
    "--el-input-bg-color": customizeTheme.darkTheme ? '#1c2742' : '#ffffff',
    "--el-input-text-color": customizeTheme.darkTheme ? '#ffffff' : '#000000',
    "--el-input-border-color": customizeTheme.darkTheme ? '#b4a8ff' : theme.themes.value.light.colors.primary,
  }
})

const switchStyle = computed(() => {
  return {
    "--el-switch-off-color": '#dcdfe6',
  }
})

// 筛选过滤器
const filterTag = (value, row) => {
  return row.courseSpecialized === value
}

// 课程信息的数据类型定义
interface CourseData {
  courseSpecialized: boolean,
  courseId: number,
  courseName: string,
  courseAvatar: Uint8Array,
  courseVenue: string,
}

// 编辑模式开关
function editState() {
  editing.value = !editing.value
}

// 监视被修改的课程信息并将其提取至diffCourse中
function diffSearch() {
  const localCourseDataStr = localStorage.getItem('courseData')?.trim() ?? '[]';
  let localCourseData = JSON.parse(localCourseDataStr);

  // 如果本地的缓存课程数据与内存中的不一致，则直接将内存中的课程数据赋值给diffCourse
  // 但是这种情况基本不会出现

  localCourseData = localCourseData.filter(item => !deleteCourseData.value.includes(item.courseId))


  if (localCourseData.length !== courseData.value.length) {
    diffCourse.value = courseData.value;
    return;
  }

  // 对内存中的课程数据进行遍历，与本地缓存的进行比较
  for (let i = 0; i < courseData.value.length; ++i) {
    const curLocalData = localCourseData[i];
    const curData = courseData.value[i];

    if (!curLocalData && !curData) {
      continue;
    }

    let hasChanged = false;
    const attrsToCheck = ['courseName', 'courseVenue', 'courseSpecialized'];

    // 遍历属性值进行比较
    for (let attr of attrsToCheck) {
      if (curLocalData[attr] !== curData[attr]) {
        hasChanged = true;
        break;
      }
    }

    // 若遍历发现不同，则将内存中的课程信息写入diffCourse中，待确认修改后发送并清空
    if (hasChanged) {
      diffCourse.value.push(curData);
    }
  }
}

function confirmModification() {

  diffSearch();
  if (noDiff()) {
    return;
  }

  // 从删除列表中过滤掉新增课程
  deleteCourseData.value = deleteCourseData.value.filter(data => typeof data !== 'string');
  addCourseData.value.forEach(courseData => {
    courseData.courseId = null;
    courseData.courseAvatar = null;
  })
  diffCourse.value.forEach(courseData => {
    courseData.courseAvatar = null;
  })
  axios.post('http://localhost:8089/modifyCourseData', {
    deleteCourseData: deleteCourseData.value,
    diffCourse: diffCourse.value,
    addCourseData: addCourseData.value
  })
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           // 合并courseData和addCourseData，并重置addCourseData，防止重复执行
           deleteCourseData.value = [];
           diffCourse.value = [];
           courseData.value = [...courseData.value, ...addCourseData.value];
           addCourseData.value = [];

           getCourseData();

         } else if(response.data.code === 901) {

           let message = response.data.message.replace(/\n|\r\n/g, "<br>");
           ElMessageBox.alert(message, response.data.data, {
             confirmButtonText: '了解',
             dangerouslyUseHTMLString: true,
             callback: () => {
               elMessage(response.data.data, "error")
             },
           })

         } else {

           elMessage(response.data.message, "error")

         }
       })
       .catch(error => {
         console.log(error);
       });


}

// 撤回修改
function revocation() {
  diffSearch()
  if (noDiff()) {
    return;
  }
  courseData.value = localStorage.getItem("courseData")?.trim() ? JSON.parse(localStorage.getItem("courseData")!.trim()) : [];
  addCourseData.value = [];
  deleteCourseData.value = [];
  diffCourse.value = [];
}

// 新增课程数据
function addCourse() {
  addCourseData.value.push({
    courseSpecialized: false,
    courseName: '',
    courseVenue: '',
    courseAvatar: 'new',
  })
}

// 删除 内存课程数据 与 新增课程数据 中的对应项，并写入id到 待删除课程数据
function deleteCourse() {

  const deletedCourseIds = multipleSelection.value.map(item => item.courseId);

  if (deletedCourseIds.length === 0) {
    elMessage("没有勾选数据", "warning")
    return;
  }
  courseData.value = courseData.value.filter(item => !deletedCourseIds.includes(item.courseId));
  addCourseData.value = addCourseData.value.filter(item => !deletedCourseIds.includes(item.courseId));
  deleteCourseData.value = deleteCourseData.value.concat(deletedCourseIds);

}

// 多选过滤器
function handleSelectionChange(val: CourseData[]) {
  multipleSelection.value = val;
}

interface Response {
  code: number;
  message: string;
  data: any;
}

function modifyCourseAvatarSuccess(response: Response) {
  if (response.code === 200) {
    elMessage(response.message, "success")

    queryCourseAvatarByTeacherId(response.data)

  } else {
    elMessage(response.message, "error")
  }
}

function queryCourseAvatarByTeacherId(courseId: number) {
  axios.post('http://localhost:8089/queryCourseAvatarByCourseId', {courseId})
       .then(response => {
         if (response.data.code === 200) {
           courseData.value.filter(item => item.courseId == courseId).map(item => {
             item.courseAvatar = 'data:image/jpeg;base64,' + response.data.data.courseAvatar;
           })
         } else {
           elMessage(response.data.message, "error")
         }
       })
}

function deleteCourseAvatar(courseId: number) {
  axios.post('http://localhost:8089/deleteCourseAvatar', {courseId})
       .then(response => {
         if (response.data.code === 200) {
           elMessage(response.data.message, "success")
           courseData.value.filter(item => item.courseId == courseId).map(item => {
             item.courseAvatar = "null";
           })
         } else {
           elMessage(response.data.message, "error")
         }
       })

}
</script>

<template>
  <v-card>
    <v-card-title class="font-weight-bold">
      <span>{{ $t("menu.data.courseData.courseData") }}</span>
      <v-spacer></v-spacer>

      <div class="w-25">
        <v-text-field
          v-model="search"
          :placeholder="($t('menu.data.courseData.search'))"
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
        :data="filterCourseData"
        :default-sort="{ prop: 'courseId', order: 'desc' }"
        :style="tableStyle"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="editing" type="selection" width="55"/>
        <el-table-column :label="($t('menu.data.courseData.courseId'))" prop="courseId" width="150px">
          <template v-slot="{ row }">
            <span v-if="row.courseAvatar === 'new'"> 新增的课程</span>
            <CopyLabel v-else :text="'#'+row.courseId"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.courseData.courseName'))" prop="courseName">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="row.courseName"/>
            <el-input v-if="editing" v-model="row.courseName" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.courseData.courseVenue'))" prop="courseVenue">
          <template v-slot="{ row }">
            <span v-if="!editing">{{ row.courseVenue }}</span>
            <el-input v-if="editing" v-model="row.courseVenue" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.courseData.courseAvatar'))" prop="courseAvatar">
          <template v-slot="{ row }">
            <div style="display: flex;justify-content: center;align-items: center">

              <el-image :preview-src-list=courseAvatarList :src="row.courseAvatar"
                        preview-teleported style="width: 60px;height: 60px;border-radius: 50%">
                <template #error>
                  <el-avatar style="width: 60px;height: 60px;font-size: 20px"> {{
                      row.courseName.charAt(3)
                    }}
                  </el-avatar>
                </template>
              </el-image>
              <div
                v-if="row.courseAvatar != 'new'"
                style="display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 5px;margin-left: 10px">
                <el-upload
                  v-if="editing"
                  :data="{'courseId':row.courseId}"
                  :on-success="modifyCourseAvatarSuccess"
                  action="http://localhost:8089/modifyCourseAvatar">
                  <v-chip
                    class="font-weight-bold"
                    color="blue"
                    size="small"
                  >
                    <v-icon icon="mdi-pencil" start></v-icon>
                    修改
                  </v-chip>
                </el-upload>
                <v-chip
                  v-if="editing"
                  class="font-weight-bold"
                  color="red"
                  size="small"
                  @click="deleteCourseAvatar(row.courseId)"
                >
                  <v-icon icon="mdi-close" start></v-icon>
                  删除
                </v-chip>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :filter-method="filterTag"
          :filters="[
        { text: ($t('menu.data.yes')), value: true },
        { text: ($t('menu.data.no')), value: false },
      ]"
          :label="($t('menu.data.courseData.courseSpecialized'))"
          filter-placement="bottom-end"
          prop="courseSpecialized"
          width="150px"
        >
          <template v-slot="{ row }">

            <v-chip
              v-if="!editing"
              :color="row.courseSpecialized ? 'blue' : 'red'"
              class="font-weight-bold"
              size="small"
            >
              <v-icon
                :icon="
                      row.courseSpecialized
                        ? 'mdi-check-circle-outline'
                        : 'mdi-close-circle-outline'
                    "
                start
              ></v-icon>
              {{
                row.courseSpecialized ? ($t('menu.data.yes')) : ($t('menu.data.no'))
              }}
            </v-chip
            >
            <el-switch v-if="editing" v-model="row.courseSpecialized" :style="switchStyle"/>
          </template>
        </el-table-column>
      </el-table>
    </v-card-text>
  </v-card>
  <v-container>
    <v-btn
      v-if="!editing"
      block
      class="mt-2"
      color="primary"
      size="x-large"
      @click="editState"
    >{{ $t("menu.data.edit") }}
    </v-btn
    >
    <div style="display: flex; justify-content: space-between;">
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="deleteCourse"
      >{{ $t("menu.data.delete") }}
      </v-btn
      >
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="addCourse"
      >{{ $t("menu.data.addCourse") }}
      </v-btn>
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="confirmModification"
      >{{ $t("menu.data.confirm") }}
      </v-btn>
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="revocation"
      >{{ $t("menu.data.revocation") }}
      </v-btn>
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="editState"
      >{{ $t("menu.data.quitEdit") }}
      </v-btn>
      <v-spacer/>
    </div>
  </v-container>
</template>

<style scoped>

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
</style>
