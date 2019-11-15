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
        "@/src": path.resolve(__dirname, "src"),
    }),
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