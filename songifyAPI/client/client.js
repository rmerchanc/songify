/**const fetch = require("node-fetch");
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
  });*/

  const readline = require('readline');
  const fetch = require('node-fetch');
  
  const fetchUrl = async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    const method = await new Promise(resolve => {
      rl.question('Enter the HTTP method (GET, DELETE, PUT, or POST): ', answer => {
        resolve(answer);
      });
    });
  
    const url = await new Promise(resolve => {
      rl.question('Enter the URL: ', answer => {
        resolve(answer);
      });
    });
  
    if (method && url) {
      let requestOptions = {
        method: method.toUpperCase()
      };
  
      if (method.toUpperCase() === 'PUT' || method.toUpperCase() === 'POST') {
        const jsonPayload = await new Promise(resolve => {
          rl.question('Enter the JSON payload: ', answer => {
            resolve(answer);
          });
        });
  
        requestOptions.headers = {
          'Content-Type': 'application/json'
        };
  
        requestOptions.body = jsonPayload;
      }
  
      rl.close();
  
      try {
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        console.log('Response:', data);
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      rl.close();
      console.log('Invalid input');
    }
  };
  
  fetchUrl();
  