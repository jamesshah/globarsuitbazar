const express = require("express");
const router = express.Router();
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

router.post("/", function (request, response) {
  // console.log(request.body);

  const identity = request.body.name;
  const roomName = request.body.room;
  // console.log(identity);

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  var token = new AccessToken(
    process.env.ACC_SID,
    process.env.API_SID,
    process.env.API_SECRET_KEY
  );

  // Assign the generated identity to the token
  token.identity = identity;

  const grant = new VideoGrant((room = roomName));
  // Grant token access to the Video API features
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    room: roomName,
    token: token.toJwt(),
  });
});

module.exports = router;
