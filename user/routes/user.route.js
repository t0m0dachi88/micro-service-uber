const router = require("express").Router();
const {register,profile,login} = require("../controllers/user.controller");

router.post("/register", register);
 router.post("/login", login);
router.get("/profile", profile);
router.get("/test", (req, res) => {
    res.send("Hello, User Service!");
})

module.exports = router;