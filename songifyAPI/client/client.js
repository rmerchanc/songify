const fetch = require("node-fetch");
// GET request
fetch('http://localhost:3000/api/v1/artist', {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => {
    console.log('GET response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

