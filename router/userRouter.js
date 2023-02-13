const express = require("express");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const saltRounds = 10; // 8, 10, 12, 14

const userRouter = new express.Router();

const verifyUser = (req, res, next) => {
  if (req.session.isVerified) {
    next();
  } else {
    return res.status(404).json({ message: "Please login first" });
  }
};

async function getUser(req, res, next) {
  const { username } = req.params;
  console.log(`getUser req.params.username: ${req.params.username}`);
  let user;
  try {
    user = await User.findOne({ username });
    // return res.json(user)
    if (user == undefined) {
      return res.status(404).json({ message: "can't find user!" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
  res.user = user;
  next();
}

userRouter.get("/user", verifyUser, async (req, res) => {
  try {
    const userList = await User.find().limit(10).sort({ username: 1 });
    // console.log(`router get user: ${JSON.stringify(res.json(user))}`)
    res.send(userList);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// deprecated
// router.get('/user/loginByEmail/:email/:password', getUser, async (req, res) => {
//     res.send(res.user)
// })
// deprecated
// router.get('/user/loginByName/:username/:password', getUser, async (req, res) => {

//     res.send(res.user)
// })

// test
userRouter.get("/user/:username", verifyUser, getUser, async (req, res) => {
  res.send(res.user);
});

// login
userRouter.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  let user;
  try {
    if (email == undefined && username == undefined) {
      return res.status(404).json({ message: "can't find user!" });
    }
    if (email == undefined) {
      user = await User.findOne({ username }).exec();
      if (!user) {
        return res.status(404).json({ message: "can't find user!" });
      }
      let result = await bcrypt.compare(password, user.password);
      if (result) {
        req.session.isVerified = true;
        console.log(req.session);
        return res.status(200).send(user);
      } else {
        return res.status(404).json({ message: "login failed" });
      }
    } else {
      user = await User.findOne({ email }).exec();
      if (!user) {
        return res.status(404).json({ message: "can't find user!" });
      }
      let result = await bcrypt.compare(password, user.password);
      if (result) {
        req.session.isVerified = true;
        console.log(req.session);
        return res.status(200).send(user);
      } else {
        return res.status(404).json({ message: "login failed" });
      }
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
});

//logout
userRouter.post("/logout", async (req, res) => {
  req.session.destroy();
  return res.send("You had been logout");
});

// register
userRouter.post("/user/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    // throw new Error('add error!!!')
    const postHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ email, username, password: postHash });
    const saveUser = await newUser.save();
    const registerUserSuccess = Object.assign({}, saveUser["_doc"], {
      errorMessage: "register successfully",
    });
    console.log({ registerUserSuccess });
    res.status(201).json(registerUserSuccess);
    // res.status(201).json(saveUser)
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// delete user account
userRouter.delete("/user/:username", verifyUser, getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Delete user successful!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// modify user account
// TODO: add personal info
userRouter.patch("/user/:username", verifyUser, getUser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const patchHash = await bcrypt.hash(password, saltRounds);
    if (email != null) res.user.email = email;
    if (password != null) res.user.password = patchHash;

    // throw new Error('update error!!!')
    const updateUser = await res.user.save();
    res.json(updateUser);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = userRouter;
