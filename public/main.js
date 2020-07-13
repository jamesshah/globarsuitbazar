// import { Connect } from "twilio/lib/twiml/VoiceResponse";

const btn = document.getElementById("chat_btn");
// Pusher.logToConsole = true;
// var connected = false;
// var room;

function connect(timestamp) {
  var promise = new Promise((resolve, reject) => {
    fetch("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp: timestamp }),
    })
      .then((res) => res.json())
      .then((data) => {
        return Twilio.Video.connect(data.token, { name: data.room });
      })
      .then((_room) => {
        connected = true;
        // console.log();
        resolve(_room);
      })
      .catch(() => reject());
  });
  return promise;
}

// function buttonHandler(e) {
//   // e.preventDefault();
//   var pusher = new Pusher("3784f3ae668680287aa1", {
//     cluster: "ap2",
//     authEndPoint: "/pusher/auth",
//   });
//   const channel = pusher.subscribe("presence-call-agent");
//   console.log(channel);
//   channel.bind("pusher:subscription_succeeded", () => {
//     const triggered = channel.trigger("client-chat-request", {
//       msg: "I want to chat",
//     });
//   });

//   channel.bind("client-chat-accepted", (data) => {
//     console.log(data);
//     const timestamp = String(Date.now());
//     connect(timestamp).then((data) => console.log(data));
//   });

//   // location.href += "video";
// }

function buttonHandler(e) {
  location.href += "video";
}

btn.addEventListener("click", buttonHandler);
