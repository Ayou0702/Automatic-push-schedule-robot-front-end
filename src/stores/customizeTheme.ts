import {defineStore} from "pinia";

interface Color {
  colorId: number;
  colorName: string;
  colorValue: string;
}

interface State {
  miniSidebar: boolean;
  darkTheme: boolean;
  primaryColor: Color;
  mainSidebar: boolean;
}

export const useCustomizeThemeStore = defineStore({
  id: "customizeTheme", state: (): State => ({
    miniSidebar: false,
    darkTheme: false,
    primaryColor: {
      colorId: 1,
      colorName: "grey",
      colorValue: "#344767",
    },
    mainSidebar: true,
  }),

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["darkTheme", "mainSidebar"]
      },
    ],
  },
  getters: {},
  actions: {
    setMiniSideBar(payload: boolean) {
      this.miniSidebar = payload;
    },
    setPrimaryColor(payload: Color) {
      this.primaryColor = payload;
    },
    setDarkTheme() {
      this.darkTheme = !this.darkTheme;
      this.primaryColor = "#705cf6";
    }
  },
});
