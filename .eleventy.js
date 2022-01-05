const dayjs = require("dayjs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("js");

  eleventyConfig.addLiquidFilter("formatDate", (dateStr) =>
    dayjs(dateStr).format("MMM.D")
  );

  return {
    pathPrefix: "/genuary-2022/",
  };
};
