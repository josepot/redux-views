const { NODE_ENV } = process.env

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 11']
        },
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false,
        loose: true
      }
    ]
  ],
  plugins: [
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs'
  ].filter(Boolean)
}
