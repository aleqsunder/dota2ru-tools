var default_vars = {
	'f-color': '#989899',
	'f-time-color': '#989899',
	'f-background': '#1a1a1a',
	'f-chat-background': '#282828'
}, vars = {
	'f-color': get('f-color', true) || default_vars['f-color'],
	'f-time-color': get('f-time-color', true) || default_vars['f-time-color'],
	'f-background': get('f-background', true) || default_vars['f-background'],
	'f-chat-background': get('f-chat-background', true) || default_vars['f-chat-background']
}
	
function changebodycolor() {
	var attr = this.getAttribute('var'),
		color = this.value || vars[attr];
		
	set(attr, color);
	styleSet(attr, color);
	
	vars[attr] = color;
}

function styleSet (name, value) { qs('body').style.setProperty(`--${name}`, value) }

function toDefault () {
	var input = this.parentElement.querySelector('input'),
		name = input.getAttribute('var');
	
	input.value = default_vars[name];
	
	styleSet(name, default_vars[name]);
	set(name, default_vars[name]);
	
	vars[name] = default_vars[name];
}

function chatSetting () {
	var name = this.getAttribute('caller');
	
	set(name, this.checked);
	Chat.getChatMessages(true);
}

function onFullWindow() {
	if (chatFulled.classList.contains('fullpage'))
		chatFulled.classList.remove('fullpage');
	else
		chatFulled.classList.add('fullpage');
	
	if (chatFulled.classList.contains('bottomfixed'))
		chatFulled.classList.remove('bottomfixed');
		
}

function onBottomFixed() {
	if (chatFulled.classList.contains('bottomfixed'))
		chatFulled.classList.remove('bottomfixed');
	else
		chatFulled.classList.add('bottomfixed');
	
	if (chatFulled.classList.contains('fullpage'))
		chatFulled.classList.remove('fullpage');
}

function loading (bool) {
	if (bool) {
		if (!(typeof bool == boolean)) return;
	}
	
	var loader = document.createElement('div');
	loader.className = 'chatLoader';
	loader.innetHTML = '';
}

function notify_turn () {
	var turn = get('chatTurn') || 'false',
		chatFull = qs('#chatFull h3.content-title .fa-bell');
	
	if (turn == 'false') {
		if (Notification.permission != 'granted') {
			Notification.requestPermission((permission) => {
				switch (permission) {
					case "granted":
						set('chatTurn', true);
						
						openAlert ({
							titleOf: 'Чат',
							text: 'Уведомления чата включены!'
						});
						
						if (chatFull.classList.contains('red')) {
							chatFull.classList.remove('red');
						}
						break;
					case "denied":
						openAlert ({
							titleOf: 'Чат',
							text: `<p>Вы отключили уведомления в табе!</p>
							<p style='display: inline-flex;'>Я не смогу включить их сам <img data-shortcut=":IllyaShock:" data-smile="1" title=":IllyaShock:" src="/img/forum/emoticons/IllyaShock.png" style="width: 30px; display: inline-flex; vertical-align: center; margin: -5px 0;"></p><br>
							<p>Для их включения тебе придётся в настройках своего браузера убрать запрет на уведомления с сайта dota2.ru</p>`
						});
						break;
				}
			});
		} else {
			set('chatTurn', true);
			
			openAlert ({
				titleOf: 'Чат',
				text: 'Уведомления включены!'
			});
			
			if (chatFull.classList.contains('red')) {
				chatFull.classList.remove('red');
			}
		}
	} else {
		set('chatTurn', false);
		
		openAlert ({
			titleOf: 'Чат',
			text: 'Уведомления отключены!'
		});
		
		if (!chatFull.classList.contains('red')) {
			chatFull.classList.add('red');
		}
	}
}

function open_image () {
	var src = qs('img', this.parentElement).src,
		alemg = document.createElement('alemg'),
		img = document.createElement('img');
		
	alemg.setAttribute('onclick', `close_image.call(this)`);
	alemg.className = 'fa fa-spinner';
	img.src = src;
	img.onload = () => {
		var offsetW = img.width / (window.outerWidth - 50),
			offsetH = img.height / (window.outerHeight - 50),
			offset = (offsetW > offsetH) ? offsetW : offsetH;
			
		if (offset > 1)
			img.style.setProperty('zoom', 1 / offset);
		
		alemg.classList.add('endAnimate');
		img.style.setProperty('opacity', '1');
	}
	
	alemg.appendChild(img);
	document.body.appendChild(alemg);
	
	setTimeout(() => {
		alemg.style.setProperty('opacity', '1');
	}, 1);
}

function close_image () {
	this.style.setProperty('opacity', '0');
	
	setTimeout(() => {
		this.outerHTML = '';
	}, 300);
}

function giu () { 
	return localStorage.getItem('d2s-ignored-user') != null
		? JSON.parse(localStorage.getItem('d2s-ignored-user'))
		: [];
}

function siu (username) {
	let un = giu();
	
	if (un.indexOf(username) == -1) {
		un.push(username);
		localStorage.setItem('d2s-ignored-user', JSON.stringify(un));
		Utils.notify(`Пользователь ${username} теперь игнорируется в чате`);
		
		return true;
	}
	
	Utils.notify(`Пользователь уже игнорируется`);
	return false;
}

function riu (username) {
	let un = giu();
	
	if (un.indexOf(username) != -1) {
		un.splice(un.indexOf(username), 1);
		localStorage.setItem('d2s-ignored-user', JSON.stringify(un));
		Utils.notify(`Пользователь ${username} больше не игнорируется`);
	} else {
		Utils.notify(`Данный пользователь не игнорируется Вами`);
	}
}

function asett_ignoreUser (username) {
	ignoreUser(username);
	
	qs('asettignore ignore-list').append(dom(`<div class="user-ignored" onclick="asett_unignoreUser('${username}')">
		<div class="user-ignored-name">${username}</div> <div class="user-ignored-remove fa fa-minus"></div>
	</div>`))
}

function ignoreUser (username) {
	siu(username);
	sendToBlackList(username);
	
	let reveal = qsa('.reveal.showed');
	if (reveal.length > 0)
		reveal.forEach((i) => {i.outerHTML = ''})
}

function asett_unignoreUser (username) {
	let asi = qsa('asettignore ignore-list .user-ignored');
	
	asi.forEach((i) => {
		if (qs('.user-ignored-name', i).innerHTML == username) i.outerHTML = '';
	});
	
	unignoreUser(username);
}

function unignoreUser (username) {
	riu(username);
	removeFromBlackList(username);
	
	let active = qsa('.userMenu.active');
	active.forEach((i) => {
		i.classList.remove('active');
		qs('.chatAvatar', i.parentElement).style.removeProperty('pointer-events');
	});
}

function sendToBlackList (username) {
	qsa(`[name="${username}"]`).forEach((i) => {
		if (!i.classList.contains('removeUserMessageAnimation')) {
			i.classList.add('removeUserMessageAnimation');
			i.classList.remove('animate');
		}
	});
}

function removeFromBlackList (username) {
	qsa(`[name="${username}"]`).forEach((i) => {
		if (i.classList.contains('removeUserMessageAnimation')) {
			i.classList.remove('removeUserMessageAnimation');
			i.classList.add('animate');
		}
	});
}

function open_menu (id) {
	let itm = qs(".userMenu", this.parentElement);
	qs(`li#${id}`).style.setProperty('z-index', '2');
	this.style.setProperty('pointer-events', 'none');
	
	let qrs = document.createElement('div');
	qrs.classList = "reveal";
	qrs.addEventListener('click', (e) => {
		e.target.classList.remove('showed');
		itm.classList.remove('active');
		
		setTimeout(() => {
			e.target.outerHTML = '';
			qs(`li#${id}`).style.removeProperty('z-index');
			this.style.removeProperty('pointer-events');
		}, 300);
	});
	qs('#chatBlock ul.chatMessages').append(qrs);
	
	setTimeout(() => {
		qrs.classList.add('showed');
	}, 1);
	
	itm.classList.contains('active') != true && itm.classList.add('active');
	qrs.classList.contains('showed') != true && qrs.classList.add('showed');
}

function openIgnoreList () {
	let asi = qs('asettignore ignore-list');
	asi.innerHTML = '';
	
	giu().forEach((i) => {
		asi.append(dom(`<div class="user-ignored" onclick="asett_unignoreUser('${i}')">
			<div class="user-ignored-name">${i}</div> <div class="user-ignored-remove fa fa-minus"></div>
		</div>`));
	})
	
	openWindow('asettignore');
}