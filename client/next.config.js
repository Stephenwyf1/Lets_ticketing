module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300; //被用作刷新网页，300毫秒刷新一次
        return config;
    }
};