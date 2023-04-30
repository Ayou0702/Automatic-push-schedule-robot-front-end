<script lang="ts" setup>
import {onActivated, onBeforeMount, Ref, ref} from 'vue'
import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import CopyLabel from "@/components/common/CopyLabel.vue";
import {useTheme} from "vuetify";
import {elMessage} from "@/utils/globalFunctions";

let editing = ref(false)
let courseInfoData: Ref<Array<any>> = ref([])
let addCourseInfoData: Ref<Array<any>> = ref([])
let deleteCourseInfoData: Ref<Array<any>> = ref([])

// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

const search = ref('')
const multipleSelection = ref<CourseInfo[]>([]);
const diffCourse: Ref<Array<any>> = ref([]);

// 通过Vue的生命周期函数获取数据库中的课表数据，并写入一份到本地缓存，用以比较课程信息差异
onBeforeMount(() => {
  getCourseInfo()
})

function getCourseInfo() {
  axios.get('http://localhost:8089/getCourseInfo')
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           courseInfoData.value = response.data.data;
           localStorage.setItem("courseInfoData", JSON.stringify(courseInfoData.value))

         } else {

           elMessage(response.data.message, "error")

         }

       })
    .catch(error => {
      elMessage(error.message, "error")
    })
}

function noDiff() {
  if (deleteCourseInfoData.value.length == 0 && addCourseInfoData.value.length == 0 && diffCourse.value.length == 0) {
    elMessage("未修改数据", "warning")
    return true;
  }
  return false;
}

// 使用computed对课程信息进行过滤
const filterCourseData = computed(() => {
  return [...courseInfoData.value, ...addCourseInfoData.value].filter(
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
interface CourseInfo {
  courseSpecialized: boolean,
  courseId: number,
  courseName: string,
  courseVenue: string,
  coursePeriod: string,
  courseWeek: string,
  courseSection: string,
}

// 编辑模式开关
function editState() {
  editing.value = !editing.value
}

// 监视被修改的课程信息并将其提取至diffCourse中
function diffSearch() {
  const localCourseInfoDataStr = localStorage.getItem('courseInfoData')?.trim() ?? '[]';
  const localCourseInfoData = JSON.parse(localCourseInfoDataStr);

  // 如果本地的缓存课表数据与内存中的不一致，则直接将内存中的课表数据赋值给diffCourse
  // 但是这种情况基本不会出现
  if (localCourseInfoData.length !== courseInfoData.value.length) {
    diffCourse.value = courseInfoData.value;
    return;
  }

  // 对内存中的课表数据进行遍历，与本地缓存的进行比较
  for (let i = 0; i < courseInfoData.value.length; ++i) {
    const curLocalData = localCourseInfoData[i];
    const curData = courseInfoData.value[i];

    if (!curLocalData && !curData) {
      continue;
    }

    let hasChanged = false;
    const attrsToCheck = ['courseName', 'courseVenue', 'coursePeriod', 'courseWeek', 'courseSection', 'courseSpecialized'];

    // 遍历属性值进行比较
    for (let attr of attrsToCheck) {
      if (curLocalData[attr] !== curData[attr]) {
        hasChanged = true;
        break;
      }
    }

    // 若遍历发现不同，则将内存中的课表信息写入diffCourse中，待确认修改后发送并清空
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

  // 从删除列表中过滤掉新增课表
  deleteCourseInfoData.value = deleteCourseInfoData.value.filter(data => typeof data !== 'string');
  addCourseInfoData.value.forEach(courseInfo => {
    courseInfo.courseId = null;
  })
  axios.post('http://localhost:8089/modifyCourse', {
    deleteCourseInfoData: deleteCourseInfoData.value,
    diffCourse: diffCourse.value,
    addCourseInfoData: addCourseInfoData.value
  })
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           // 合并courseInfoData和addCourseInfoData，并重置addCourseInfoData，防止重复执行
           deleteCourseInfoData.value = [];
           diffCourse.value = [];
           courseInfoData.value = [...courseInfoData.value, ...addCourseInfoData.value];
           addCourseInfoData.value = [];

           // 将变更回写至本地缓存
           localStorage.setItem("courseInfoData", JSON.stringify(courseInfoData.value))

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
  courseInfoData.value = localStorage.getItem("courseInfoData")?.trim() ? JSON.parse(localStorage.getItem("courseInfoData")!.trim()) : [];
  addCourseInfoData.value = [];
  deleteCourseInfoData.value = [];
  diffCourse.value = [];
}

// 新增课程数据
function addCourse() {
  addCourseInfoData.value.push({
    courseSpecialized: false,
    courseId: uuidv4(),
    courseName: '',
    courseVenue: '',
    coursePeriod: '',
    courseWeek: '',
    courseSection: '',
  })
}

// 删除 内存课表数据 与 新增课表数据 中的对应项，并写入id到 待删除课表数据
function deleteCourse() {

  const deletedCourseIds = multipleSelection.value.map(item => item.courseId);

  if (deletedCourseIds.length === 0) {
    elMessage("没有勾选数据", "warning")
    return;
  }
  courseInfoData.value = courseInfoData.value.filter(item => !deletedCourseIds.includes(item.courseId));
  addCourseInfoData.value = addCourseInfoData.value.filter(item => !deletedCourseIds.includes(item.courseId));
  deleteCourseInfoData.value = deleteCourseInfoData.value.concat(deletedCourseIds);

}

// 多选过滤器
function handleSelectionChange(val: CourseInfo[]) {
  multipleSelection.value = val;
}

</script>

<template>
  <div>
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
          <el-table-column :label="($t('menu.data.courseData.courseName'))" prop="courseName" width="330">
            <template v-slot="{ row }">
              <CopyLabel v-if="!editing" :text="row.courseName"/>
              <el-input v-if="editing" v-model="row.courseName" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.courseData.courseVenue'))" prop="courseVenue" width="180">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.courseVenue }}</span>
              <el-input v-if="editing" v-model="row.courseVenue" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.courseData.coursePeriod'))" prop="coursePeriod">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.coursePeriod }}</span>
              <el-input v-if="editing" v-model="row.coursePeriod" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.courseData.courseWeek'))" prop="courseWeek">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.courseWeek }}</span>
              <el-input v-if="editing" v-model="row.courseWeek" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.courseData.courseSection'))" prop="courseSection">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.courseSection }}</span>
              <el-input v-if="editing" v-model="row.courseSection" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column
            :filter-method="filterTag"
            :filters="[
        { text: ($t('menu.data.courseData.yes')), value: true },
        { text: ($t('menu.data.courseData.no')), value: false },
      ]"
            :label="($t('menu.data.courseData.courseSpecialized'))"
            filter-placement="bottom-end"
            prop="courseSpecialized"
            width="100"
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
                  row.courseSpecialized ? ($t('menu.data.courseData.yes')) : ($t('menu.data.courseData.no'))
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
        >{{ $t("menu.data.add") }}
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
  </div>
</template>

<style scoped>

:deep(.cell) {
    text-align: center
}

:deep(.el-table tr) {
    height: 50px;
}


</style>
