const UserRouter = [
    {
        path: 'login',
        name: '用户登陆',
        component: () => import('../routes/User/Login'),
        // component: BasicLayout,
        models: ['example'],
        children: [
            {
                path: 'Step1',
                name: '第一步',
                component: () => import('../routes/User/Login/Step1'),
                models: ['user'],
            }, {
                path: 'Step2',
                name: '第二步',
                component: () => import('../routes/User/Login/Step2'),
                models: ['user'],
            }, {
                path: 'Step3',
                name: '第三步',
                component: () => import('../routes/User/Login/Step3'),
                models: ['user'],
            }, {
                path: '/',
                name: '登陆界面',
                component: () => import('../routes/User/Login/main'),
                models: ['user'],
            }
        ]
    },
    {
        path: 'forgetPwd',
        name: '忘记密码',
        component: () => import('../routes/User/ForgetPwd'),
        models: ['user'],
    },
    {
        path: 'register',
        name: '用户注册',
        component: () => import('../routes/User/Register'),
        models: ['user'],
    }
]

export default UserRouter;