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
      const file = `./build/${Number(title[1])}.html`;
      title = `<h4 align="center">${title[2]}</h4>`;
      title = decode(title);
      let content = post.content.rendered.split('\n');
      content = content.filter(content => {
        if (content) {
          return !content.startsWith('<p>[') && !content.startsWith('<h3>');
        }
      });
      content = content.map(value => {
        value = decode(value);
        value = value.replace(/<p>(\d+|CHO|C4)([.|:]+) /, '<p><b>$1$2 </b>');
        //514
        value = value.replace('<p>Doh is G.</p>', '<p>Doh is G</p>');
        //98
        value = value.replace(
          '<p><a href="http://3.ka/" target="_blank" rel="nofollow">3.Ka</a> zawt tikah Khrih a ka damh, ka rilh tam ca zaang a tlawm, ka mitcaw, tihnak kha a um, Him in lam a ka hmuhsak.</p>',
          '<p><b>3. </b>Ka zawt tikah Khrih a ka damh, ka rilh tam ca zaang a tlawm, ka mitcaw, tihnak kha a um, Him in lam a ka hmuhsak.</p>'
        );
        return value;
      });
      content = content.join('\n');
      let lyrics = `${title}\n${content}`;
      //513
      lyrics = lyrics.replace(/<br \/>\n/g, ' ');
      if (file === './build/1.html') {
        if (page === 1 && index === 1) {
          fs.writeFileSync(file, lyrics);
        }
      } else if (file === './build/2.html') {
        if (page === 1 && index === 2) {
          fs.writeFileSync(file, lyrics);
        }
      } else if (file === './build/487.html') {
        if (page === 49 && index === 7) {
          fs.writeFileSync(file, lyrics);
        }
      } else {
        fs.writeFileSync(file, lyrics);
      }
    });
    console.log(page);
    page = page + 1;
    // if (page < 10) main(page);
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
          categories: 18,
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
