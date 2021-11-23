const GeoFenceService = require("../../services/GeoFenceService");
const express = require('express')


const router = express()


router.get('/geo-fence', async (req,res) => {
  
  try {
    const geoFenceInstance = GeoFenceService(1)
    const result = geoFenceInstance.getBuildings(1)
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    res.status(400).send({error:"데이터를 찾는 과정에 오류가 발생하였습니다."})
  }
})


module.exports = router