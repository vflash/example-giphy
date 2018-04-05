module.exports = {
  plugins: [
    require('autoprefixer')({
        browsers: ['> 3%', 'ie >= 10', 'last 2 versions']
    })
  ]
}