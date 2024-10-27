import withTM from "next-transpile-modules";
const withTMInstance = withTM(["@ts-compilator-for-java/compiler"]);
module.exports = withTMInstance({
  reactStrictMode: true,
});
