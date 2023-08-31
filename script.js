document.addEventListener('DOMContentLoaded', function() {
  const usernameInput = document.querySelector('input[type="text"]');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[1];
  const registerButton = document.querySelector('#btn');

  function checkInputs() {
    const usernameValue = usernameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();

    if (usernameValue !== '' && emailValue !== '' && passwordValue !== '' && confirmPasswordValue !== '') {
      registerButton.disabled = false;
    } else {
      registerButton.disabled = true;
    }
  }

  function checkPasswords() {
    const usernameValue = usernameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();
	const scriptPath = '/var/www/zotero/admin/create-user.sh';
  	//const exec = require('child_process').exec;
    if (passwordValue !== confirmPasswordValue) {
      alert('Passwords do not match');
    } else { 
  	const userData = {
        username: usernameValue,
        email: emailValue,
        password: passwordValue
      };
	console.log(userData);
      fetch('http://192.168.62.81:3000/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      .then(response => response.json())
      .then(data => {
        alert('User created');
        location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }

  usernameInput.addEventListener('input', checkInputs);
  emailInput.addEventListener('input', checkInputs);
  passwordInput.addEventListener('input', checkInputs);
  confirmPasswordInput.addEventListener('input', checkInputs);

  registerButton.addEventListener('click', function(event) {
    event.preventDefault();
    checkPasswords();
  });
});
