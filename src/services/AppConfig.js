const configuration = {
	inDev : process.env.NODE_ENV === 'development',
	withSSL : process.env.ENABLE_SSL === 'true',
	sslPort : process.env.SSL_PORT || 8443,
	port : process.env.PORT || 3000,
	env : process.env.NODE_ENV || 'development',
	hotReload: process.env.HOT_RELOAD === "true",
	hotReloadPort: parseInt(process.env.HOT_RELOAD_PORT || "30303"),
	baseDomain: process.env.BASE_DOMAIN || 'frontend.local',

    defaultPageTTL: 60,

	Frontend: {
		env: process.env.NODE_ENV || 'development',
		hotReload: process.env.HOT_RELOAD === "true",
		hotPort: 30303
	}
};


module.exports = configuration;
