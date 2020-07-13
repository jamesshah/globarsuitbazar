Pusher.logToConsole = true;
// let connected = false;
const muteBtn = document.getElementById("mute");
const disconnectBtn = document.getElementById("disconnect");
const container = document.getElementById("container");
let room;
let timer;
let mute = false;
let timestamp;

window.onbeforeunload = (e) => {
  e.preventDefault();
  e.returnValue = "Your call will be disconnected.";
};

// connect to twilio video room
function connect(timestamp, roomName) {
  var promise = new Promise((resolve, reject) => {
    fetch("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: timestamp, room: roomName }),
    })
      .then((res) => res.json())
      .then((data) => {
        return Twilio.Video.connect(data.token, {
          name: data.room,
          audio: true,
          video: true,
        });
      })
      .then((_room) => {
        // connected = true;
        room = _room;
        room.participants.forEach(participantConnected);
        room.on("participantConnected", participantConnected);
        room.on("participantDisconnected", participantDisconnected);
        resolve(room);
      })
      .catch(() => reject());
  });
  return promise;
}

// add local track to the browser
function addLocalVideo() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("container").style.display = "block";
  document.getElementById("callButtons").style.display = "block";
  document.getElementById("local").style.display = "block";
  disconnectBtn.addEventListener("click", disconnect);
  var video = document.getElementById("local").firstElementChild;
  Twilio.Video.createLocalTracks().then((tracks) => {
    tracks.forEach((track) => {
      var LocalTrack = track.attach();
      video.appendChild(LocalTrack);
    });
    // var videoTrack = track.attach();
    // videoTrack.setAttribute("class", "embed-responsive-item");
    // videoTrack.setAttribute("controls", "controls");
  });
}

//add video/audio track,whenever a participant is added to the twilio room
function participantConnected(participant) {
  var participant_div = document.createElement("div");
  participant_div.setAttribute("id", participant.sid);
  participant_div.setAttribute("class", "participant");

  var tracks_div = document.createElement("div");
  tracks_div.setAttribute("class", "embed-responsive embed-responsive-16by9");
  participant_div.appendChild(tracks_div);

  container.appendChild(participant_div);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed)
      trackSubscribed(tracks_div, publication.track);
  });
  participant.on("trackSubscribed", (track) =>
    trackSubscribed(tracks_div, track)
  );
  participant.on("trackUnsubscribed", trackUnsubscribed);
}

// disconnect user from the room on leave event
function participantDisconnected(participant) {
  document.getElementById(participant.sid).remove();
}

// adding video in the div.
function trackSubscribed(div, track) {
  var participantVideoTrackElement = track.attach();
  participantVideoTrackElement.setAttribute("class", "embed-responsive-item");
  div.appendChild(participantVideoTrackElement);
}
// removing video from the div
function trackUnsubscribed(track) {
  track.detach().forEach((element) => element.remove());
}

// this function gets called when body is loaded
function loaded() {
  // console.log("doc loaded");
  // document.getElementById("container").style.display = "none";

  timer = setTimeout(() => {
    alert("Sorry, our agents are busy. Send us your query.");
    location.replace(`${location.origin}/email`);
  }, 3 * 60 * 1000); // 3 mins timer

  // New Pusher Object
  var pusher = new Pusher("f42ec837fcdb5bb28b97", {
    cluster: "ap2",
    authEndPoint: "/pusher/auth",
  });

  // Subscribing to presence channel
  var channel = pusher.subscribe("presence-call-agent1");
  // console.log(channel);

  // Triggering an event on subscription_succeeded event
  channel.bind("pusher:subscription_succeeded", () => {
    if (!(pusher.channel("presence-call-agent1").members.count == 2)) {
      pusher.unsubscribe("presence-call-agent1");
      // alert("Agent 1 is busy.");
      channel = pusher.subscribe("presence-call-agent2");
      channel.bind("pusher:subscription_succeeded", () => {
        if (!(pusher.channel("presence-call-agent2").members.count == 2)) {
          pusher.unsubscribe("presence-call-agent2");
          clearTimeout(timer);
          alert("Sorry, our agents are busy. Send us your query.");
          location.replace(`${location.origin}/email`);
        } else {
          const triggered = channel.trigger("client-chat-request", {
            msg: "I want to chat.",
          });
          channel.bind("client-chat-accepted", (data) => chatAccepted(data));
        }
      });
    } else {
      const triggered = channel.trigger("client-chat-request", {
        msg: "I want to chat",
      });
    }
  });

  // Listening to client chat accepted event triggered by call agent
  channel.bind("client-chat-accepted", (data) => chatAccepted(data));

  channel.bind("client-chat-declined", (data) => {
    if (channel.name == "presence-call-agent1") {
      // console.log("Agent1 declined");
      pusher.unsubscribe("presence-call-agent1");
      channel = pusher.subscribe("presence-call-agent2");
      channel.bind("pusher:subscription_succeeded", () => {
        if (!(pusher.channel("presence-call-agent2").members.count == 2)) {
          pusher.unsubscribe("presence-call-agent2");
          clearTimeout(timer);
          alert("Sorry, our agents are busy. Send us your query.");
          location.replace(`${location.origin}/email`);
        } else {
          const triggered = channel.trigger("client-chat-request", {
            msg: "I want to chat.",
          });
          channel.bind("client-chat-declined", () => {
            clearTimeout(timer);
            alert("Sorry, our agents are busy. Send us your query.");
            location.replace(`${location.origin}/email`);
          });
        }
      });
    }
  });

  channel.bind("client-chat-disconnected", (data) => {
    disconnect();
  });
}

function chatAccepted(data) {
  console.log(data);
  console.log(data.roomName);
  const roomName = data.roomName;
  clearTimeout(timer);
  timestamp = String(Date.now());
  connect(timestamp, roomName)
    .then(() => {
      // console.log(data);
      addLocalVideo();
      fetch("/db/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: data.roomName,
          userName: timestamp,
          answered: true,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.error(err));
    })
    .catch((err) => {
      alert("Connection Failed.Please send us your query.");
      location.replace(`${location.origin}/email`);
      console.error(err);
    });
}

// disconnect event handler function
function disconnect() {
  try {
    // console.log("inside disconnect function");
    // console.log(timestamp);
    room.disconnect();
    while (container.lastElementChild)
      container.removeChild(container.lastElementChild);

    fetch(`/db/log/${timestamp}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
    location.replace(`${location.origin}/message`);
  } catch (err) {
    console.error(err);
    alert("Error Occured.Please send us your query.");
    location.replace(`${location.origin}/email`);
  }
}

muteBtn.addEventListener("click", () => {
  if (!mute) {
    room.localParticipant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.disable();
    });
    muteBtn.innerText = "Unmute";
    mute = true;
  } else {
    room.localParticipant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.enable();
    });
    muteBtn.innerText = "Mute";
  }
});
