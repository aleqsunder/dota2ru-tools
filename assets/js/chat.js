var default_vars =
{
	'f-color': '#989899',
	'f-time-color': '#989899',
	'f-background': '#1a1a1a',
	'f-chat-background': '#282828'
},
vars =
{
	'f-color': get('f-color', true) || default_vars['f-color'],
	'f-time-color': get('f-time-color', true) || default_vars['f-time-color'],
	'f-background': get('f-background', true) || default_vars['f-background'],
	'f-chat-background': get('f-chat-background', true) || default_vars['f-chat-background']
}
	
function changebodycolor()
{
	var attr = this.getAttribute('var'),
		color = this.value || vars[attr];
		
	set(attr, color);
	styleSet(attr, color);
	
	vars[attr] = color;
}

function styleSet (name, value)
{ __('body').style.setProperty(`--${name}`, value) }

function toDefault ()
{
	log(this, this.parentElement);
	var input = this.parentElement.querySelector('input'),
		name = input.getAttribute('var');
	
	input.value = default_vars[name];
	
	styleSet(name, default_vars[name]);
	set(name, default_vars[name]);
	
	vars[name] = default_vars[name];
}

function chatSetting ()
{
	log(this);
	var name = this.getAttribute('caller');
	
	set(name, this.checked);
	Chat.getChatMessages(true);
}

function onFullWindow()
{
	if (chatFulled.classList.contains('fullpage'))
		chatFulled.classList.remove('fullpage');
	else
		chatFulled.classList.add('fullpage');
	
	if (chatFulled.classList.contains('bottomfixed'))
		chatFulled.classList.remove('bottomfixed');
		
}

function onBottomFixed()
{
	if (chatFulled.classList.contains('bottomfixed'))
		chatFulled.classList.remove('bottomfixed');
	else
		chatFulled.classList.add('bottomfixed');
	
	if (chatFulled.classList.contains('fullpage'))
		chatFulled.classList.remove('fullpage');
}

function loading (bool)
{
	if (bool)
	{
		if (!(typeof bool == boolean)) return;
	}
	
	var loader = document.createElement('div');
	loader.className = 'chatLoader';
	loader.innetHTML = '';
}

function notify_turn ()
{
	var turn = get('chatTurn') || 'false',
		chatFull = __('#chatFull h3.content-title .fa-bell');
	
	if (turn == 'false')
	{
		if (Notification.permission != 'granted')
		{
			Notification.requestPermission
			( function (permission) {
				switch (permission)
				{
					case "granted":
						set('chatTurn', true);
						
						openAlert
						({
							titleOf: 'Чат',
							text: 'Уведомления чата включены!'
						});
						
						if (chatFull.classList.contains('red'))
						{
							chatFull.classList.remove('red');
						}
						break;
					case "denied":
						openAlert
						({
							titleOf: 'Чат',
							text: `<p>Вы отключили уведомления в табе!</p>
							<p style='display: inline-flex;'>Я не смогу включить их сам <img data-shortcut=":IllyaShock:" data-smile="1" title=":IllyaShock:" src="/img/forum/emoticons/IllyaShock.png" style="width: 30px; display: inline-flex; vertical-align: center; margin: -5px 0;"></p><br>
							<p>Для их включения тебе придётся в настройках своего браузера убрать запрет на уведомления с сайта dota2.ru</p>`
						});
						break;
				}
			});
		}
		else
		{
			set('chatTurn', true);
			
			openAlert
			({
				titleOf: 'Чат',
				text: 'Уведомления включены!'
			});
			
			if (chatFull.classList.contains('red'))
			{
				chatFull.classList.remove('red');
			}
		}
	}
	else
	{
		set('chatTurn', false);
		
		openAlert
		({
			titleOf: 'Чат',
			text: 'Уведомления отключены!'
		});
		
		if (!chatFull.classList.contains('red'))
		{
			chatFull.classList.add('red');
		}
	}
}

function open_image ()
{
	var src = __('img', this.parentElement).src,
		alemg = document.createElement('alemg'),
		img = document.createElement('img');
		
	alemg.setAttribute('onclick', `close_image.call(this)`);
	alemg.className = 'fa fa-spinner';
	img.src = src;
	img.onload = () =>
	{
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
	
	setTimeout
	( () => {
		alemg.style.setProperty('opacity', '1');
	}, 1);
}

function close_image ()
{
	this.style.setProperty('opacity', '0');
	
	setTimeout
	( () => {
		this.outerHTML = '';
	}, 300);
}