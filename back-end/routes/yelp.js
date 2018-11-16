'use strict';

const express = require('express');
const router = express.Router();
const yelp = require('yelp-fusion');

const apiKey = 'Mby6T0WZ0703xdfGwlMo6hxAK5UOQ3_UZLNLpNRNQGu7bgcvUA9LORyhrrNaz4MCXRIKyupAty3hirOJjEc1vKSdm7h7tsv5k0LlXSZSJQpyURhLR3yh3Pu6JZW3W3Yx';

// const searchRequest = {
//   // term: 'indian', 
//   location: '84111',
//   // limit:1,
//   price:3
// };

const client = yelp.client(apiKey);

router.post('/crave-search', (req, res) => {
    let searchData = req.body;
    // client.search(searchData).then(response => {
    //     const result = response.jsonBody;
    //     res.status(200).send(result);
    // });

    client.search(searchData).then(response => {
        const result = response.jsonBody;
        res.status(200).send(result);
      }).catch(e => {
        console.log("ERROR!",e);
        res.status(200).send(false);
      });
});

module.exports = router;