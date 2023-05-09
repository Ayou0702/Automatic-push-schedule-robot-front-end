<script lang="ts" setup>
import {onBeforeMount, Ref, ref} from 'vue'
import axios, {AxiosResponse} from "axios";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import CopyLabel from "@/components/common/CopyLabel.vue";
import {useTheme} from "vuetify";
import {elMessage} from "@/utils/globalFunctions";
import {ElMessageBox} from 'element-plus'

let editing = ref(false)
let teacherData: Ref<Array<any>> = ref([])
let courseData: Ref<Array<any>> = ref([])
let scheduleData: Ref<Array<any>> = ref([])
let addScheduleData: Ref<Array<any>> = ref([])
let deleteScheduleData: Ref<Array<any>> = ref([])

// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

const search = ref('')
const multipleSelection = ref<ScheduleData[]>([]);
const diffSchedule: Ref<Array<any>> = ref([]);

// 通过Vue的生命周期函数获取数据库中的课表数据，并写入一份到本地缓存，用以比较课表信息差异
onBeforeMount(() => {
  getScheduleData().then(response => {
    if (response.data.code === 200) {
      elMessage(response.data.message, "success")
    }
  })

})


function getScheduleData(): Promise<AxiosResponse<any>> {
  return axios.get('http://localhost:8089/getScheduleData')
              .then(response => {

                if (response.data.code !== 200) {
                  elMessage(response.data.message, "error");
                  return Promise.reject({response: {data: {code: -1, message: response.data.message}}});
                }

                scheduleData.value = response.data.data.scheduleDataList;
                courseData.value = response.data.data.courseDataList;
                teacherData.value = response.data.data.teacherDataList;

                localStorage.setItem("scheduleData", JSON.stringify(scheduleData.value))

                return response;

              })
              .catch(error => {
                elMessage(error.message, "error")
                // 失败情况下返回约定错误格式（例如 code 字段为 -1）
                return Promise.reject({response: {data: {code: -1, message: error.message}}});
              });
}

function noDiff() {
  if (deleteScheduleData.value.length == 0 && addScheduleData.value.length == 0 && diffSchedule.value.length == 0) {
    elMessage("未修改数据", "warning")
    return true;
  }
  return false;
}

// 使用computed对课表信息进行过滤
const filterScheduleData = computed(() => {
  return [...scheduleData.value, ...addScheduleData.value].filter(
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

const selectStyle = computed(() => {
  return {
    "--el-fill-color-blank": 'null',
    "--el-text-color-regular": customizeTheme.darkTheme ? '#ffffff' : '#000000',
    "--el-input-border-color": '#b4a8ff',
  }
})

const courseNameStyle = computed(() => {
  return {
    "width": '350px',
  }
})

// 课程信息的数据类型定义
interface ScheduleData {
  scheduleId: number;
  courseName: string,
  teacherName: string,
  schedulePeriod: string,
  scheduleWeek: string,
  scheduleSection: string,
}

// 编辑模式开关
function editState() {
  editing.value = !editing.value
}

// 监视被修改的课表信息并将其提取至diffSchedule中
function diffSearch() {

  const localScheduleDataStr = localStorage.getItem('scheduleData')?.trim() ?? '[]';
  let localScheduleData = JSON.parse(localScheduleDataStr);

  // 如果本地的缓存教师数据与内存中的不一致，则直接将内存中的教师数据赋值给diffTeacher
  // 但是这种情况基本不会出现

  localScheduleData = localScheduleData.filter(item => !deleteScheduleData.value.includes(item.scheduleId))

  if (localScheduleData.length !== scheduleData.value.length) {
    diffSchedule.value = scheduleData.value;
    return;
  }

  // 对内存中的课表数据进行遍历，与本地缓存的进行比较
  for (let i = 0; i < scheduleData.value.length; ++i) {
    const curLocalData = localScheduleData[i];
    const curData = scheduleData.value[i];

    if (!curLocalData && !curData) {
      continue;
    }

    let hasChanged = false;
    const attrsToCheck = ['courseId', 'teacherId', 'schedulePeriod', 'scheduleWeek', 'scheduleSection'];

    // 遍历属性值进行比较
    for (let attr of attrsToCheck) {
      if (curLocalData[attr] !== curData[attr]) {
        hasChanged = true;
        break;
      }
    }

    // 若遍历发现不同，则将内存中的教师信息写入diffSchedule中，待确认修改后发送并清空
    if (hasChanged) {
      diffSchedule.value.push(curData);
    }

  }
}

function confirmModification() {

  diffSearch();
  if (noDiff()) {
    return;
  }

  // 从删除列表中过滤掉新增教师
  deleteScheduleData.value = deleteScheduleData.value.filter(data => typeof data !== 'string');
  addScheduleData.value.forEach(scheduleData => {
    scheduleData.scheduleId = null;
  })
  axios.post('http://localhost:8089/modifyScheduleData', {
    deleteScheduleData: deleteScheduleData.value,
    diffSchedule: diffSchedule.value,
    addScheduleData: addScheduleData.value
  })
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           // 合并teacherData和addTeacherData，并重置addTeacherData，防止重复执行
           deleteScheduleData.value = [];
           diffSchedule.value = [];
           teacherData.value = [...teacherData.value, ...addScheduleData.value];
           addScheduleData.value = [];

           getScheduleData();

         } else if (response.data.code === 901) {

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
  scheduleData.value = localStorage.getItem("scheduleData")?.trim() ? JSON.parse(localStorage.getItem("scheduleData")!.trim()) : [];
  addScheduleData.value = [];
  deleteScheduleData.value = [];
  diffSchedule.value = [];
}

// 新增课表数据
function addTeacher() {
  addScheduleData.value.push({
    courseName: '',
    teacherName: '',
    schedulePeriod: '',
    scheduleWeek: '',
    scheduleSection: '',
  })
}

// 删除 内存课表数据 与 新增课表数据 中的对应项，并写入id到 待删除课表数据
function deleteSchedule() {

  const deletedScheduleIds = multipleSelection.value.map(item => item.scheduleId);

  if (deletedScheduleIds.length === 0) {
    elMessage("没有勾选数据", "warning")
    return;
  }
  scheduleData.value = scheduleData.value.filter(item => !deletedScheduleIds.includes(item.scheduleId));
  addScheduleData.value = addScheduleData.value.filter(item => !deletedScheduleIds.includes(item.scheduleId));
  deleteScheduleData.value = deleteScheduleData.value.concat(deletedScheduleIds);

}

// 多选过滤器
function handleSelectionChange(val: ScheduleData[]) {
  multipleSelection.value = val;
}

</script>

<template>
  <v-card>
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
        :data="filterScheduleData"
        :style="tableStyle"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="editing" type="selection" width="55"/>
        <el-table-column :label="($t('menu.data.scheduleData.scheduleId'))" prop="scheduleId" width="100px">
          <template v-slot="{ row }">
            <CopyLabel :text="'#'+row.scheduleId"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.scheduleData.courseName'))" prop="courseName">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="courseData.find(item => item.courseId === row.courseId).courseName"/>
            <el-select v-else id="prefers" v-model="row.courseId" :style="[selectStyle,courseNameStyle]" class="m-2"
                       placeholder="Select">
              <el-option
                v-for="item in courseData"
                :key="item.courseId"
                :label="item.courseName"
                :value="item.courseId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.scheduleData.teacherName'))" prop="teacherName">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="teacherData.find(item => item.teacherId === row.teacherId).teacherName"/>
            <el-select v-else v-model="row.teacherId" :style="[selectStyle]" class="m-2" placeholder="Select">
              <el-option
                v-for="item in teacherData"
                :key="item.teacherId"
                :label="item.teacherName"
                :value="item.teacherId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.scheduleData.schedulePeriod'))" prop="schedulePeriod" width="200px">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="row.schedulePeriod"/>
            <el-input v-if="editing" v-model="row.schedulePeriod" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.scheduleData.scheduleWeek'))" prop="scheduleWeek" width="200px">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="row.scheduleWeek"/>
            <el-select v-else v-model="row.scheduleWeek" :style="selectStyle" class="m-2" placeholder="Select">
              <el-option
                v-for="item in 5"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.scheduleData.scheduleSection'))" prop="scheduleSection" width="200px">
          <template v-slot="{ row }">
            <span v-if="!editing"> {{ row.scheduleSection }}</span>
            <el-input v-if="editing" v-model="row.scheduleSection" :style="inputStyle"/>
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
        @click="deleteSchedule"
      >{{ $t("menu.data.delete") }}
      </v-btn
      >
      <v-spacer/>
      <v-btn
        v-if="editing"
        class="mt-2"
        color="primary"
        size="x-large"
        @click="addTeacher"
      >{{ $t("menu.data.addTeacher") }}
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
