import slugify from "slugify";
// see https://github.com/simov/slugify/issues/59
slugify.extend({ ä: "ae" });
slugify.extend({ ö: "oe" });
slugify.extend({ ü: "ue" });

export default (title) =>
  title
    ? slugify(title.toLowerCase().replace(/"/g, "zoll"), {
        remove: /[*+~.,´()'"!:@/#]/g,
      })
    : "";
