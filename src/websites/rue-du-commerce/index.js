const cheerio = require('cheerio');
const fetch = require('node-fetch');
const colors = require('colors');
const nodemailer = require('nodemailer');

const { urlBuilder } = require('../../utils');

const HANDLE = 'RDV';
const URL = 'https://www.rueducommerce.fr';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'autobot.ramani@gmail.com',
    pass: "Maison4802+"
  }
});

// Read the README file for info
class RueDuCommerce {
  constructor(searchArray, options) {
    this.searches = paramsBuilder(searchArray)
    this.i = 0
    this.cardArray = ""
  }

  runChecks() {
    return this.searches.map(({ url, path, articleName }) => fetch(urlBuilder(url, path))
      .then(this.getLinks)
      .then((links) => this.getAvailability(links, url, articleName)))
  }

  sendMailTo(){
    if (this.i > 0) {
      var mailOptions = {
        from: 'autobot.ramani@gmail.com',
        to: 'kinglargo@gmail.com',
        subject: `'Found ${this.i} Card(s)!`,
        html: this.cardArray
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
    }
  }

  getLinks(response) {
    return response.text()
      .then((html) => {
        const $ = cheerio.load(html);
        return $('.item__title a').map((_, el) => $(el).attr('href')).toArray();
      })
  }

  getAvailability(links, url, articleName) {
    return Promise.all(links.map((link) => {
      return fetch(urlBuilder(url, link))
        .then(getHtml)
        .then((html) => !cheerio.load(html)('#product_action a').first().toString().includes('display:none'))
        .then((isAvailable) => {

          if (isAvailable) {
            console.log(`${articleName}:`, `${urlBuilder(url, link)}`.white.bgGreen);
            this.i++
            this.cardArray += `${articleName}: ${urlBuilder(url, link)}<br>`
          } else {
            console.log(`${articleName}:`, `${urlBuilder(url, link)}`.white);
          }
          return isAvailable
        })
    }))

  }
}

const getHtml = (res) => res.text();
const searchCase = (search) => search.split(' ').filter(Boolean).join('-');

const paramsBuilder = (array) => {
  return array
    .filter(Boolean)
    .map(({ articleName, search }) => {
      return { websiteName: HANDLE, articleName, url: URL, path: `/r/${searchCase(search)}.html` };
    });
}

module.exports = { RueDuCommerce };
