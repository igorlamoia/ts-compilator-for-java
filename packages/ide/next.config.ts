const withTM = require("next-transpile-modules")([
  "@ts-compilator-for-java/compiler",
]);

module.exports = withTM({
  webpack: (config, { isServer }) => {
    // Ensure that webpack processes the compiler package
    if (!isServer) {
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        include: [require("path").resolve(__dirname, "../compiler")],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["next/babel", "@babel/preset-typescript"],
          },
        },
      });
    }
    return config;
  },
});
