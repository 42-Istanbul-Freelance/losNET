const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    allowedHosts: 'all',
    client: {
      // HTTPS sayfada otomatik olarak wss:// kullanır
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  }
})
