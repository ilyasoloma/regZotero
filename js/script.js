document.addEventListener('DOMContentLoaded', function() {
	const usernameSignUp = document.querySelector('.form-signup input[name="username"]');
	const emailSignUp = document.querySelector('.form-signup input[name="email"]');
	const passwordSignUp = document.querySelector('.form-signup input[name="password"]');
	const confirmpasswordSignUp = document.querySelector('.form-signup input[name="confirmpassword"]');
	const usernameSignIn = document.querySelector('.form-signin input[name="username"]');
	const passwordSignIn = document.querySelector('.form-signin input[name="password"]');
	const loginButton = document.querySelector('.btn-signin');
	const registerButton = document.querySelector('.btn-signup');
	const successMessage = document.querySelector('.success');
	if  (checkCookies()){
		redirectToLibrary();
	}
	
	function checkCookies(){
	const cookieArray = document.cookie.split('; ');
	const cookies = {};
	cookieArray.forEach(cookie => {
        const [key, value] = cookie.split('=');
        	cookies[key] = value;});
        	
    	if (!cookies['userSlug'] || !cookies['userId'] || !cookies['apiKey']){
    		return false;
    	}
    	else{
    		return true;
    	}
}
	
	function login(event) {
		event.preventDefault(); // Предотвращение перезагрузки формы
		const usernameValue = usernameSignIn.value.trim();
		const passwordValue = passwordSignIn.value.trim();
		if (usernameValue === '' || passwordValue === '') {
			displayMessage('error', 'signin', 'Пожалуйста, заполните все поля');
			return;
		}
		const userData = {
			username: usernameValue,
			password: passwordValue,
			name: "Automatic Zotero Web-library Key",
			access: {
				user: {
					library: true,
					notes: true,
					write: true,
					files: true
				},
				groups: {
					all: {
						library: true,
						write: true
					}
				}
			}
		};
		fetch('https://192.168.62.111/cors/http://192.168.62.111:8080/keys', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(userData)
		}).then(response => {
			if (response.status === 403) {
				displayMessage('error', 'signin', 'Неправильное имя пользователя или пароль');
			} else if (response.status === 201) {
				response.json().then(data => {
					const userSlug = data.username;
					const userId = data.userID;
					const apiKey = data.key;
					setCookie('userSlug', userSlug);
    					setCookie('userId', userId);
    					setCookie('apiKey', apiKey);
					redirectToLibrary();
				});
			} else {
				throw new Error('Ошибка сервера');
			}
		}).catch(error => {
			console.error('Ошибка:', error);
		});
	}
	function setCookie(name, value) {
    		document.cookie = `${name}=${value}; path=/`;
	}
	function redirectToLibrary() {
    		window.location.href = 'http://192.168.62.111:8001/index.html';
	}
	
	// Восстановление данных из localStorage
	function restoreInputs() {
		const savedUsername = localStorage.getItem('username');
		const savedEmail = localStorage.getItem('email');
		const savedPassword = localStorage.getItem('password');
		const savedConfirmPassword = localStorage.getItem('confirmpassword');
		if (savedUsername) usernameSignUp.value = savedUsername;
		if (savedEmail) emailSignUp.value = savedEmail;
		if (savedPassword) passwordSignUp.value = savedPassword;
		if (savedConfirmPassword) confirmpasswordSignUp.value = savedConfirmPassword;
	}

	function checkInputs(event) {
		event.preventDefault(); // Предотвращение перезагрузки формы
		const usernameValue = usernameSignUp.value.trim();
		const emailValue = emailSignUp.value.trim();
		const passwordValue = passwordSignUp.value.trim();
		const confirmPasswordValue = confirmpasswordSignUp.value.trim();
		if (usernameValue === '' || emailValue === '' || passwordValue === '' || confirmPasswordValue === '') {
			displayMessage('error', 'signup', 'Пожалуйста, заполните все поля');
			return false;
		} else {
			checkPasswords(event);
		}
	}

	function checkPasswords(event) {
		event.preventDefault(); // Предотвращение перезагрузки формы
		const usernameValue = usernameSignUp.value.trim();
		const emailValue = emailSignUp.value.trim();
		const passwordValue = passwordSignUp.value.trim();
		const confirmPasswordValue = confirmpasswordSignUp.value.trim();
		// Сохранение данных в localStorage
		localStorage.setItem('username', usernameValue);
		localStorage.setItem('email', emailValue);
		localStorage.setItem('password', passwordValue);
		localStorage.setItem('confirmpassword', confirmPasswordValue);
		if (passwordValue !== confirmPasswordValue) {
			displayMessage('error', 'signup', 'Пароли не совпадают');
			return;
		}
		const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?№«»—–\s]/g;
		var checkPass = passwordValue.replace(regex, '');
		if (checkPass !== passwordValue) {
			displayMessage('error', 'signup', 'В пароле недопустимы специальные символы и пробелы');
			return;
		}
		const userData = {
			username: usernameValue,
			email: emailValue,
			password: passwordValue
		};
		fetch('create-user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(userData)
		}).then(response => {
			if (response.status === 403) {
				return response.json().then(data => {
					if (data.message === 'username') {
						displayMessage('error', 'signup', 'Пользователь с таким именем уже существует');
					} else if (data.message === 'email') {
						displayMessage('error', 'signup', 'Пользователь с таким email уже существует');
					} else if (data.message === 'usernamemail') {
						displayMessage('error', 'signup', 'Пользователь с таким именем и email уже существует');
					} else {
						throw new Error('Ошибка сервера');
					}
				});
			} else if (response.status === 200) {
				displayMessage('success', 'signup', 'Пользователь успешно создан');
				localStorage.clear(); // Очистка localStorage при успешной регистрации
			} else {
				throw new Error('Ошибка сервера');
			}
		}).catch(error => {
			console.error('Ошибка:', error);
		});
	}

	function displayMessage(type, btn, message) {
		successMessage.classList.add('success-left');
		if (btn == 'signup') {
			successMessage.innerHTML = `
      <svg width="270" height="270" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 60 60" id="check">
        <path fill="${type === 'error' ? '#d11000' : '#ffffff'}" d="M40.61,23.03L26.67,36.97L13.495,23.788c-1.146-1.147-1.359-2.936-0.504-4.314c3.894-6.28,11.169-10.243,19.283-9.348c9.258,1.021,16.694,8.542,17.622,17.81c1.232,12.295-8.683,22.607-20.849,22.042c-9.9-0.46-18.128-8.344-18.972-18.218c-0.292-3.416,0.276-6.673,1.51-9.578" />
        <div class="successtext">
          <p>${message}</p>
          <button class="btn-back">Назад</button>
        </div>
      </svg>
    `;
		} else {
			successMessage.innerHTML = `
     <svg width="270" height="270" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 60 60" id="check">
        <path fill="${type === 'error' ? '#d11000' : '#ffffff'}" d="M40.61,23.03L26.67,36.97L13.495,23.788c-1.146-1.147-1.359-2.936-0.504-4.314c3.894-6.28,11.169-10.243,19.283-9.348c9.258,1.021,16.694,8.542,17.622,17.81c1.232,12.295-8.683,22.607-20.849,22.042c-9.9-0.46-18.128-8.344-18.972-18.218c-0.292-3.416,0.276-6.673,1.51-9.578" />
        <div class="successtext">
          <p>${message}</p>
          <button class="btn-back">Назад</button>
        </div>
      </svg>
    `;
		}
		document.querySelector('.btn-back').addEventListener('click', function() {
			successMessage.classList.remove('success-left');
			successMessage.innerHTML = '';
			if (type !== 'error') {
				location.reload(true);
			}
			if (btn == "signup") {
				$(".nav").removeClass("nav-up");
				$(".form-signup-left").removeClass("form-signup-down");
				$(".frame").removeClass("frame-short");
			}
			if (btn == "signin") {
				$(".frame").toggleClass("frame-short");
				$(".nav").toggleClass("nav-up");
				$(".form-signin").toggleClass("form-signin-left");
			}
		});
	}
	loginButton.addEventListener('click', login);
	registerButton.addEventListener('click', checkInputs);
	restoreInputs();
});
// jQuery код остался без изменений
$(function() {
	$(".btn").click(function() {
		$(".form-signin").toggleClass("form-signin-left");
		$(".form-signup").toggleClass("form-signup-left");
		$(".frame").toggleClass("frame-long");
		$(".signup-inactive").toggleClass("signup-active");
		$(".signin-active").toggleClass("signin-inactive");
		// $(".forgot").toggleClass("forgot-left");   
		$(this).removeClass("idle").addClass("active");
	});
});
$(function() {
	$(".btn-signup").click(function() {
		$(".nav").toggleClass("nav-up");
		$(".form-signup-left").toggleClass("form-signup-down");
		$(".frame").toggleClass("frame-short");
	});
});
$(function() {
	$(".btn-signin").click(function() {
		//$(".btn-animate").toggleClass("btn-animate-grow");
		// $(".welcome").toggleClass("welcome-left");
		//$(".cover-photo").toggleClass("cover-photo-down");
		$(".frame").toggleClass("frame-short");
		//$(".profile-photo").toggleClass("profile-photo-down");
		// $(".forgot").toggleClass("forgot-fade");
		//$(".form-signup-left").toggleClass("form-signup-down");
		$(".nav").toggleClass("nav-up");
		$(".form-signin").toggleClass("form-signin-left");
	});
});
