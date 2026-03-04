import { spawnSync } from "node:child_process";

export function copyToClipboard(text: string) {
  const platform = process.platform;

  if (platform === "darwin") {
    spawnSync("pbcopy", [], { input: text });
    return;
  }

  if (platform === "win32") {
    spawnSync("clip", [], { input: text, shell: true });
    return;
  }

  const xclip = spawnSync("xclip", ["-selection", "clipboard"], {
    input: text,
  });
  if (xclip.status === 0) return;

  const xsel = spawnSync("xsel", ["--clipboard", "--input"], { input: text });
  if (xsel.status === 0) return;

  throw new Error("Clipboard not available (install xclip or xsel).");
}

export function openUrl(url: string) {
  const platform = process.platform;

  if (platform === "darwin") {
    spawnSync("open", [url], { stdio: "ignore" });
    return;
  }

  if (platform === "win32") {
    spawnSync("start", [url], { stdio: "ignore", shell: true });
    return;
  }

  spawnSync("xdg-open", [url], { stdio: "ignore" });
}
