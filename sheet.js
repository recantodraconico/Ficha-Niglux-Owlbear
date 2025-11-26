import OBR from "https://cdn.owlbear.rodeo/sdk/latest/obrsdk.esm.js";

OBR.onReady(() => {
  OBR.tool.create({
    id: "ficha-meu-sistema-adv.tool",
    icons: [{ icon: "/icon.svg", label: "Ficha" }],
    title: "Ficha Avançada",
    onClick() {
      OBR.popover.open({
        id: "ficha-meu-sistema-adv.popover",
        url: "https://recantodraconico.github.io/Ficha-Niglux-Owlbear/index.html",
        width: 880,
        height: 760
      });
    }
  });
});
