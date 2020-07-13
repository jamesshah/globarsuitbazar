Pusher.logToConsole = true;
const clientDiv = document.getElementById("client-msg");
const name = document.getElementById("name");
const clientData = document.getElementById("data");
const buttonDiv = document.getElementById("buttons");
const acceptBtn = document.getElementById("acceptBtn");
const declineBtn = document.getElementById("declineBtn");
const agentName = document.getElementById("agentName");
const callButtons = document.getElementById("callButtons");
const disconnectBtn = document.getElementById("disconnect");
const container = document.getElementById("container");
const main = document.getElementById("main");
const muteBtn = document.getElementById("mute");
const ringtone = new Audio("../ringtone.mp3");
let connected = false;
let mute = false;
let room;

// console.log(agentName.innerHTML);
agent_name = String(agentName.innerHTML).trim();

var pusher = new Pusher("3784f3ae668680287aa1", {
  cluster: "ap2",
  authEndPoint: "/pusher/auth",
});

const channel = pusher.subscribe(`presence-call-${agent_name}`);
// console.log(channel);

channel.bind("pusher:subscription_succeeded", () => {
  channel.bind("client-chat-request", (data, metadata) => {
    // console.log(data);
    // console.log(metadata.user_id);
    ringtone.loop = true;
    ringtone.play();
    name.innerHTML += String(metadata.user_id);
    clientData.innerHTML += data.msg;
    buttonDiv.style.display = "block";
  });
});

channel.bind("pusher:member_removed", () => {
  location.reload(true);
});

function addLocalVideo() {
  buttonDiv.style.display = "none";
  callButtons.style.display = "block";
  main.style.display = "none";
  document.getElementById("container").style.display = "block";
  document.getElementById("local").style.display = "block";
  var video = document.getElementById("local").firstElementChild;
  // Twilio.Video.createLocalAudioTrack().then((track) => {
  //   var audioTrack = track.attach();
  //   video.appendChild(audioTrack);
  // });
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

function connect(name) {
  var promise = new Promise((resolve, reject) => {
    fetch("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name, room: name }),
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
        connected = true;
        room = _room;
        room.participants.forEach(participantConnected);
        room.on("participantConnected", participantConnected);
        room.on("participantDisconnected", participantDisconnected);
        // console.log(_room);
        resolve(room);
      })
      .catch(() => reject());
  });
  return promise;
}

function participantConnected(participant) {
  var participant_div = document.createElement("div");
  participant_div.setAttribute("id", participant.sid);
  participant_div.setAttribute("class", "participant");

  var tracks_div = document.createElement("div");
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

  // updateParticipantCount();
}

// disconnect user from the room on leave event
function participantDisconnected(participant) {
  document.getElementById(participant.sid).remove();
  // updateParticipantCount();
}

// adding video in the div.
function trackSubscribed(div, track) {
  div.appendChild(track.attach());
}
// removing video from the div
function trackUnsubscribed(track) {
  track.detach().forEach((element) => element.remove());
}

// Changing Button State and Participants count when a user leaves the room.
async function disconnect() {
  await room.disconnect();
  // while (container.lastChild.id != "local")
  //   container.removeChild(container.lastChild);
  channel.trigger("client-chat-disconnected", {
    message: "Call disconnected.",
  });
  location.reload(true);

  // button.innerHTML = "Join call";
  connected = false;
  // updateParticipantCount();
}

acceptBtn.addEventListener("click", () => {
  ringtone.pause();
  if (!connected) {
    addLocalVideo();
    // const timestamp = String(Date.now());
    connect(agent_name).then((res) => {
      console.log(res);
      channel.trigger("client-chat-accepted", {
        roomName: res.name,
      });
    });
  } else {
    connected = false;
  }
});

declineBtn.addEventListener("click", () => {
  ringtone.pause();
  name.innerHTML = "";
  clientData.innerHTML = "";
  buttonDiv.style.display = "none";

  channel.trigger("client-chat-declined", {
    agent: agentName,
  });
});

disconnectBtn.addEventListener("click", disconnect);

muteBtn.addEventListener("click", () => {
  if (!mute) {
    room.localParticipant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.disable();
    });
    mute = true;
    muteBtn.innerHTML = "Unmute";
  } else {
    room.localParticipant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.enable();
    });
    mute = false;
    muteBtn.innerHTML = "Mute";
  }
});
