<script lang="ts" setup>
import {onBeforeMount, Ref, ref} from 'vue'
import axios from "axios";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import CopyLabel from "@/components/common/CopyLabel.vue";
import {useTheme} from "vuetify";
import {elMessage} from "@/utils/globalFunctions";

let editing = ref(false)
let enterpriseData: Ref<Array<any>> = ref([])

// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

const search = ref('')
const multipleSelection = ref<CourseInfo[]>([]);
const diffData: Ref<Array<any>> = ref([]);

// 通过Vue的生命周期函数获取数据库中的课表数据，并写入一份到本地缓存，用以比较课程信息差异
onBeforeMount(() => {
  getEnterpriseData()
})

function getEnterpriseData() {
  axios.get('http://localhost:8089/getEnterpriseData')
       .then(response => {

         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           enterpriseData.value = response.data.data;
           localStorage.setItem("enterpriseData", JSON.stringify(enterpriseData.value))

         } else {

           elMessage(response.data.message, "error")

         }

       })
    .catch(error => {
      elMessage(error.message, "error")
    })
}

// 使用computed对课程信息进行过滤
const filterEnterpriseData = computed(() => {
  return enterpriseData.value.filter(
    (data) => {
      return !search.value ||
        data.dataName.toLowerCase().includes(search.value.toLowerCase())
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

function diffSearch() {
  const localCourseInfoDataStr = localStorage.getItem('enterpriseData')?.trim() ?? '[]';
  const localCourseInfoData = JSON.parse(localCourseInfoDataStr);

  // 如果本地的缓存课表数据与内存中的不一致，则直接将内存中的课表数据赋值给diffCourse
  // 但是这种情况基本不会出现
  if (localCourseInfoData.length !== enterpriseData.value.length) {
    diffData.value = enterpriseData.value;
    return;
  }

  // 对内存中的课表数据进行遍历，与本地缓存的进行比较
  for (let i = 0; i < enterpriseData.value.length; ++i) {
    const curLocalData = localCourseInfoData[i];
    const curData = enterpriseData.value[i];

    if (!curLocalData && !curData) {
      continue;
    }

    let hasChanged = false;
    const attrsToCheck = ['dataValue', 'dataAnnotation'];

    // 遍历属性值进行比较
    for (let attr of attrsToCheck) {
      if (curLocalData[attr] !== curData[attr]) {
        hasChanged = true;
        break;
      }
    }

    // 若遍历发现不同，则将内存中的课表信息写入diffCourse中，待确认修改后发送并清空
    if (hasChanged) {
      diffData.value.push(curData);
    }
  }
}

// 监视被修改的课程信息并将其提取至diffCourse中
// watchEffect(() => {
//
// });

// 配置数据的数据类型定义
interface CourseInfo {
  dataName: string;
  data_value: string;
  data_annotation: string;
}

// 编辑模式开关
function editState() {
  editing.value = !editing.value
}


function noDiff() {
  if (diffData.value.length == 0) {
    elMessage("未修改数据", "warning")
    return false;
  }
  return true;
}

function updateData() {

  diffSearch();

  // 若存在修改配置数据则执行
  if (noDiff()) {
    console.log(diffData.value)
    axios.post('http://localhost:8089/updateEnterpriseData', diffData.value
    )
         .then(response => {
           if (response.data.code === 200) {

             elMessage(response.data.message, "success")

             // 重置diffData，防止重复执行
             diffData.value = []

             // 将变更回写至本地缓存
             localStorage.setItem("enterpriseData", JSON.stringify(enterpriseData.value))

           } else {

             elMessage(response.data.message, "error")

           }

         })
         .catch(error => {
           console.log(error);
         });
  }
}

// 撤回修改
function revocation() {
  diffSearch()
  if (noDiff()) {
    enterpriseData.value = localStorage.getItem("enterpriseData")?.trim() ? JSON.parse(localStorage.getItem("enterpriseData")!.trim()) : [];
    diffData.value = []
  }
}

// 多选过滤器
function handleSelectionChange(val: CourseInfo[]) {
  multipleSelection.value = val;
}

</script>

<template>
    <v-card>
      <v-card-title class="font-weight-bold">
        <span>{{ $t("menu.data.enterpriseData.enterpriseData") }}</span>
        <v-spacer></v-spacer>

        <div class="w-25">
          <v-text-field
            v-model="search"
            :placeholder="($t('menu.data.enterpriseData.search'))"
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
          :data="filterEnterpriseData"
          :default-sort="{ prop: 'courseId', order: 'desc' }"
          :style="tableStyle"
          @selection-change="handleSelectionChange"
        >
          <el-table-column :label="($t('menu.data.enterpriseData.dataName'))" prop="courseName" width="350">
            <template v-slot="{ row }">
              <CopyLabel :text="row.dataName"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.enterpriseData.dataValue'))" prop="courseVenue" width="550">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.dataValue }}</span>
              <el-input v-if="editing" v-model="row.dataValue" :style="inputStyle"/>
            </template>
          </el-table-column>
          <el-table-column :label="($t('menu.data.enterpriseData.dataAnnotation'))" prop="coursePeriod">
            <template v-slot="{ row }">
              <span v-if="!editing">{{ row.dataAnnotation }}</span>
              <el-input v-if="editing" v-model="row.dataAnnotation" :style="inputStyle"/>
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
          @click="updateData"
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

</style>
