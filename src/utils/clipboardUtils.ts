import Clipboard from "clipboard";
import i18n from "@/plugins/i18n";
import {elMessage} from "@/utils/globalFunctions";

export default function handleClipboard(text:string, event:Event) {
    const clipboard = new Clipboard(event.target as Element, {
        text: (): string => text,
    });
    clipboard.on("success", (e) => {
        clipboard.destroy();
        // @ts-ignore 在类型实例化时此处可能导致造成内存溢出或无限递归
        elMessage(i18n.global.t("utils.clipboardUtils.copySuccess"),'success')
    });
    clipboard.on("error", (e) => {
        clipboard.destroy();
        elMessage(i18n.global.t("utils.clipboardUtils.copyError"),'error')
    });
    // @ts-ignore
    clipboard.onClick(event);

}

