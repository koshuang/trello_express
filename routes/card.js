var express = require('express');
var router = express.Router();
const card = require('../controller/cardController')

router.get('/',card.generateReport)

module.exports = router;