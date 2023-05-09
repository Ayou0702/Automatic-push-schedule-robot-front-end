import{d as ce,r as b,A as oe,B as ne,a as de,e as h,b as $,C as N,f as L,g as l,w as c,v as se,D as ue,F as ie,c as o,E as he,i as w,t as f,G as k,H as me,I as fe,J as pe,y as r,K as I,x as s,p as u,n as p,m as j,L as E,q as D,M as ve,k as V,_ as ge}from"./index-565d8451.js";import{C as B}from"./CopyLabel-c6345122.js";import{v as ye}from"./v4-a960c1f4.js";const _e={class:"w-25"},be={key:0},Te={style:{display:"flex","justify-content":"center","align-items":"center"}},ke={key:0,style:{display:"flex","flex-direction":"column","justify-content":"center","align-items":"center",gap:"5px","margin-left":"10px"}},Ve={style:{display:"flex","justify-content":"space-between"}},De=ce({__name:"TeacherDataPage",setup(Se){let n=b(!1),i=b([]),m=b([]),g=b([]),M=b([]);const v=oe(),G=ne(),C=b(""),q=b([]),T=b([]);de(()=>{J().then(e=>{e.data.code===200?h(e.data.message,"success"):h(e.data.message,"error")})});function J(){return $.get("http://localhost:8089/getTeacherData").then(e=>(e.data.data.map(a=>a.teacherAvatar="data:image/jpeg;base64,"+a.teacherAvatar),i.value=e.data.data,localStorage.setItem("teacherData",JSON.stringify(i.value)),M.value=e.data.data.map(a=>a.teacherAvatar),e)).catch(e=>(h(e.message,"error"),Promise.reject({response:{data:{code:-1,message:e.message}}})))}function F(){return g.value.length==0&&m.value.length==0&&T.value.length==0?(h("未修改数据","warning"),!0):!1}const K=N(()=>[...i.value,...m.value].filter(e=>!C.value||e.teacherName.toLowerCase().includes(C.value.toLowerCase()))),Q=N(()=>({"--el-table-tr-bg-color":(v.darkTheme,"null"),"--el-table-bg-color":(v.darkTheme,"null"),"--el-table-header-bg-color":(v.darkTheme,"null"),"--el-table-text-color":v.darkTheme?"#ffffff":"null","--el-table-row-hover-bg-color":v.darkTheme?"#39475e":"#f5f7fa","--el-table-border-color":v.darkTheme?"#253458":"#ebeef5"})),P=N(()=>({width:"200px","--el-input-bg-color":v.darkTheme?"#1c2742":"#ffffff","--el-input-text-color":v.darkTheme?"#ffffff":"#000000","--el-input-border-color":v.darkTheme?"#b4a8ff":G.themes.value.light.colors.primary})),R=N(()=>({"--el-switch-off-color":"#dcdfe6"})),W=(e,a)=>a.teacherSpecialized===e;function O(){n.value=!n.value}function H(){var d;const e=((d=localStorage.getItem("teacherData"))==null?void 0:d.trim())??"[]",a=JSON.parse(e);if(a.length!==i.value.length){T.value=i.value;return}for(let y=0;y<i.value.length;++y){const x=a[y],S=i.value[y];if(!x&&!S)continue;let z=!1;const U=["teacherName","teacherPhone","teacherInstitute","teacherSpecialized"];for(let A of U)if(x[A]!==S[A]){z=!0;break}z&&T.value.push(S)}}function X(){H(),!F()&&(g.value=g.value.filter(e=>typeof e!="string"),m.value.forEach(e=>{e.teacherId=null,e.teacherAvatar=null}),T.value.forEach(e=>{e.teacherAvatar=null}),$.post("http://localhost:8089/modifyTeacherData",{deleteTeacherData:g.value,diffTeacher:T.value,addTeacherData:m.value}).then(e=>{if(e.data.code===200)h(e.data.message,"success"),g.value=[],T.value=[],i.value=[...i.value,...m.value],m.value=[],J();else if(e.data.code===901){let a=e.data.message.replace(/\n|\r\n/g,"<br>");ve.alert(a,e.data.data,{confirmButtonText:"了解",dangerouslyUseHTMLString:!0,callback:()=>{h(e.data.data,"error")}})}else h(e.data.message,"error")}).catch(e=>{console.log(e)}))}function Y(){var e;H(),!F()&&(i.value=(e=localStorage.getItem("teacherData"))!=null&&e.trim()?JSON.parse(localStorage.getItem("teacherData").trim()):[],m.value=[],g.value=[],T.value=[])}function Z(){m.value.push({teacherSpecialized:!1,teacherId:ye(),teacherName:"",teacherVenue:""})}function ee(){const e=q.value.map(a=>a.teacherId);if(e.length===0){h("没有勾选数据","warning");return}i.value=i.value.filter(a=>!e.includes(a.teacherId)),m.value=m.value.filter(a=>!e.includes(a.teacherId)),g.value=g.value.concat(e)}function ae(e){q.value=e}function te(e){e.code===200?(h(e.message,"success"),le(e.data)):h(e.message,"error")}function le(e){$.post("http://localhost:8089/queryTeacherAvatarByTeacherId",{teacherId:e}).then(a=>{a.data.code===200?i.value.filter(d=>d.teacherId==e).map(d=>{d.teacherAvatar="data:image/jpeg;base64,"+a.data.data.teacherAvatar}):h(a.data.message,"error")})}function re(e){$.post("http://localhost:8089/deleteTeacherAvatar",{teacherId:e}).then(a=>{a.data.code===200?(h(a.data.message,"success"),i.value.filter(d=>d.teacherId==e).map(d=>{d.teacherAvatar="null"})):h(a.data.message,"error")})}return(e,a)=>{const d=V("el-table-column"),y=V("el-input"),x=V("el-avatar"),S=V("el-image"),z=V("el-upload"),U=V("el-switch"),A=V("el-table");return o(),L(ie,null,[l(se,null,{default:c(()=>[l(he,{class:"font-weight-bold"},{default:c(()=>[w("span",null,f(e.$t("menu.data.teacherData.teacherData")),1),l(k),w("div",_e,[l(me,{modelValue:C.value,"onUpdate:modelValue":a[0]||(a[0]=t=>C.value=t),placeholder:e.$t("menu.data.teacherData.search"),clearable:"",density:"compact","hide-details":"","prepend-inner-icon":"mdi-magnify","single-line":"",variant:"solo"},null,8,["modelValue","placeholder"])])]),_:1}),l(fe),l(pe,{class:"table-container"},{default:c(()=>[l(A,{data:r(K),"default-sort":{prop:"teacherId",order:"desc"},style:I(r(Q)),onSelectionChange:ae},{default:c(()=>[r(n)?(o(),s(d,{key:0,type:"selection",width:"55"})):u("",!0),l(d,{label:e.$t("menu.data.teacherData.teacherId"),prop:"teacherId",width:"100px"},{default:c(({row:t})=>[t.teacherId.length<20?(o(),s(B,{key:0,text:"#"+t.teacherId},null,8,["text"])):(o(),s(B,{key:1,text:"不可设置ID"}))]),_:1},8,["label"]),l(d,{label:e.$t("menu.data.teacherData.teacherName"),prop:"teacherName"},{default:c(({row:t})=>[r(n)?u("",!0):(o(),s(B,{key:0,text:t.teacherName},null,8,["text"])),r(n)?(o(),s(y,{key:1,modelValue:t.teacherName,"onUpdate:modelValue":_=>t.teacherName=_,style:I(r(P))},null,8,["modelValue","onUpdate:modelValue","style"])):u("",!0)]),_:1},8,["label"]),l(d,{label:e.$t("menu.data.teacherData.teacherPhone"),prop:"teacherPhone"},{default:c(({row:t})=>[r(n)?u("",!0):(o(),s(B,{key:0,text:t.teacherPhone},null,8,["text"])),r(n)?(o(),s(y,{key:1,modelValue:t.teacherPhone,"onUpdate:modelValue":_=>t.teacherPhone=_,style:I(r(P))},null,8,["modelValue","onUpdate:modelValue","style"])):u("",!0)]),_:1},8,["label"]),l(d,{label:e.$t("menu.data.teacherData.teacherInstitute"),prop:"teacherInstitute"},{default:c(({row:t})=>[r(n)?u("",!0):(o(),L("span",be,f(t.teacherInstitute),1)),r(n)?(o(),s(y,{key:1,modelValue:t.teacherInstitute,"onUpdate:modelValue":_=>t.teacherInstitute=_,style:I(r(P))},null,8,["modelValue","onUpdate:modelValue","style"])):u("",!0)]),_:1},8,["label"]),l(d,{label:e.$t("menu.data.teacherData.teacherAvatar"),prop:"teacherAvatar"},{default:c(({row:t})=>[w("div",Te,[l(S,{"preview-src-list":r(M),src:t.teacherAvatar,"preview-teleported":"",style:{width:"60px",height:"60px","border-radius":"50%"}},{error:c(()=>[l(x,{style:{width:"60px",height:"60px","font-size":"20px"}},{default:c(()=>[p(f(t.teacherName.charAt(0)),1)]),_:2},1024)]),_:2},1032,["preview-src-list","src"]),t.teacherId.length<20?(o(),L("div",ke,[l(z,{data:{teacherId:t.teacherId},"on-success":te,action:"http://localhost:8089/modifyTeacherAvatar"},{default:c(()=>[r(n)?(o(),s(E,{key:0,class:"font-weight-bold",color:"blue",size:"small"},{default:c(()=>[l(j,{icon:"mdi-pencil",start:""}),p(" 修改 ")]),_:1})):u("",!0)]),_:2},1032,["data"]),r(n)?(o(),s(E,{key:0,class:"font-weight-bold",color:"red",size:"small",onClick:_=>re(t.teacherId)},{default:c(()=>[l(j,{icon:"mdi-close",start:""}),p(" 删除 ")]),_:2},1032,["onClick"])):u("",!0)])):u("",!0)])]),_:1},8,["label"]),l(d,{"filter-method":W,filters:[{text:e.$t("menu.data.yes"),value:!0},{text:e.$t("menu.data.no"),value:!1}],label:e.$t("menu.data.teacherData.teacherSpecialized"),"filter-placement":"bottom-end",prop:"teacherSpecialized",width:"200px"},{default:c(({row:t})=>[r(n)?u("",!0):(o(),s(E,{key:0,color:t.teacherSpecialized?"blue":"red",class:"font-weight-bold",size:"small"},{default:c(()=>[l(j,{icon:t.teacherSpecialized?"mdi-check-circle-outline":"mdi-close-circle-outline",start:""},null,8,["icon"]),p(" "+f(t.teacherSpecialized?e.$t("menu.data.yes"):e.$t("menu.data.no")),1)]),_:2},1032,["color"])),r(n)?(o(),s(U,{key:1,modelValue:t.teacherSpecialized,"onUpdate:modelValue":_=>t.teacherSpecialized=_,style:I(r(R))},null,8,["modelValue","onUpdate:modelValue","style"])):u("",!0)]),_:1},8,["filters","label"])]),_:1},8,["data","style"])]),_:1})]),_:1}),l(ue,null,{default:c(()=>[r(n)?u("",!0):(o(),s(D,{key:0,block:"",class:"mt-2",color:"primary",size:"x-large",onClick:O},{default:c(()=>[p(f(e.$t("menu.data.edit")),1)]),_:1})),w("div",Ve,[l(k),r(n)?(o(),s(D,{key:0,class:"mt-2",color:"primary",size:"x-large",onClick:ee},{default:c(()=>[p(f(e.$t("menu.data.delete")),1)]),_:1})):u("",!0),l(k),r(n)?(o(),s(D,{key:1,class:"mt-2",color:"primary",size:"x-large",onClick:Z},{default:c(()=>[p(f(e.$t("menu.data.addTeacher")),1)]),_:1})):u("",!0),l(k),r(n)?(o(),s(D,{key:2,class:"mt-2",color:"primary",size:"x-large",onClick:X},{default:c(()=>[p(f(e.$t("menu.data.confirm")),1)]),_:1})):u("",!0),l(k),r(n)?(o(),s(D,{key:3,class:"mt-2",color:"primary",size:"x-large",onClick:Y},{default:c(()=>[p(f(e.$t("menu.data.revocation")),1)]),_:1})):u("",!0),l(k),r(n)?(o(),s(D,{key:4,class:"mt-2",color:"primary",size:"x-large",onClick:O},{default:c(()=>[p(f(e.$t("menu.data.quitEdit")),1)]),_:1})):u("",!0),l(k)])]),_:1})],64)}}});const ze=ge(De,[["__scopeId","data-v-e7b8302e"]]);export{ze as default};