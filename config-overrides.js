const path = require('path');
const webpack = require('webpack');
const {
    override,
    addWebpackAlias,
    addBabelPlugins,
    addWebpackPlugin,
    removeModuleScopePlugin,
} = require('customize-cra');

module.exports = override(
    addWebpackAlias({
        "@/sdk": path.resolve(__dirname, "sdk"),
        "@/src": path.resolve(__dirname, "src"),
    }),
    addWebpackPlugin(new webpack.DefinePlugin({
        'process.env.IS_PRE': JSON.stringify(process.env.env === 'pre')
    })),
    removeModuleScopePlugin(),
    ...addBabelPlugins([
        'import',
        {
            libraryName: '@ucloud-fe/react-components',
            camel2DashComponentName: false,
            libraryDirectory: 'lib/components'
        }
    ])
);