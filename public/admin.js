function openPage(pageName, elmnt) {
  // var i, tabcontent, tablinks;
  // tabcontent = document.getElementsByClassName("tabcontent");
  // for (i = 0; i < tabcontent.length; i++) {
  //   tabcontent[i].style.display = "none";
  // }
  // tablinks = document.getElementsByClassName("tablink");
  // for (i = 0; i < tablinks.length; i++) {
  //   tablinks[i].style.backgroundColor = "";
  // }
  // document.getElementById(pageName).style.display = "block";
  // elmnt.style.backgroundColor = "#007bff";

  if (pageName == "call-logs") getLog();
  else getMessage();
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("call-logs-tab").click();

function getLog() {
  fetch("/db/log")
    .then((res) => res.json())
    .then(async (data) => {
      //   console.log(data);
      await addLog(data);
      document.getElementById("log-table").style.display = "table";
    })
    .catch((err) => console.log(err));
}

function getMessage() {
  fetch("/db/message")
    .then((res) => res.json())
    .then(async (data) => {
      await addMessage(data);
      document.getElementById("message-table").style.display = "table";
    })
    .catch((err) => console.log(err));
}

async function addLog(callLogs) {
  const callLogBody = document.getElementById("logs-data");

  if (callLogBody.children.length != callLogs.length) {
    callLogs.forEach((callLog) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${callLog.agentName}</td>
                        <td>${callLog.userName}</td>
                        <td>${callLog.answered ? "Answered" : "Not"}</td>
                        <td>${callLog.startTime}</td>
                        <td>${callLog.endTime}</td>`;

      callLogBody.appendChild(row);
    });
  }
}

async function addMessage(messages) {
  const messageBody = document.getElementById("message-data");
  if (messageBody.children.length != messages.length) {
    messages.forEach((message) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${message.name}</td>
                          <td>${message.email}</td>
                          <td>${message.message}</td>
                          <td>${message.createdAt}</td>`;

      messageBody.appendChild(row);
    });
  }
}
