const express = require("express");
const { initializeApp } = require("firebase/app");
const { getDatabase, onValue, update, ref } = require('firebase/database');
const request = require("request")
const rp = require("request-promise")
const cors = require("cors")
const { Vonage } = require('@vonage/server-sdk')
require('dotenv').config();

const app = express();
app.use(express.json())
app.use(cors())

const firebaseApp = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG))
const database = getDatabase(firebaseApp)

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET
})

app.listen(3001, () => {
  console.log("Running on port 3001")
})

app.post("/CreateNewAccessCode", async (req, res) => {
  // Get the parameter
  const phoneNumber = req.body?.phoneNumber;
  if (!phoneNumber)
    return res
      .status(400)
      .send({
        message: "Invalid parameter"
      })

  // Generate a random access code of 6-digit
  let accessCode = "";
  for (let i = 0; i < 6; i++) {
    accessCode += Math.floor(Math.random() * 10).toString()
  }

  const dbUserRef = ref(database, `/${phoneNumber}`)
  try {
    await update(dbUserRef, {
      "accessCode": accessCode,
      "favoriteGithubUsers": {}
    })

    const fromPhoneNumber = process.env.VONAGE_FROM_TEL
    const message = `Access code: ${accessCode}`
    await vonage.sms.send({
      to: phoneNumber,
      from: fromPhoneNumber,
      text: message
    })
      .then(response => {
        return res
          .status(200)
          .send({
            message: `Access code has been sent to your phone number. Please check your SMS to get the code.`
          })
      })
      .catch(error => {
        return res
          .status(500)
          .send({
            message: error
          })
      });
  } catch (error) {
    return res
      .status(500)
      .send({
        message: error.message
      })
  }
})

app.post("/ValidateAccessCode", async (req, res) => {
  // Get the parameter
  const phoneNumber = req.body?.phoneNumber;
  const accessCode = req.body?.accessCode;
  if (!phoneNumber || !accessCode)
    return res
      .status(400)
      .send({
        message: "Invalid parameter"
      })

  // Get the correct access code from Database
  const dbUserRef = ref(database, `/${phoneNumber}`)
  const userInfo = await (new Promise((resolve) => {
    onValue(dbUserRef, (snapshot, key) => {
      resolve(snapshot.val())
    })
  }))

  if (correctAccessCode === undefined) {
    return res
      .status(404)
      .send({
        message: "User not found"
      })
  }

  // Validate the access code
  if (userInfo.accessCode !== correctAccessCode && correctAccessCode !== "") {
    return res
      .status(403)
      .send({
        message: "Access code is not correct"
      })
  } else {
    try {
      await update(dbUserRef, {
        "accessCode": "",
        "favoriteGithubUsers": userInfo.favoriteGithubUsers
      })
    } catch (error) { }

    return res
      .status(200)
      .send({
        success: true
      })
  }
})

app.get("/searchGithubUsers", (req, res) => {
  const q = req.query.q || "";
  const pageNumber = req.query.page || 1;
  const itemsPerPage = req.query.per_page || 10;

  const url = `https://api.github.com/search/users?q=${q}&per_page=${itemsPerPage}&page=${pageNumber}`
  request({
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0'
    }
  }, function (error, response, body) {
    if (error) {
      return res
        .status(500)
        .send(error.message)
    }

    body = JSON.parse(body)

    return res
      .status(200)
      .send({
        total_count: body.total_count,
        items: body.items
      })
  });
})

app.get("/findGithubUserProfile", (req, res) => {
  const userID = req.query.github_user_id;
  if (!userID)
    return res
      .status(404)
      .send({
        "message": "Invalid parameter"
      })

  const url = `https://api.github.com/user/${userID}`
  request({
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0'
    }
  }, function (error, response, body) {
    if (error) {
      return res
        .status(500)
        .send(error.message)
    }

    const result = JSON.parse(body)
    return res
      .status(200)
      .send({
        login: result.login,
        id: result.id,
        avatar_url: result.avatar_url,
        html_url: result.html_url,
        public_repos: result.repos_url,
        followers: result.followers_url
      })
  });
})

app.post("/likeGithubUser", async (req, res) => {
  // Get the parameter
  const phoneNumber = req.body?.phone_number;
  const githubUserID = req.body?.github_user_id;
  const isLike = req.body?.is_like;
  if (!phoneNumber || !githubUserID || isLike === undefined)
    return res
      .status(400)
      .send({
        message: "Invalid parameters"
      })

  const dbUserRef = ref(database, `/${phoneNumber}`)

  // Get the user info from Database
  const userInfo = await (new Promise((resolve) => {
    onValue(dbUserRef, (snapshot, key) => {
      resolve(snapshot.val())
    })
  }))

  if (userInfo === undefined) {
    return res
      .status(404)
      .send({
        message: "User not found"
      })
  }

  let objectToUpdate = {
    accessCode: userInfo.accessCode
  }
  if (isLike) {
    objectToUpdate["favoriteGithubUsers"] = { ...userInfo.favoriteGithubUsers }
    objectToUpdate["favoriteGithubUsers"][`${githubUserID}`] = githubUserID
  } else {
    let listFavoriteUsers = { ...userInfo.favoriteGithubUsers };

    if (Object.keys(listFavoriteUsers).includes(githubUserID.toString()))
      delete listFavoriteUsers[githubUserID.toString()]

    objectToUpdate["favoriteGithubUsers"] = listFavoriteUsers
  }

  try {
    await update(dbUserRef, objectToUpdate)

    return res
      .status(200)
      .send()
  } catch (error) {
    return res
      .status(500)
      .send({
        message: error.message
      })
  }
})

app.get("/getUserProfile", async (req, res) => {
  // Get the parameter
  const phoneNumber = req.query.phone_number;
  if (!phoneNumber)
    return res
      .status(400)
      .send({
        message: "Invalid parameter"
      })

  const dbUserRef = ref(database, `/${phoneNumber}`)

  // Get the user info from Database
  const userInfo = await (new Promise((resolve) => {
    onValue(dbUserRef, (snapshot, key) => {
      resolve(snapshot.val())
    })
  }))

  if (userInfo === undefined) {
    return res
      .status(404)
      .send({
        message: "User not found"
      })
  }

  return res
    .status(200)
    .send({
      favorite_github_users: userInfo.favoriteGithubUsers || {}
    })
})

app.get("/findMultipleGithubUserProfile", async (req, res) => {
  const userIDs = req.query.github_user_id;

  if (!userIDs)
    return res
      .status(404)
      .send({
        "message": "Invalid parameter"
      })

  const results = {}
  let responses = userIDs
    .map(userID =>
      rp({
        url: `https://api.github.com/user/${userID}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0'
        }
      })
        .then(result => {
          result = JSON.parse(result)
          results[result.id] = {
            login: result.login,
            id: result.id,
            avatar_url: result.avatar_url,
            html_url: result.html_url,
            public_repos: result.repos_url,
            followers: result.followers_url
          }
        })
        .catch(e => {
          console.log(e)
        }));

  Promise.all(responses)
    .then(() => {
      res
        .status(200)
        .send(results)
    })
    .catch((error) => {
      res
        .status(500)
        .send({
          message: error
        })
    })
})
