const express = require("express");
const { checkAccessTokens } = require("../middlewares/verifyToken");
const router = express();

router.get('/add', checkAccessTokens, (req, res) => {
  
})


module.exports = router