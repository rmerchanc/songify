const readline = require('readline');
const fetch = require('node-fetch');

 

const fetchUrl = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

 

  while (true) {
    const method = await new Promise(resolve => {
      rl.question('Enter the HTTP method (GET, DELETE, PUT, or POST), or type "exit" to quit: ', answer => {
        resolve(answer);
      });
    });

 

    if (method.toLowerCase() === 'exit') {
      rl.close();
      break;
    }

 

    const url = await new Promise(resolve => {
      rl.question('Enter the URL: http://localhost:3000/api/v1/', answer => {
        resolve('http://localhost:3000/api/v1/' + answer);
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

 

      try {
        const response = await fetch(url, requestOptions);
        const contentType = response.headers.get('content-type');

 

        if (contentType.includes('application/json')) {
          const jsonData = await response.json();
          console.log('Response (JSON):', jsonData);
        } else if (contentType.includes('application/xml')) {
          const xmlData = await response.text();
          console.log('Response (XML):', xmlData);
        } else if (contentType.includes('text/html')) {
          const plain = await response.text();
          console.log('Response (text):', plain);
        }        
        else {
          console.log('Unsupported content type:', contentType);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.log('Invalid input');
    }
  }
};

 

fetchUrl();