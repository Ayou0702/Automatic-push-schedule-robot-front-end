import {setThemeColor,elMessage} from '@/utils/globalFunctions'
import App from "@/App.vue";

const globalFunctionPlugin = {
    install(app:App):void {
        app.config.globalProperties.$setThemeColor = setThemeColor
        app.config.globalProperties.$elMessage = elMessage
    }
}

export default globalFunctionPlugin;
