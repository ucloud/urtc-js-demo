/*
 * @Description: In User Settings Edit
 * @Author:zhangjizhe
 * @Date: 2019-08-15 16:07:54
 * @LastEditTime: 2019-08-20 10:46:17
 * @LastEditors: Please set LastEditors
 */
const path = require('path');
const { override, addWebpackAlias, addBabelPlugins } = require('customize-cra');
module.exports = override(
    addWebpackAlias({
        ["@"]: path.resolve(__dirname, "src")
    }),
    ...addBabelPlugins([
        'import',
        {
            libraryName: '@ucloud-fe/react-components',
            camel2DashComponentName: false,
            libraryDirectory: 'lib/components'
        }
    ])
);