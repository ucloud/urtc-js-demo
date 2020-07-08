/* config-overrides.js */
const { override, addBabelPlugins } = require('customize-cra');
 
module.exports = override(
    ...addBabelPlugins([
        'import',
        {
            libraryName: '@ucloud-fe/react-components',
            camel2DashComponentName: false,
            libraryDirectory: 'lib/components'
        }
    ])
);