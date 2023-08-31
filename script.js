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

    if (passwordValue !== confirmPasswordValue) {
      alert('Пароли не совпадают');
    } else {
      const userData = {
        username: usernameValue,
        email: emailValue,
        password: passwordValue
      };

      fetch('http://192.168.62.81:3000/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      .then(response => {
        if (response.status === 403) {
          return response.json().then(data => {
            if (data.message === 'username') {
              alert('Пользователь с таким именем уже существует');
            } else if (data.message === 'email') {
              alert('Пользователь с таким email уже существует');
            } else if (data.message === 'usernamemail') {
              alert('Пользователь с таким именем и email уже существует');
            } else {
              throw new Error('Ошибка сервера');
            }
          });
        } else if (response.status === 200) {
          alert('Пользователь успешно создан');
          location.reload();
        } else {
          throw new Error('Ошибка сервера');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
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
