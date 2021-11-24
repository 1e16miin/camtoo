const GeoFenceService = require("../../services/GeoFenceService");
const express = require('express')


const router = express()


router.get('/geo-fence', async (req,res) => {
  
  try {
    const geoFenceInstance = GeoFenceService(1,1)
    const result = await geoFenceInstance.getBuildings()
    return res.status(200).send(result)
  } catch (err) {
    console.log(err)
    res.status(400).send({error:"데이터를 찾는 과정에 오류가 발생하였습니다."})
  }
})

router.get("/building/member", async (req, res) => {
  const {profile_id, building_id} = req.query
  try {
    const geoFenceInstance = GeoFenceService(1, profile_id);
    const result = await geoFenceInstance.getMembers(building_id);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 찾는 과정에 오류가 발생하였습니다." });
  }
});

router.post("/building/enter", async (req, res) => {
  const { profile_id, building_id } = req.body
  try {
    const geoFenceInstance = GeoFenceService(1, profile_id);
    await geoFenceInstance.entrance(building_id);
    return res.status(200).send("ok");
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
})


router.delete("/building/exit", async (req, res) => {
  const { profile_id, building_id } = req.body;
  try {
    const geoFenceInstance = GeoFenceService(1, profile_id);
    await geoFenceInstance.exit(building_id);
    return res.status(200).send("ok");
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "데이터를 생성하는 과정에 오류가 발생하였습니다." });
  }
});


router.post("/building/member/message/send")

module.exports = router