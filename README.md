# Strapi plugin strapi-fuzzy-search

A plugin for Strapi Headless CMS that provides the ability to add a weighted fuzzy search to any content type.

## How to use

Enable the fuzzy-search plugin in the `./config/plugins.js` of your Strapi project.

```
module.exports = ({ env }) => ({
  // ...

  "fuzzy-search": {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: "api::author.author",
          modelName: "project",
          fuzzysortOptions: {
            characterLimit: 300,
            threshold: -600,
            limit: 10,
            allowTypo: true,
            keys: [
              {
                name: "name",
                weight: 100,
              },
              {
                name: "description",
                weight: -100,
              },
            ],
          },
        },
        {
          uid: "api::article.article",
          modelName: "newsentry",
          fuzzysortOptions: {
            characterLimit: 500,
            threshold: -800,
            limit: 15,
            allowTypo: false,
            keys: [
              {
                name: "title",
                weight: 200,
              },
              {
                name: "intro",
                weight: -200,
              },
            ],
          },
        },
      ],
    },
  },

  // ...
});
```
