import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';
import mineRouter from '../router.config';
import { formatter } from '../utils/utils';


let routerDataCache;

const modelNotExisted = (app, model) => (
    // eslint-disable-next-line
    !app._models.some(({ namespace }) => {
        return namespace === model.substring(model.lastIndexOf('/') + 1);
    })
);


// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
    // () => require('module')
    // transformed by babel-plugin-dynamic-import-node-sync
    if (component.toString().indexOf('.then(') < 0) {
        models.forEach((model) => {
            if (modelNotExisted(app, model)) {
                // eslint-disable-next-line
                app.model(require(`../models/${model}`).default);
            }
        });
        return (props) => {
            if (!routerDataCache) {
                routerDataCache = getRouterData(app);
            }
            return createElement(component().default, {
                ...props,
                routerData: routerDataCache,
            });
        };
    }
    // () => import('module')
    return dynamic({
        app,
        models: () => models.filter(
            model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
            ),
        // add routerData prop
        component: () => {
            if (!routerDataCache) {
                routerDataCache = getRouterData(app);
            }
            return component().then((raw) => {
                const Component = raw.default || raw;
                return props => createElement(Component, {
                    ...props,
                    routerData: routerDataCache,
                });
            });
        },
    });
};

function getFlatMenuData(menus) {
    let keys = {};
    menus.forEach((item) => {
        if (item.children) {
            keys[item.path] = { ...item };
            keys = { ...keys, ...getFlatMenuData(item.children) };
        } else {
            keys[item.path] = { ...item };
        }
    });
    return keys;
}

export const getRouterData = (app) => {
    
    const menuData = getFlatMenuData(getMenuData());

    const routerConfig = getFlatMenuData(formatter(mineRouter));
    
    const routerData = {};

    // 遍历routerConfig 对组件进行动态挂载 输出路由键值对数组

    Object.keys(routerConfig).forEach((path) => {
        const tempPath = routerConfig[path];
        const pathRegexp = pathToRegexp(path);
        const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
        let menuItem = {};
        if (menuKey) {
            menuItem = menuData[menuKey];
        }

        // 当前级路由未设置component时，删除当前路由键值对        
        if (routerConfig[path].component === undefined) {
            delete routerConfig[path];
        } else {
            routerConfig[path].component = dynamicWrapper(app, tempPath.models, tempPath.component);
            let router = routerConfig[path];

            router = {
                ...router,
                name: router.name || menuItem.name,
                authority: router.authority || menuItem.authority,
                hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
            };
            routerData[path] = router;
        }
    });

    return routerData;

}