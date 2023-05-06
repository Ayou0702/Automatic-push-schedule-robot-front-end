<script lang="ts" setup>
import {onBeforeMount, Ref, ref} from 'vue'
import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import CopyLabel from "@/components/common/CopyLabel.vue";
import {useTheme} from "vuetify";
import {elMessage} from "@/utils/globalFunctions";
import {ElMessageBox} from 'element-plus'

let editing = ref(false)
let teacherData: Ref<Array<any>> = ref([])
let addTeacherData: Ref<Array<any>> = ref([])
let deleteTeacherData: Ref<Array<any>> = ref([])
let teacherAvatarList: Ref<Array<any>> = ref([])

// 主题
const customizeTheme = useCustomizeThemeStore();
const theme = useTheme();

const search = ref('')
const multipleSelection = ref<TeacherData[]>([]);
const diffTeacher: Ref<Array<any>> = ref([]);

// 通过Vue的生命周期函数获取数据库中的教师数据，并写入一份到本地缓存，用以比较教师信息差异
onBeforeMount(() => {
  getTeacherData()
})

function getTeacherData() {
  axios.get('http://localhost:8089/getTeacherData')
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           response.data.data.map(data => data.teacherAvatar = 'data:image/jpeg;base64,' + data.teacherAvatar)

           teacherData.value = response.data.data;
           localStorage.setItem("teacherData", JSON.stringify(teacherData.value))

           teacherAvatarList.value = response.data.data.map(item => item.teacherAvatar);

         } else {

           elMessage(response.data.message, "error")

         }

       })
       .catch(error => {
         elMessage(error.message, "error")
       })
}

function noDiff() {
  if (deleteTeacherData.value.length == 0 && addTeacherData.value.length == 0 && diffTeacher.value.length == 0) {
    elMessage("未修改数据", "warning")
    return true;
  }
  return false;
}

// 使用computed对课程信息进行过滤
const filterTeacherData = computed(() => {
  return [...teacherData.value, ...addTeacherData.value].filter(
    (data) => {
      return !search.value ||
        data.teacherName.toLowerCase().includes(search.value.toLowerCase())
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
    "width": "200px",
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
  return row.teacherSpecialized === value
}

// 课程信息的数据类型定义
interface TeacherData {
  teacherId: number;
  teacherName: string,
  teacherPhone: string,
  teacherInstitute: string,
  teacherAvatar: Uint8Array,
  teacherSpecialized: boolean,
}

// 编辑模式开关
function editState() {
  editing.value = !editing.value
}

// 监视被修改的课程信息并将其提取至diffTeacher中
function diffSearch() {
  const localTeacherDataStr = localStorage.getItem('teacherData')?.trim() ?? '[]';
  const localTeacherData = JSON.parse(localTeacherDataStr);

  // 如果本地的缓存教师数据与内存中的不一致，则直接将内存中的教师数据赋值给diffTeacher
  // 但是这种情况基本不会出现
  if (localTeacherData.length !== teacherData.value.length) {
    diffTeacher.value = teacherData.value;
    return;
  }

  // 对内存中的教师数据进行遍历，与本地缓存的进行比较
  for (let i = 0; i < teacherData.value.length; ++i) {
    const curLocalData = localTeacherData[i];
    const curData = teacherData.value[i];

    if (!curLocalData && !curData) {
      continue;
    }

    let hasChanged = false;
    const attrsToCheck = ['teacherName', 'teacherPhone', 'teacherInstitute', 'teacherSpecialized'];

    // 遍历属性值进行比较
    for (let attr of attrsToCheck) {
      if (curLocalData[attr] !== curData[attr]) {
        hasChanged = true;
        break;
      }
    }

    // 若遍历发现不同，则将内存中的教师信息写入diffTeacher中，待确认修改后发送并清空
    if (hasChanged) {
      diffTeacher.value.push(curData);
    }
  }
}

function confirmModification() {

  diffSearch();
  if (noDiff()) {
    return;
  }

  // 从删除列表中过滤掉新增教师
  deleteTeacherData.value = deleteTeacherData.value.filter(data => typeof data !== 'string');
  addTeacherData.value.forEach(teacherData => {
    teacherData.teacherId = null;
  })
  axios.post('http://localhost:8089/modifyTeacherData', {
    deleteTeacherData: deleteTeacherData.value,
    diffTeacher: diffTeacher.value,
    addTeacherData: addTeacherData.value
  })
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           // 合并teacherData和addTeacherData，并重置addTeacherData，防止重复执行
           deleteTeacherData.value = [];
           diffTeacher.value = [];
           teacherData.value = [...teacherData.value, ...addTeacherData.value];
           addTeacherData.value = [];

           // 将变更回写至本地缓存
           localStorage.setItem("teacherData", JSON.stringify(teacherData.value))

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
  teacherData.value = localStorage.getItem("teacherData")?.trim() ? JSON.parse(localStorage.getItem("teacherData")!.trim()) : [];
  addTeacherData.value = [];
  deleteTeacherData.value = [];
  diffTeacher.value = [];
}

// 新增课程数据
function addTeacher() {
  addTeacherData.value.push({
    teacherSpecialized: false,
    teacherId: uuidv4(),
    teacherName: '',
    teacherVenue: '',
  })
}

// 删除 内存教师数据 与 新增教师数据 中的对应项，并写入id到 待删除教师数据
function deleteTeacher() {

  const deletedTeacherIds = multipleSelection.value.map(item => item.teacherId);

  if (deletedTeacherIds.length === 0) {
    elMessage("没有勾选数据", "warning")
    return;
  }
  teacherData.value = teacherData.value.filter(item => !deletedTeacherIds.includes(item.teacherId));
  addTeacherData.value = addTeacherData.value.filter(item => !deletedTeacherIds.includes(item.teacherId));
  deleteTeacherData.value = deleteTeacherData.value.concat(deletedTeacherIds);

}

// 多选过滤器
function handleSelectionChange(val: TeacherData[]) {
  multipleSelection.value = val;
}

interface Response {
  code: number;
  message: string;
  data: object;
}

function modifyTeacherAvatarSuccess(response: Response, file: File) {
  if (response.code === 200) {
    elMessage(response.message, "success")

    console.log(file)
  } else {
    elMessage(response.message, "error")
  }
}

function deleteTeacherAvatar(teacherId: number) {
  axios.post('http://localhost:8089/deleteTeacherAvatar', {teacherId})
       .then(response => {
         if (response.data.code === 200) {
           elMessage(response.data.message, "success")
           teacherData.value.filter(item => item.teacherId == teacherId).map(item => {
             item.teacherAvatar = "null";
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
      <span>{{ $t("menu.data.teacherData.teacherData") }}</span>
      <v-spacer></v-spacer>
      <div class="w-25">
        <v-text-field
          v-model="search"
          :placeholder="($t('menu.data.teacherData.search'))"
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
        :data="filterTeacherData"
        :default-sort="{ prop: 'teacherId', order: 'desc' }"
        :style="tableStyle"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="editing" type="selection" width="55"/>
        <el-table-column :label="($t('menu.data.teacherData.teacherId'))" prop="teacherId" width="100px">
          <template v-slot="{ row }">
            <CopyLabel :text="'#'+row.teacherId"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.teacherData.teacherName'))" prop="teacherName">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="row.teacherName"/>
            <el-input v-if="editing" v-model="row.teacherName" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.teacherData.teacherPhone'))" prop="teacherPhone">
          <template v-slot="{ row }">
            <CopyLabel v-if="!editing" :text="row.teacherPhone"/>
            <el-input v-if="editing" v-model="row.teacherPhone" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.teacherData.teacherInstitute'))" prop="teacherInstitute">
          <template v-slot="{ row }">
            <span v-if="!editing"> {{ row.teacherInstitute }}</span>
            <el-input v-if="editing" v-model="row.teacherInstitute" :style="inputStyle"/>
          </template>
        </el-table-column>
        <el-table-column :label="($t('menu.data.teacherData.teacherAvatar'))" prop="teacherAvatar">
          <template v-slot="{ row }">
            <div style="display: flex;justify-content: center;align-items: center">

              <el-image :preview-src-list=teacherAvatarList :src="row.teacherAvatar"
                        preview-teleported style="width: 60px;height: 60px;border-radius: 50%">
                <template #error>
                  <el-avatar style="width: 60px;height: 60px;font-size: 20px"> {{
                      row.teacherName.charAt(0)
                    }}
                  </el-avatar>
                </template>
              </el-image>
              <div
                style="display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 5px;margin-left: 10px">
                <el-upload
                  :data="{'teacherId':row.teacherId}"
                  :on-success="modifyTeacherAvatarSuccess"
                  action="http://localhost:8089/modifyTeacherAvatar">
                  <v-chip
                    v-if="editing"
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
                  @click="deleteTeacherAvatar(row.teacherId)"
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
          :label="($t('menu.data.teacherData.teacherSpecialized'))"
          filter-placement="bottom-end"
          prop="teacherSpecialized"
          width="200px"
        >
          <template v-slot="{ row }">

            <v-chip
              v-if="!editing"
              :color="row.teacherSpecialized ? 'blue' : 'red'"
              class="font-weight-bold"
              size="small"
            >
              <v-icon
                :icon="
                      row.teacherSpecialized
                        ? 'mdi-check-circle-outline'
                        : 'mdi-close-circle-outline'
                    "
                start
              ></v-icon>
              {{
                row.teacherSpecialized ? ($t('menu.data.yes')) : ($t('menu.data.no'))
              }}
            </v-chip
            >
            <el-switch v-if="editing" v-model="row.teacherSpecialized" :style="switchStyle"/>
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
        @click="deleteTeacher"
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
