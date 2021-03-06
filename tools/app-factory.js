const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
process.env.NODE_ENV = "development";
const CopyPlugin = require("copy-webpack-plugin");
const { join } = require("path");


function getCompilerConfig() {
    const config = {
        optimization: {
            minimize: false,
        },
        entry: {
            main: join(__dirname, "../src/ui/main-page/main.js"),
            agent: join(__dirname, "../src/extension/agent.js"),
            background: join(__dirname, "../src/extension/background.js"),
            exploit:join(__dirname, "../src/ui/exploit-page/exploit.js"),
        },
        output: {
            filename: '[name].js',
            path: join(__dirname, "../chrome-extension"),
            chunkFilename: '[name].bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "sourceType": "unambiguous",
                            plugins: [
                                "@babel/plugin-proposal-class-properties",
                                "@babel/plugin-transform-react-jsx",
                            ]
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader" // compiles Sass to CSS
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        devtool: 'inline-source-map',
        plugins: [

            new HtmlWebpackPlugin({
                chunks: ["main"],
                template: "src/ui/main-page/main.ejs",
                filename: 'main.html'
            }),
            new HtmlWebpackPlugin({
                chunks: ["exploit"],
                template: "src/ui/exploit-page/exploit.ejs",
                filename: 'exploit.html'
            }),
            new CopyPlugin({
                patterns: [
                  { from: "src/extension/manifest.json" },
                  { from: "src/static-files/" }
                ],
            }),
            new webpack.SourceMapDevToolPlugin({})
        ]
    }
    return config
}


const compilerDone = (err, stats) => {
    const { errors, missingDependencies } = stats.compilation;
    if (errors.length) {
        return errors.forEach(error => console.log(`got an error when compiling: ${error.message}`, error.stack))
    }
    console.log(`app build ${stats.hash} completed`)
}

module.exports = (watch) => {
    const compiler = webpack(getCompilerConfig());
    if (watch) {
        console.log("In dev mode. Starting watcher")
        compiler.watch({
            aggregateTimeout: 300,
            poll: undefined
        }, compilerDone)
    } else {
        compiler.run(compilerDone)
    }
}