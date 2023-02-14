// eslint-disable-next-line no-undef
module.exports = (path, options) => {
    return options.defaultResolver(path, {
        ...options,
        packageFilter: (pkg) => {
            if (pkg?.name?.includes('preact')) {
                Object.values(pkg.exports).forEach((exp) => {
                    exp.browser = exp.require;
                });
                return pkg;
            }
            return pkg;
        },
    });
};
