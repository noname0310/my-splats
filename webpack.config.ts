import copyWebpackPlugin from "copy-webpack-plugin";
import eslintPlugin from "eslint-webpack-plugin";
import expressStaticGzip from "express-static-gzip";
import fs from "fs";
import htmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import type webpack from "webpack";
import type { WebpackPluginInstance } from "webpack";
import type { Configuration as WebpackDevServerConfiguration, Middleware } from "webpack-dev-server";

const createSceneEntry = (path: string, sourceAbsolutePath: string, fileName: string): WebpackPluginInstance => ({
    apply(compiler: any): void {
        compiler.hooks.compile.tap("Compile", (): void => {
            if (fs.existsSync(fileName)) {
                return;
            }
            let code = "import type { ISceneBuilder } from \"./Shared/baseRuntime\";\nimport { buildSceneEntry } from \"./Shared/buildSceneEntry\";\n\nconst scenes: [string, () => Promise<ISceneBuilder>][] = [\n";
            const files = fs.readdirSync(path);
            files.forEach((file): void => {
                if (file.endsWith(".ts")) {
                    const name = file.substring(0, file.length - 3);
                    const spaceName = name.replace(/[A-Z]/g, (s): string => ` ${s.toLowerCase()}`);
                    code += `    ["${spaceName}", async(): Promise<ISceneBuilder> => new (await import("${sourceAbsolutePath}/${name}")).SceneBuilder()],\n`;
                }
            });
            if (files.length > 0) {
                code = code.substring(0, code.length - 2);
            }
            code += "\n];\nbuildSceneEntry(scenes);\n";
            fs.writeFileSync(fileName, code);
        });
    }
});

export default (env: any): webpack.Configuration & { devServer?: WebpackDevServerConfiguration } => ({
    entry: {
        index: "./src/index.ts"
    },
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "[name].bundle.js",
        clean: true
    },
    optimization: {
        minimize: env.production,
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                glslShaders: {
                    test: (module: webpack.Module): boolean => {
                        if ((module as webpack.NormalModule).resource === undefined) {
                            return false;
                        }
                        const resource = (module as webpack.NormalModule).resource.replace(/\\/g, "/");
                        if (resource.includes("Shaders/")) {
                            return true;
                        }
                        return false;
                    },
                    name: "glslShaders",
                    enforce: true
                },
                wgslShaders: {
                    test: (module: webpack.Module): boolean => {
                        if ((module as webpack.NormalModule).resource === undefined) {
                            return false;
                        }
                        const resource = (module as webpack.NormalModule).resource.replace(/\\/g, "/");
                        if (resource.includes("ShadersWGSL/")) {
                            return true;
                        }
                        return false;
                    },
                    name: "wgslShaders",
                    enforce: true
                }
            }
        }
    },
    cache: true,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            }
        ]
    },
    resolve: {
        alias: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "@": path.resolve(__dirname, "src")
        },
        modules: ["src", "node_modules"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        fallback: {
            "path": false,
            "fs": false
        }
    },
    plugins: [
        createSceneEntry("./src/Scenes", "@/Scenes", "./src/index.ts"),
        new htmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html",
            chunks: ["index"]
        }),
        new eslintPlugin({
            extensions: ["ts", "tsx"],
            fix: true,
            cache: true,
            configType: "flat"
        }),
        new copyWebpackPlugin({
            patterns: [
                { from: "res", to: "res" }
            ]
        })
    ],
    devServer: {
        host: "0.0.0.0",
        port: 20310,
        allowedHosts: "all",
        client: {
            logging: "none"
        },
        hot: true,
        watchFiles: ["src/**/*"],
        server: "https",
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Cross-Origin-Opener-Policy": "same-origin",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Cross-Origin-Embedder-Policy": "require-corp"
        },
        compress: true,
        setupMiddlewares: (middlewares, devServer): Middleware[] => {
            devServer.app!.use("/", expressStaticGzip("./", {}));
            return middlewares;
        }
    },
    mode: env.production ? "production" : "development"
});
