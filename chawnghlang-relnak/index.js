'use strict';

const axios = require('axios');
const Entities = require('html-entities').XmlEntities;
const fs = require('fs');

const entities = new Entities();

async function main(page = 1) {
  try {
    const posts = await getPosts(page);
    posts.forEach((post, index) => {
      let title = post.title.rendered.match(/^(.*?). (.*?)$/);
      fs.appendFileSync(
        'db.json',
        `{ "id": ${Number(title[1])}, "title": "${decode(title[2]).toUpperCase()}" },\n`
      );
      const file = `./build/${Number(title[1])}.html`;
      title = `<h4 align="center">${title[2].toUpperCase()}</h4>`;
      title = decode(title);
      let content = post.content.rendered.split('\n');
      content = content.filter(content => {
        if (content) {
          return !content.startsWith('<p>&nbsp;</p>');
        }
      });
      content = content.map(value => {
        value = decode(value);
        value = value.replace(/<\/b> <b>/g, ' ');
        value = value.replace(/<\/b><b>/g, '');
        value = value.replace(/<\/i> <i>/g, ' ');
        value = value.replace(/<\/i><i>/g, '');
        value = value.replace(/em>/g, 'i>');
        value = value.replace(/<br \/>/g, '<br>');
        value = value.replace(/<b><br>/g, '<br><b>');
        //23
        value = value.replace(/ <\/b>/g, '</b>');
        //51
        value = value.replace(/strong>/g, 'b>');
        return value;
      });
      content = content.join('\n');
      content = content.replace(/<br><b>\n/g, '<br>\n<b>');
      //49
      content = content.replace(
        /<p><i><b>Aa ruangin<\/b><\/i><b><i>;<\/i><br>\n/g,
        '<p><i><b>Aa ruangin:</b></i><br>\n<b>'
      );
      //47
      content = content.replace(
        /<p><i><b>Aa ruangin<\/b><\/i><b><i>:<\/i><br>\n/g,
        '<p><i><b>Aa ruangin:</b></i><br>\n<b>'
      );
      content = content.replace(
        /<p><i><b>Aa ruanginn<\/b><\/i><b><i>:<\/i><br>\n/g,
        '<p><i><b>Aa ruangin:</b></i><br>\n<b>'
      );
      //24
      content = content.replace(
        /<p><b><i>Aa ruangin:<br>\n<\/i>/g,
        '<p><i><b>Aa ruangin:</b></i><br>\n<b>'
      );
      let lyrics = `${title}\n${content}`;
      fs.writeFileSync(file, lyrics);
    });
    console.log(page);
    page = page + 1;
    main(page);
  } catch (error) {
    console.error('Done');
  }
}

function decode(value) {
  value = entities.decode(value);
  value = value.replace(/‘/g, "'");
  value = value.replace(/’/g, "'");
  value = value.replace(/“/g, '"');
  value = value.replace(/”/g, '"');
  value = value.replace(/…/g, '...');
  return value;
}

function getPosts(page = 1) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get('http://www.cmckorea.info/wp-json/wp/v2/posts', {
        params: {
          categories: 38,
          page: page
        }
      });
      resolve(res.data);
    } catch (error) {
      reject(error.response);
    }
  });
}

main();
