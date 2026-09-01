const router = require("express").Router();
const {register,profile,login} = require("../controllers/captain.controller");

router.post("/register", register);
 router.post("/login", login);
router.get("/profile", profile);
router.get("/test", (req, res) => {
    res.send("Hello, captain Service!");
})

module.exports = router;