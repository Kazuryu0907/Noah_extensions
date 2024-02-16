import { defineConfig } from "vite"
import { crx, defineManifest } from "@crxjs/vite-plugin"

const manifest = defineManifest({
    manifest_version: 3,
    name: "Noah Extension",
    description: "Noahで使用するためのTwitterフォロー一覧を取得するための拡張機能",
    version: "1.0",
    icons: {
        16: "icons/16.png",
        48: "icons/48.png",
        128: "icons/128.png",
    },
    // background: {
    //     service_worker: "scripts/options/background.ts",
    //     type: "module",
    // },
    action: {
        default_popup: "scripts/options/index.html",
        default_icon: "icons/128.png",
    },
    permissions: ["tabs"],
    content_scripts: [
        {
            js: ["scripts/content.ts"],
            matches: [
                "https://twitter.com/*/following",
                "https://x.com/*/following",
            ],
            run_at: "document_start",
            all_frames: true,
        }
    ],
})

export default defineConfig({
    plugins: [crx({ manifest })]
})