<script setup lang="ts">
import CopyLabel from "@/components/common/CopyLabel.vue";
import {onBeforeMount, ref, Ref} from "vue";
import axios from "axios";
import {elMessage} from "@/utils/globalFunctions";
const loading = ref(true);

const headers = [
  { text: "节次 Id", align: "start", value: "id" },
  { text: "课程名称", value: "user" },
  { text: "上课地点", value: "date" },
  { text: "周次", value: "company" },
  { text: "星期", value: "amount" },
  { text: "节次", value: "status" },
  { text: "专业", value: "status" },
  { text: "", sortable: false, align: "right", value: "action" },
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

let curriculumInfoData: Ref<Array<any>> = ref([])

const open = (item) => {};

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

onBeforeMount(() => {
  getCurriculumInfo()
})

function getCurriculumInfo() {
  axios.get('http://localhost:8089/queryCurriculum')
       .then(response => {
         if (response.data.code === 200) {

           elMessage(response.data.message, "success")

           curriculumInfoData.value = response.data.data;
           localStorage.setItem("curriculumInfoData", JSON.stringify(curriculumInfoData.value))

         } else {

           elMessage(response.data.message, "error")

         }

       })
       .catch(error => {
         elMessage(error.message, "error")
       })
}
</script>
<template>
  <!-- loading spinner -->
  <div
    v-if="loading"
    class="h-full d-flex flex-grow-1 align-center justify-center"
  >
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
  <div v-else>
    <h6 class="text-h6 px-5 pt-5 d-flex align-center font-weight-bold">
      <span class="flex-fill font-weight-bold">Table</span>
    </h6>
    <perfect-scrollbar style="height: 700px">
      <v-table class="pa-3">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.text">
              {{ header.text }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td class="font-weight-bold">
              <copy-label :text="`# ${item.id}`" />
            </td>
            <td>
              <div class="d-flex align-center py-2">
                <v-avatar size="55" class="elevation-1 grey lighten-3">
                  <img :src="item.user.avatar"  alt="头像"/>
                </v-avatar>
                <div class="ml-1" style="padding-left: 10px">
                  <div class="font-weight-bold">{{ item.user.name }}</div>
                  <div class="text-caption">
                    <copy-label :text="item.user.email" />
                  </div>
                </div>
              </div>
            </td>
            <td>{{ item.date }}</td>
            <td>{{ item.company }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.amount }}</td>
            <td class="font-weight-bold">
              <div v-if="item.status === 'PENDING'">
                <v-icon size="large" color="warning">mdi-circle-medium</v-icon>
                <span>Pending</span>
              </div>
              <div v-if="item.status === 'PAID'">
                <v-icon size="large" color="success">mdi-circle-medium</v-icon>
                <span>Paid</span>
              </div>
            </td>
            <td>
              <v-btn
                size="default"
                variant="text"
                icon="mdi-lead-pencil"
                @click="open(item)"
              >
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </perfect-scrollbar>
  </div>
</template>

<style lang="scss" scoped>

tr {
  height: 80px;
}

.ml-1 .font-weight-bold {
  font-size: 15px;
}
.v-avatar {
  outline: #313838 solid 3px;
}
</style>
