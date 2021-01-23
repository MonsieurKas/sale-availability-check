// Import website you want to use
const { RueDuCommerce } = require('./websites/rue-du-commerce');

// TO IGNORE
const defaultRetryTimer = 1800e3; // = 90 seconds

// STUFF YOU CAN CUSTOMIZE
const customRetryTimer = null; // Set the value you want

const searchArray = [
  { articleName: '3080 RTX', search: '3080-rtx-10go' },
  { articleName: '3070 RTX', search: '3070-rtx-8go' },
  { articleName: '3080 RTX', search: '3080-rtx' },
  { articleName: '3070 RTX', search: '3070-rtx' },
  { articleName: '3080 RTX', search: '3080' },
  { articleName: '3070 RTX', search: '3070' },
  // { articleName: 'GT 710', search: 'gt-710' }
];
const rueDuCommerce = new RueDuCommerce(searchArray);

const searchFn = () => {
  const searches = [
    // Put here whatever's suggested in the website you want to check's README file
    rueDuCommerce.runChecks(),
    // rueDuCommerce.sendMailTo()
  ];

  if (!searchArray.length) return console.log(`You forgot to setup in the searchArray. Check the README files for more info.`);
  if (!searches.length) return console.log(`You forgot to setup in the searches. Check the README files for more info.`);

  Promise
    .all(searches.flatMap((v) => v))
    .then((_) => {
      console.log();
      setTimeout(searchFn, customRetryTimer || defaultRetryTimer);
      rueDuCommerce.sendMailTo()
    });
};

searchFn();
