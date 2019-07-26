module.exports = {
	devServer: {
		// open: process.platform === 'darwin',
		// host: 'localhost',
		open: false, //配置自动启动浏览器 
		proxy: {
			'/api': {
					target: 'http://127.0.0.1:8195'
			} 
		}
	},
	transpileDependencies:['vuetify']
}