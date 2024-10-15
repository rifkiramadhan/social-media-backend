const slugify = text => {
  //! Extract content inside <h1> tags
  const h1Match = text.match(/<h1>(.*?)<\/h1>/);
  const h1Content = h1Match ? h1Match[1] : ''; // Get content or empty string if no match

  //! Slugify the extracted content
  return h1Content
    .toLowerCase()
    .replace(/\s+/g, '-') //! Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') //! Remove all non-word chars
    .replace(/\-\-+/g, '-') //! Replace multiple hyphens with a single hyphen
    .replace(/^-+/, '') //! Trim hyphens from the start
    .replace(/-+$/, ''); //! Trim hyphens from the end
};

module.exports = { slugify };
