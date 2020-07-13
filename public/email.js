const form = document.getElementById("query_form");
const name = document.getElementById("name");
const email = document.getElementById("email");
const message = document.getElementById("message");

form.onsubmit = (e) => {
  e.preventDefault();
  let data = [];

  for (i = 0; i < form.length - 1; i++) {
    data[i] = form.elements[i].value;
  }
  const formData = {
    name: data[0],
    email: data[1],
    message: data[2],
  };

  fetch("/db/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      location.href = `${location.origin}` + "/message";
    })
    .catch((err) => {
      console.log(err);
    });
};
