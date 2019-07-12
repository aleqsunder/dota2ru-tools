/**
 *	Неизменяемые переменные
 */
const version = '0.1.1.2', tinyMods = [ 'threads', 'conversation', 'settings' ],
	otherMods = [ 'conversations', 'category', 'forums', 'notifications', 'unknown' ];

/**
 *	Все основные переменные для удобства
 */
var afp = __('fullpage'),
	smileSett = __('smiles category', afp),
	smileList = __('smile-list', afp),
	asspages = $_('asett pages[name="pagesetting"] page', afp),
	asstabes = __('asett pages[name="tabsetting"]', afp),
	assscroll = __('asett pages[name="scrollbar"]', afp),
	asschat = __('asettchat pages[name="st"]', afp),
	chess = 'a-dota2smile', storageCache = _getStorage(), 
	storagePage = JSON.parse(localStorage.getItem('page')), 
	cath = JSON.parse(localStorage.getItem('cath')), 
	alert = __('alert', afp), list = [], aflag = true,
	mode = document.location.href.match(/forum\/(.*?)\//), mode = (mode != null)? mode[1] : 'unknown',
	default_vars = {
		'f-color': '#989899',
		'f-time-color': '#989899',
		'f-background': '#1a1a1a',
		'f-chat-background': '#282828'
	},
	vars = {
		'f-color': localStorage.getItem('f-color') || default_vars['f-color'],
		'f-time-color': localStorage.getItem('f-time-color') || default_vars['f-time-color'],
		'f-background': localStorage.getItem('f-background') || default_vars['f-background'],
		'f-chat-background': localStorage.getItem('f-chat-background') || default_vars['f-chat-background']
	};

/*
	Отображение сообщений
*/
if (mode == 'unknown' && __('head title').innerText == 'Форум Dota 2')
{
	function changebodycolor(){
		var attr = this.getAttribute('var'),
			color = this.value || vars[attr];
			
		localSet(attr, color);
		styleSet(attr, color);
		
		vars[attr] = color;
	}
	
	setInterval
	( function () {
		var stab = __('div.smiles-panel ul.tabs');
		
		if (stab)
		{
			stab.querySelectorAll('a').forEach
			( function (a){
				var page = JSON.parse(localStorage.getItem('page')),
					a = a;
					// получаемая переменная может работать только в пределах своей ф-ии
				
				// Проверяем, есть ли вообще такой объект в локалке
				if (page)
				{
					Object.keys(page).forEach
					( function (b, index) {
						var index = a.dataset.cat.toString();
						
						a.textContent = page[index].name;
						
						if (page[index].is == false)
							a.style = 'display: none';
					});
				}
			});
		}
	}, 200);

	$_(`pages[name='colorpicker'] input`).forEach
	(function (a) {
		a.addEventListener("change", changebodycolor, false);
		a.value = vars[a.getAttribute('var')];
	});
	
	styleSet('f-color', vars['f-color']);
	styleSet('f-time-color', vars['f-time-color']);
	styleSet('f-background', vars['f-background']);
	styleSet('f-chat-background', vars['f-chat-background']);
	
	__('input[caller="chat-avatar"]', asschat).checked
		= JSON.parse(localStorage.getItem('--chat-avatar')) === true;
	
	function styleSet (name, value)
	{ __('body').style.setProperty(`--${name}`, value) }
	
	function localSet (name, value)
	{ localStorage.setItem(name, value) }
	
	function toDefault ()
	{
		console.log(this, this.parentElement);
		var input = this.parentElement.querySelector('input'),
			name = input.getAttribute('var');
		
		input.value = default_vars[name];
		
		styleSet(name, default_vars[name]);
		localSet(name, default_vars[name]);
		
		vars[name] = default_vars[name];
	}
	
	function chatSetting ()
	{
		console.log(this);
		var name = this.getAttribute('caller');
		
		localSet(`--${name}`, this.checked);
		Chat.getChatMessages(true);
	}
	
	var old_time = '0',
		array_notify = [];

	Chat.appendToChat = function (data, scroll, skipDuplicates, hideControls)
	{
		scroll = scroll || 'false';
		skipDuplicates = skipDuplicates || 'true';
		
		var can_new = true;
		
		if (old_time > 0)
		{
			if (data.date_sent - old_time > 60)
			{
				can_new = false;
			}
		}
		
		old_time = data.date_sent;
		
		if (skipDuplicates && $('#chatMessage' + data.id).length > 0)
			$('#chatMessage' + data.id).remove();
		
		var enableUserAvatar = JSON.parse(localStorage.getItem('--chat-avatar')) === true,
			chatBlock	= $(".chatMessages"),
			liClass		= (data.visible !== undefined && !data.visible) ? 'not-visible' : '',
			id			= (data.id !== undefined) ? `id="chatMessage${data.id}"` : '',
			username	= (data.username && data.username.length > 0) ? Base64.encode(data.username) : 'NONE',
			youser		= data.user_id == Utils.user_id,
			repeater	= !!enableUserAvatar ? (youser ? ` type='your message'` : '') : '',
			nickname	= Utils.username,
			isGlued = "", html = "", moderation = "";
		
		if (!hideControls)
		{
			if (Utils.isAdmin || Utils.isSuperModerator || Utils.hasPrivilege(Utils.Privileges.chat_moderation))
			{
				if (data.visible !== undefined)
				{
					restoreVisible = !data.visible ? '' : 'display:none';
					removeVisible = data.visible ? '' : 'display:none';
					editVisible = data.edited_by ? '' : 'display:none';
					
					moderation = 
					`<span style="${restoreVisible}" id="${data.id}-restore">
						(<span class="muted">
							Удалил 
							<a id="${data.id}-removeUser" target="_blank" href="members/${data.removed_by_username_parsed}.${data.removed_by}/" style="color:${data.removed_by_nick_color}">
								${data.removed_by_username}
							</a>
							<span id="${data.id}-removeTime" class="date-time" data-time="${data.date_removed}">
								${data.date_removed_parsed}
							</span>) 
							
							<a style="color:#03BE00" title="Восстановить" href="javascript:ChatAdmin.restoreChatMessageDialog(${data.id})">
								[<i class="fa fa-reply"></i>]
							</a>
						</span>
					</span>
					
					<span style="${removeVisible}" id="${data.id}-remove">
						<a style="color:#D40000" title="Удалить" href="javascript:ChatAdmin.removeChatMessageDialog(${data.id})">
							[<i class="fa fa-remove"></i>]
						</a>
					</span>
					
					<span id="${data.id}-edit">
						<a style="color:#26a6a6" title="Редактировать" href="javascript:ChatAdmin.editChatMessageDialog(${data.id})">
							[<i class="fa fa-pencil"></i>]
						</a>
					</span>
					
					<span id="${data.id}-editedby" style="${editVisible}">
						(
						<span class="muted">
							Редактировал 
							<a id="${data.id}-editUser" target="_blank" href="members/${data.edited_by_username_parsed}.${data.edited_by}/" style="color:${data.edited_by_nick_color}">
								${data.edited_by_username}
							</a> 
							
							<span id="${data.id}-editTime" class="date-time" data-time="${data.date_edited}">
								${data.date_edited_parsed}
							</span>
							)
						</span>
					</span>`;
				}
			}
		}
			
		var bgi_style = `background-image: url('${data.user_avatar}'); background-size: contain;`,
			img_str = `<div class='idle-image'><img src='`,
			img_end = `' class='chat-image'><div class='helper fa fa-search' onclick='open_image.call(this)'></div></div>`,
			aud_str = `<audio src='`,
			aud_end = `' controls preload></audio>`,
			text_parsed = Base64.decode(data.content),
			
			// Парс картинок
			text_parsed = text_parsed
				.replace(nickname, `<span class="loggedNick">${nickname}</span>`) 	// Определение вашего никнейма
				.replace(/<img[^>]*>/ig, "<div class='chatSmile'>$&</div>")			// Обрамление смайлов
				
				.replace(/<a[^>]*>(.*?).jpg<\/a>/ig, img_str +"$1.jpg"+ img_end) 	// jpg
				.replace(/<a[^>]*>(.*?).jpeg<\/a>/ig, img_str +"$1.jpeg"+ img_end) 	// jpeg
				.replace(/<a[^>]*>(.*?).png<\/a>/ig, img_str +"$1.png"+ img_end) 	// png
				.replace(/<a[^>]*>(.*?).gif<\/a>/ig, img_str +"$1.gif"+ img_end) 	// gif
				
				.replace(/<a href\=\"https\:\/\/imgur.com\/(.*?)\"[^>]*>(.*?)<\/a>/ig,
							img_str +"https://i.imgur.com/$1.jpg"+ img_end)			// imgur
				.replace(/<a href\=\"https\:\/\/static-cdn.jtvnw.net\/(.*?)\"[^>]*>(.*?)<\/a>/ig,
							img_str + "$2" + img_end)								// steam
				.replace(/<a href\=\"http:\/\/skrinshoter.ru\/[^\/]\/(.*?)"[^>]*>(.*?)<\/a>/ig,
							img_str +"http://skrinshoter.ru/i/$1.png"+ img_end),	// skrinshoter
							
			// Парс голосовых и музыки
			text_parsed = text_parsed
				.replace(/<a[^>]*>https\:\/\/vocaroo\.com\/i\/(.*?)<\/a>/ig, 
				"<audio src='https://s1.vocaroo.com/media/download_temp/Vocaroo_$1.mp3' controls preload></audio>")
				.replace(/<a[^>]*>(.*?).mp3<\/a>/ig, aud_str +"$1.mp3"+ aud_end)
				.replace(/<a[^>]*>(.*?).ogg<\/a>/ig, aud_str +"$1.ogg"+ aud_end)
				.replace(/<a[^>]*>(.*?).wav<\/a>/ig, aud_str +"$1.wav"+ aud_end),
				
			last_message = $('li:last-child', chatBlock),
			chat_avatar = $('.chatAvatar', last_message),
			last_nickname = $('.username', last_message).html() == data.username,
			user_href = `members/${data.username_parsed}.${data.user_id}/`,
			user_nick_v = enableUserAvatar ? (youser ? 'none' : 'inline') : 'inline',
			user_style = `color: ${data.nick_color}; display: ${user_nick_v}`,
			display = (last_nickname == true && can_new)? 'none' : 'inline',
			avatar = 
			`<div class='chatAvatar'>
				<av style="${bgi_style}">
					<div class='avatarController'>
						<btn class='fa fa-user' data-title='Профиль' onclick="location.href = '${user_href}'"></btn>
						<btn class='fa fa-flag' data-title='Жалоба' onclick="Chat.abuseMessageModal(${data.id})"></btn>
					</div>
				</av>
			</div>`,
			chat_message = 
			`<div class="chatMessage" style='display: block'>
				${text_parsed}
			</div>`,
			match_smile = text_parsed.match(/<div[^>]*>(.*?)<\/div>/ig), // Проверяем, есть ли вообще смайлы
			smile_length = (match_smile) ? match_smile.length : 0,
			smile_once = '';
			
		if (last_nickname)
		{
			var last_message_text = text_parsed.replace(/<div(.*?)[<\/]div>/ig, '');
			
			if (last_message_text.trim() == '')
			{
				smile_once = '--f-background: none';
			}
		}
				
			
		if (last_nickname == true && can_new)
		{
			last_message.css('margin-bottom', '3px');
			
			if (chat_avatar) avatar = '';
			
			isGlued = 'glued';
		}
		
		html = 
		`<div id='message-${data.id}' class='fullContentMessage' style='${smile_once}'>
			<div style='display: ${display}'>
				<a style="${user_style}" class="username chat-user-link" data-username="${username}" data-title='Процитировать'>${data.username}</a>
				<span class="chat-time">
					<a class="date-time" data-id="${data.id}" data-time="${data.date_sent}" title="${data.date_sent_parsed}">
						${data.date_sent_parsed}
					</a>
				</span>
			</div>
			${moderation}
			${chat_message}
		</div>`;
		
		if (data.username != nickname || enableUserAvatar != 'inline')
		{
			html = avatar + html;
		}
		
		html = 
		`<li ${id}${repeater} class="${liClass} ${isGlued}">
			${html}
		</li>`;
		
		chatBlock.append(html),
		scroll && this.scrollChat();
	}
	
	// Фикс момента опоздания присвоения appendToChat
	if (!document.querySelector('#chatBlock .fullContentMessage'))
	{
		loading();
		Chat.getChatMessages(true);
		
		var load_interval = setInterval
		( () => {
			if (document.querySelector('#chatBlock .fullContentMessage'))
			{
				loading(false);
				clearInterval(load_interval);
			}
		}, 1000);
	}
	
	// Переназначим ф-ию ради уведомлений
	Chat.getChatMessages = function (full, scroll)
	{
		var chatBlock = $(".chatMessages");
		void 0 === full && (full = !1),
		void 0 === scroll && (scroll = !1);
		var currentMessages = chatBlock.find("li").length;
		Logger.debug(`[chat] getChatMessages(): currently there is ${currentMessages} messages in chat. Is scroll? ${scroll}`),
		full && (Logger.debug("[chat] Clearing chat messages"), chatBlock.find("li").remove()),
		requestHandler.ajaxRequest("/api/chat/getMessages", {
		}, function (response)
		{
			if ("success" !== response.status && (Logger.error("[chat] error getting messages!"), Logger.error("[chat] status: " + response.status)), lastUpdate = Math.floor(Date.now() / 1e3), void 0 !== response.data.length && 0 !== response.data.length)
			{
				if (Logger.debug("[chat] loaded " + response.data.length + " messages"), Logger.debug("[chat] last msg: " + JSON.stringify(response.data[response.data.length - 1])), $("ul.chatMessages").find("li").last().attr("id") === "chatMessage" + response.data[response.data.length - 1].id) Logger.debug("[chat] Skipping appending.");
				else
				{
					for (var i = 0; i < response.data.length; i++) Chat.appendToChat(response.data[i], scroll);
					
					if (localStorage.getItem('chatTurn') == "true")
					{
						var data = response.data[response.data.length-1],
							text = Base64.decode(data.content),
							id = data.id.toString(),
							notify = localStorage.getItem('notify');
						
						if (notify)
						{
							notify = notify.split(',');
							
							if (!Array.isArray(notify))
							{
								notify = [];
							}
							else
							{
								for (var i = 0; i < notify.length; i++)
								{
									if (+id - +notify[i] > 40)
									{
										notify.splice(i, 1);
									}
								}
								
								localStorage.setItem('notify', notify.join());
							}
						}
						else notify = [];
						
						if (notify.indexOf(id) < 0)
						{
							notify.push(id);
							localStorage.setItem('notify', notify.join());
								
							text = text
									.replace(/<a(.*?)vocaroo.com\/i\/(.*?)<\/a>/ig, "[Голосовое]")
									.replace(/<a(.*?)<\/a>/ig, "[Ссылка]")
									.replace(/<img data\-shortcut\=\"(.*?)\"[^>]*>/ig, "$1");
										
							var note = new Notification 
							(
								data.username,
								{
									body: text,
									tab: data.id,
									icon: data.user_avatar
								}
							);
							
							setTimeout( () =>
							{
								note.close();
								
								setTimeout( () =>
								{
									notify[id] = true;
									
									var deleteNotify = localStorage.getItem('notify').split(',');
									deleteNotify.splice(deleteNotify.indexOf(id), 1);
									
									localStorage.setItem('notify', deleteNotify.join());
								}, 30000);
							}, 5000);
						}
					}
					
					Chat._scroll_at_end && Chat.scrollChat()
				}
				Chat.lastMessageDate = moment.unix(response.data[response.data.length - 1].date_sent),
				Chat.updateInterval !== Utils.config.chatUpdateInterval && (Chat.updateInterval = Utils.config.chatUpdateInterval, clearInterval(Chat.chatInterval), Chat.chatUpdateRunning = !1, Chat.runChatInterval())
			}
			else Logger.debug("[chat] no new message loaded. last message received at " + Chat.lastMessageDate.format("HH:mm:ss")),
			Logger.debug("[chat] diff between last msg and current time is " + moment().diff(Chat.lastMessageDate, "seconds") + " seconds"),
			moment().diff(Chat.lastMessageDate, "seconds") >= Utils.config.chatIdleStartInterval && (Logger.debug("[chat] diff more than " + Utils.config.chatIdleStartInterval + " sec. adding updateInterval"), Chat.updateInterval === Utils.config.chatUpdateInterval && (Chat.updateInterval = 0), Chat.updateInterval < 1e4 * Utils.config.chatIdleIntervalLimit && (Chat.updateInterval += Utils.config.chatIdleInterval, clearInterval(Chat.chatInterval), Chat.chatUpdateRunning = !1, Chat.runChatInterval()));
			app.checkTime(),
			(0 === currentMessages || scroll) && Chat.scrollChat()
		})
	}

	// Фикс повторно отправляющихся сообщений

	Forum.sendChatMessage = function () {
		var content = $("#chatMessageInput"),
			contval = content.val();
			
		if (0 === contval.trim().length) return Utils.notify("Нельзя отправить пустое сообщение");
		content.readOnly = true;
		content.val("");
		content.attr('placeholder', 'Идёт отправка сообщения...');
		
		requestHandler.ajaxRequest("/api/chat/sendMessage",
		{
			content: contval
		}, 
		function (response)
		{
			switch (response.status) {
			case "success":
				Chat.getChatMessagesWrapper(!1, !0);
				break;
			case "throttle":
				Utils.notify("Нельзя отправлять сообщения так быстро");
				break;
			case "same":
				Utils.notify("Текущее сообщение дублирует ваше предыдущее");
				break;
			case "contentLength":
				Utils.notify("Слишком длинное сообщение");
				break;
			case "userNotActivated":
				Utils.notify("Пользователь не активирован", "warning")
			}
			
			content.readOnly = false;
			content.attr('placeholder', 'Отправить сообщение');
		})
	}

	/*
		Всё ниже необходимо переписать под сайт и только
	*/

	var chatFulled = __('#chatFull'),
		chatTitle = __('h3.content-title', chatFulled);

	__('a.right').classList.remove('toggle');
	__('a.right').classList.add('fa');
	__('a.right').classList.add('fa-minus');

	chatTitle.appendChild
	(dom(
		`<a onclick="onFullWindow(); return false" data-id="chatBlock" data-title="На весь экран" href="#" class="right fa fa-arrows"></a>`
	));

	chatTitle.appendChild
	(dom(
		`<a onclick="onBottomFixed(); return false" data-id="chatBlock" data-title="Прикрепить к нижней части сайта" href="#" class="right fa fa-angle-down"></a>`
	));
	
	chatTitle.appendChild
	(dom(
		`<a onclick="adoor('asettchat'); return false" data-id="chatBlock" data-title="Настройки расширения" href="#" class="right fa fa-wrench"></a>`
	));
	
	var red = (localStorage.getItem('chatTurn') == 'true') ? '' : ' red';
	chatTitle.appendChild
	(dom(
		`<a onclick="notify_turn(); return false" data-id="chatBlock" data-title="Уведомления" href="#" class="right fa fa-bell${red}"></a>`
	));

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
}

/**
 *	Обновление элементов сайта под текущие значения
 */
function reload ()
{
	if (localStorage.getItem('pages'))
		localStorage.removeItem('pages');
	
	if (!localStorage.getItem('page'))
	{
		localStorage.setItem('page', `{"1":{"name":"Стандартные","is":true},"5":{"name":"Твич","is":true},"6":{"name":"Разное","is":true},"7":{"name":"Dota 2 анимированные","is":true},"9":{"name":"Dota 2 герои","is":true},"11":{"name":"Аниме","is":true},"14":{"name":"Пепа","is":true},"16":{"name":"Dota 2 предметы","is":true},"17":{"name":"LoL","is":true},"18":{"name":"Твич-герои","is":true},"-1":{"name":"Популярные","is":true}}`);
		storagePage = JSON.parse(localStorage.getItem('page'));
	}
	
	// Переприсваиваем все разрешённые вкладки смайлов
	asspages.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a),
			name = __('input[type="text"]', a);
			
		name.value = storagePage[input.value.toString()].name;
		input.checked = storagePage[input.value.toString()].is;
	});
	
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	asstabes.innerHTML = '';
	
	if (!cath)
	{
		localStorage.setItem('cath', `[{"name":"Без категории","index":"100","hidden":"false"}]`);
		cath = JSON.parse(localStorage.getItem('cath'));
	}
	
	var arraytabes = [];
	
	__('listed', smileSett).innerHTML = '';
	
	Object.keys(cath).forEach
	(function (tab) {
		tab = cath[tab];
		console.log(tab, tab.name, tab.index);
		
		arraytabes.push({ name: tab.name, index: tab.index, hidden: tab.hidden });
		
		asstabes.appendChild
		( dom(
			`<page class='check' tab='${tab.name}'>
				<input type='text' mode="withoutfone" name='index' value='${tab.index}'>
				<input type='text' mode="withoutfone" name='tab' value='${tab.name}'>
			</page>`
		));
	});
	
	if (arraytabes)
	{
		arraytabes.sort
		( function (a, b) {
			return parseFloat(a.index) - parseFloat(b.index);
		});
		
		arraytabes.forEach
		( function (a) {
			var isOpen = (a.hidden == 'true')? 'plus' : 'minus',
				classed = (a.hidden == 'true')? 'class="minimized"' : '';
			
			console.log(a.hidden);
			
			smileList.appendChild( dom(
			`<tab alt='${a.name}' index='${a.index}' ${classed}>
				<hit>
					${a.name}
					
					<items>
						<remove class='fa fa-eraser' onclick="delTab('${a.name}')"></remove>
						<close class='fa fa-${isOpen}' onclick="ahide('${a.name}')"></close>
					</items>
				</hit>
			</tab>`));
			
			__('listed', smileSett).appendChild
			(dom(`<tab alt='${a.name}' index='${a.index}' onclick="takeTab('${a.name}')">${a.name}</tab>`));
		});
	}
	
	// Если обнаружены смайлы старого образца - конвертация в новый и обновление
	if (localStorage.getItem('a-dota2smiles'))
	{
		chess = 'a-dota2smiles';
		storageCache = _getStorage();
		
		Object.keys(storageCache).forEach
		( function (name) { add({a: name}) });
		localStorage.removeItem('a-dota2smiles');
		
		chess = 'a-dota2smile';
		save();
		
		console.log(_getStorage);
		
		document.location.reload();
		return false;
	}
	
	// Перебираем все текущие смайлы (с поддержкой старых версий) и сортируем по алфавиту
	list = [];
	Object.keys(storageCache).forEach
	( function (name) {
		var sc = JSON.parse(storageCache[name]);
		
		if (sc.name)
		{
			// Раскрыл для наглядности
			if (sc.canEdit == 'true')
			{
				list.push
				({
					'name': sc.name,
					'tab': (sc.tab || sc.tab == '')? sc.tab : 'Без категории',
					'src': sc.src,
					'canEdit': sc.canEdit,
					'width': sc.width,
					'height': sc.height
				});
			}
			else
			{
				list.push
				({
					'name': sc.name,
					'tab': (sc.tab || sc.tab == '')? sc.tab : 'Без категории',
					'src': sc.src,
					'canEdit': sc.canEdit
				});
			}
		}
	});
	
	list.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
	list.forEach(function (a) { add({a: a}) });
}

reload();

// Если новая версия
if (localStorage.getItem('version') != version)
{
	if (!localStorage.getItem('first'))
	{
		adoor('wellcome');
		
		var qn = $_('wellcome qn', afp),
			len = qn.length,
			i = 0, timer = 0;
		
		function trytodoit () {
			if (i < 1)
			{
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			else
			{
				qn[i-1].style = '';
				qn[i].style.setProperty('max-height', '100px');
				qn[i].style.setProperty('opacity', '1');
			}
			
			i++;
			timer = qn[i-1].innerText.length * 52;
			
			if (i < len)
			{
				setTimeout(trytodoit, timer);
			}
			else
			{
				setTimeout
				( function () {
					adoor('wellcome');
					
					localStorage.setItem('first', 'est zhi');
					localStorage.setItem('version', version);
				}, timer)
			}
		}
		
		trytodoit();
	}
	else
	{
		localStorage.setItem('version', version);
		openAlert({
			wait: true,
			
			titleOf: `Обновление`,
			text: `Вот и вышла долгожданная версия ${version}<br><br>
			Пытаюсь сделать чат лучше для Вас, но без ваших советов не обойтись<br>
			Все подробности и новые гайды в теме на форуме<br><br>
			Хорошего дня)`
		});
	}
}

setInterval
( function () {
	// Получаем активный tinyMCE
	if (typeof tinymce != 'undefined' && tinymce.activeEditor)
	{ var content = tinymce.activeEditor.contentDocument }
	
	if (content)
	{
		var head = __('head style:not(.resized)', content);
		
		// Проверяем, существуют ли (для стабильности, проскакивает "of null")
		if (head)
		{
			// Добавляем стили и присваиваем класс, чтобы больше на глаза не попадался
			head.innerHTML += 'img[data-smile][data-shortcut="canEdit=false"] { width: auto; height: 30px; }';
			head.classList.add('resized');
		}
		
		var allCont = $_('img[data-smile]:not(.resized)', content);
		
		// Если есть неизменённые смайлы
		if (allCont.length > 0)
		{
			allCont.forEach(function (a) {
				var getter = a.dataset.shortcut,
					getters = getter.split('&'),
					list = {};
				
				if (a.dataset.shortcut.indexOf('=') > -1)
				{
					getters.forEach
					( function (b) {
						b = b.split('=');
						
						list[b[0]] = b[1];
					});
					
					// Проверяем, разрешили ли мы вообще изменять размер, мало ли
					if (list.canEdit == 'true')
					{
						/**
						 *	Но на всякий случай проверяем, указаны ли значения, ибо всякое бывает
						 */
						
						a.width = (list.width != '')? list.width : a.width;
						a.height = (list.height != '')? list.height : a.height;
						
						a.classList.add('resized');
					}
					else
					{
						a.height = '30';
						a.width = a.width;
					}
				}
				else
				{
					a.height = '30';
					a.width = a.width;
				}
			})
		}
	}
}, 200);

/**
 *	Добавление смайла в стеш окна редактора смайлов
 */
function add ({a, bool})
{
	if (typeof a == 'object')
	{
		var	name = a.name || __('fullpage finder input[name="name"]').value,
			tab = a.tab || __('fullpage finder input[name="tab"]').value,
			value = a.src || __('fullpage finder input[name="src"]').value,
			canEdit = (a.canEdit == 'true')? 'true' : 'false',
			width = a.width || '',
			height = a.height || '';
	}
	else
	{
		var	name = a || __('fullpage finder input[name="name"]').value,
			tab = __('fullpage finder input[name="tab"]').value || 'Без категории',
			value = storageCache[a] || __('fullpage finder input[name="src"]').value,
			canEdit = 'false',
			width = '',
			height = '';
	}
	
	if (!bool && tab == '')
	{
		tab = 'Без категории';
	}
	else
		if (tab == '')
			tab = 'Без категории';
	
	__('fullpage finder input[name="name"]').value = '';
	__('fullpage finder input[name="src"]').value = '';
	
	if (!__(`tab[alt="${tab}"]`, smileList))
	{
		if (bool == 'true' && tab != '')
		{
			var itis = 'minus',
				classed = '';
			
			smileList.appendChild( dom(
			`<tab alt='${tab}' ${classed}>
				<hit>
					${tab}
					
					<items>
						<remove class='fa fa-eraser' onclick="delTab('${tab}')"></remove>
						<close class='fa fa-${itis}' onclick="ahide('${tab}')"></close>
					</items>
				</hit>
			</tab>`));
			
			__('listed', smileSett).appendChild( dom(
			`<tab alt='${tab}' index="100" onclick="takeTab('${tab}')">${tab}</tab>`));
			
			asstabes.appendChild
			( dom(
				`<page class='check' tab='${tab}'>
					<input type='text' mode="withoutfone" name='index' value='100'>
					<input type='text' mode="withoutfone" name='tab' value='${tab}'>
				</page>`
			));
			
			var arraytab = [];
			
			Object.keys(cath).forEach
			( function (a) {
				var val = cath[a];
				arraytab.push(val);
			})
			
			arraytab.push({ "name": tab, "index": "100", "hidden": "false" })
			localStorage.setItem('cath', JSON.stringify(arraytab));
		}
		else
		{
			tab = 'Без категории';
		}
	}
	
	__(`tab[alt='${tab}']`, smileList).appendChild( dom(`
			<list data-smile='${name}'>
				<input name='name' data-name='${name}' value='${name}'>
				<img src='${value}'>
				<input name='value' data-value='${value}' value='${value}'>
				<del class="fa fa-text-height" onclick="ch('${name}')"></del>
				<del class="fa fa-minus" onclick="del('${name}')"></del>
				
				<smile-settings>
					<canedit>${canEdit}</canedit>
					<width>${width}</width>
					<height>${height}</height>
					<tab>${tab}</tab>
				</smile-settings>
			</list>
		`));
	
	setTimeout
	( function () {
		__(`list[data-smile="${name}"]`, smileList).classList.add('created');
	});
}

/**
 *	Взятие категории
 */
function takeTab (tab)
{ __('input', smileSett).value = tab }

/**
 *	Удаление категории
 */
function delTab (tab, bool)
{
	if (bool === true)
	{
		__(`page[tab="${tab}"]`, asstabes).outerHTML = '';
		__(`listed tab[alt="${tab}"]`, smileSett).outerHTML = '';
		__(`tab[alt="${tab}"]`, smileList).outerHTML = '';
		
		array = [];
		
		Object.keys(cath).forEach
		( function (a) {
			b = cath[a];
			
			if (b.name != tab)
				array.push(b);
		});
		
		cath = array;
		localStorage.setItem('cath', JSON.stringify(cath));
	}
	else
	{
		openAlert
		({
			wait: true,
			titleOf: 'Удаление категории',
			text: `Вы уверены, что хотите удалить категорию ${tab}?<br>
				Это действие невозможно отменить!<br><br>`,
			button: [{ callback: `delTab('${tab}', true)`, value: "Удалить" }]
		});
	}
}

/**
 *	Сворачивание таба
 */
function ahide (tab)
{
	var tab = __(`tab[alt="${tab}"]`, smileList),
		close = __('hit close', tab);
		
	tab.classList.toggle('minimized');
	
	close.classList.toggle('fa-minus');
	close.classList.toggle('fa-plus');
}

/**
 *	Удаление смайла
 */
function del (name)
{ 
	var el = __(`list[data-smile="${name}"]`);
	
	el.classList.remove('created')
	setTimeout
	( function () {
		el.outerHTML = '';
	}, 500 );
}

/**
 *	Открытие окна редактирования уникального смайла
 */
function ch (name)
{
	var list = __(`list[data-smile="${name}"] smile-settings`),
		cha = __('fullpage chan'),
		canEdit = __('canedit', list).innerHTML,
		canEditText = (canEdit == 'true')? 'Изменение разрешено' : 'Не изменять размер смайла';
		
	__('canedit', cha).textContent = canEditText;
	__('canedit', cha).classList = canEdit;
	
	__('input[name=width]', cha).value = __('width', list).innerHTML;
	__('input[name=height]', cha).value = __('height', list).innerHTML;
	__('input[name=tab]', cha).value = __('tab', list).innerHTML;
	
	__('bottom fing', cha).setAttribute('onclick', `chan('${name}')`);
	
	adoor('chan');
}

/**
 *	Настройка смайла
 */
function chan (name)
{
	var from = __('fullpage chan'),
		to = __(`list[data-smile="${name}"] smile-settings`),
		canEdit = __('canEdit', from).classList[0];
	
	__('canEdit', to).textContent = canEdit;
	__('tab', to).textContent = __('input[name=tab]', from).value;
	
	if (canEdit == 'true')
	{
		if (Number.parseInt(__('input[name=width]', from).value) != '' ||
			Number.parseInt(__('input[name=height]', from).value) != '')
		{
			__('width', to).textContent = __('input[name=width]', from).value;
			__('height', to).textContent = __('input[name=height]', from).value;
		}
	}
	
	save();
}

/**
 *	Включение окна редактирования индивидуального смайла
 */
function CEtoggle ()
{
	var obj = __('chan canedit'),
		helper = __('chan helper');
	
	if (obj.classList.contains('true'))
	{
		helper.innerHTML = 'Нажмите, чтобы разрешить изменение размера или<br>оставьте пустым для фиксированных сторон';
		obj.innerHTML = 'Не изменять размер смайла';
		obj.classList.remove('true');
		obj.classList.add('false');
	}
	else
	{
		helper.innerHTML = 'Укажите размер или оставьте поля пустыми,<br>чтобы изображение имело оригинальный размер';
		obj.innerHTML = 'Изменение разрешено';
		obj.classList.remove('false');
		obj.classList.add('true');
	}
}

/**
 *	Сохранение смайлов
 */
function save ()
{
	var tabs = [], tabes = JSON.parse(localStorage.getItem('cath'));
	localStorage.setItem(chess, JSON.stringify({}));
	
	/**
	 *	Костыльное избавление от бага прошлых версий
	 *	Уберу через парочку версий, когда исправится у всех
	 */
	 
	try
	{ tabes.forEach() }
	catch (e)
	{ savePages(`Ошибка ${e.name} исправлена, обновите страницу:<br>${e.message}`) }
	
	$_('list', smileList).forEach
	( function(a) {
		var value = 
		{
			name: __('input[data-name]', a).value,
			src: __('input[data-value]', a).value,
			canEdit: __('smile-settings canEdit', a).innerHTML,
			width: __('smile-settings width', a).innerHTML,
			height: __('smile-settings height', a).innerHTML,
			tab: __('smile-settings tab', a).innerHTML
		},	index = findOf(tabes, value.tab);
		
		if (index < 0)
			tabes[lastOf(tabes)] = {name: value.tab, index: '100'};
		
		setStorage(value.name, JSON.stringify(value));
	});
	
	tabes.forEach
	( function (a, b) {
		var hddn = 'false';
		
		if (__(`tab[alt="${a.name}"]`, smileList).classList.contains('minimized'))
			hddn = 'true';
		
		tabs[b] = {name: a.name, index: a.index, hidden: hddn}
	});
	
	localStorage.setItem('cath', JSON.stringify(tabs));
	cath = JSON.parse(localStorage.getItem('cath'));
	
	storageCache = _getStorage();
	reload();
	
	openAlert({text: 'Ваши смайлы сохранены!'});
}

function findOf (obj, name)
{
	for (var a = 0; a < lastOf(obj); a++)
		if (obj[a].name == name) return a;
	
	return '-1';
}

function lastOf (obj)
{
	var length = 0;
	
	Object.keys(obj).forEach
	( function () {
		length++;
	});
	
	return length;
}

/**
 *	Отображение списка смайлов для того, чтобы поделиться с кем-либо
 */
function saveTo ()
{
	save();
	__('fullpage saveTo textarea').value = JSON.stringify( _getStorage() );
}

/**
 *	Подгрузка смайлов с пака пользователя к своим смайлам
 */
function loadFrom (bool)
{
	// Будет обидно, если изменения не сохранятся, верно?)
	save();
	
	var area = (bool)? __('blockquote.messageText .quoteContainer p')
		: __('fullpage loadfrom textarea'),
		
		your = (typeof storageCache == 'string')? JSON.parse(storageCache) : storageCache,
		load = (bool)? ((typeof area.innerText == 'string')? JSON.parse(area.innerText) : area.innerText)
		: ((typeof area.value == 'string')? JSON.parse(area.value) : area.value),
		
		oth = Object.assign(load, your);
		
	localStorage.setItem(chess, JSON.stringify(oth));
	area.value = '';
	
	// Ну и сразу получаем готовенькое
	storageCache = _getStorage();
	reload();
	
	save();
	
	openAlert({text: 'Смайлы загружены!'});
}

/**
 *	Сохранение списка страниц
 */
function savePages (output)
{
	var pages = $_("asett pages[name='pagesetting'] page"),
		tabs = $_("asett pages[name='tabsetting'] page"),
		arrayPage = {}, arrayTab = [], j = 0;
		
	pages.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a),
			name = __('input[type="text"]', a).value;
			
		arrayPage[input.value] = {name: name, is: input.checked};
	});
	
	localStorage.setItem('page', JSON.stringify(arrayPage));
	storagePage = arrayPage;
	
	tabs.forEach
	( function (a) {
		var index = __('input[name="index"]', a).value,
			tab = __('input[name="tab"]', a).value,
			oldtab = a.getAttribute('tab');
			
		arrayTab[j] = {name: tab, index: index};
		j++;
		
		if (tab != oldtab)
		{
			Object.keys(storageCache).forEach
			( function (a) {
				var el = JSON.parse(storageCache[a]);
				
				console.log(el.tab, tab);
				if (el.tab == oldtab)
				{
					el.tab = tab;
					setStorage(el.name, JSON.stringify(el));
				}
			});
		}
	});
	
	localStorage.setItem('cath', JSON.stringify(arrayTab));
	cath = arrayTab;
	
	reload();
	
	openAlert
	({
		titleOf: 'Настройки',
		text: output || 'Отображение изменено по вашему усмотрению!'
	});
}

/**
 *	Автоматически поделиться с указанным пользователем
 */
function sendSmiles ({you, to, username})
{
	var you = you, user = to, username = username,
		title = `[d2s] ${you} => ${username}`,
		content =
		`<p><a href="https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/" data-mce-href="https://dota2.ru/forum/threads/legalno-sozdajom-svoi-smajly-dlja-foruma.1275974/" data-mce-selected="inline-boundary">У вас не установлено расширение для использования кастомных смайлов<br>Для продолжения проследуйте сюда.</a></p>
		<div class="bbCodeBlock bbCodeQuote">
			<blockquote class="quoteContainer">
				<p>${JSON.stringify( _getStorage() )}</p>
			</blockquote>
		</div>`;
	
	void requestHandler.ajaxRequest
	("/api/message/createConversation",
		{ title: title, content: content, recipient: user },
		
		function (response)
		{
			if (response.status == 'success')
			{
				openAlert
				({
					titleOf: 'Работа со смайлами',
					text: 'Пак смайлов отправлен!'
				});
				
				adoor('savetouser');
				adoor('saveto');
			}
			else
			{
				openAlert({text: 'Ошибка'});
				console.log(response);
			}
		}
	)
}

/**
 *	Проверка пользователя на существование
 */
function findUser ()
{
	var stu = __('fullpage savetouser'),
		info = __('information', stu),
		username = __('input', stu).value;
	
	info.innerHTML = 'Загрузка..';
	
	fetch(`https://dota2.ru/forum/search?type=user&keywords=${username}&sort_by=username`)
	.then(function(response){
		return response.text();
	})
	.then(function(html){		
		var you = __('div.hello .username').innerHTML,
			userdocument = __('.member-list-item .avatar', dom(html).ownerDocument),
			href = userdocument.href.split('/'),
			id = href[href.length - 2].split('.')[1],
			avatar = __('img', userdocument).src;
	
		info.innerHTML =
		`<avatar><img src='${avatar}'></avatar>
		<pass>
			<name><t>Имя</t> ${username}</name>
			<id><t>ID</t> ${id}</id>
			<confirmation>При подтверждении ниже будет создана переписка с пользователем, где ему будут предоставлены смайлы и кнопка, при нажатии на которую он сможет добавить смайлы себе. Вы уверены, что это тот самый пользователь?</confirmation>
			<fing onclick="sendSmiles({you: '${you}', to: '${id}', username: '${username}'})">Да, отправить</fing>
		</pass>`;
	});
}

/**
 *	Смена страниц
 */
function adoor (elem)
{
	var flag = '';
	
	if (!__('.open', afp))
	{
		afp.classList.toggle('open');
		afp.classList.toggle('margin');
	}
	
	__(`backfon.${elem}`, afp).classList.toggle('open');
	if (flag = __(elem, afp).classList.toggle('open'))
	{
		__(`backfon.${elem}`, afp).classList.toggle('margin');
		__(elem, afp).classList.toggle('margin');
	}
	else
	{
		setTimeout
		( function () {
			__(`backfon.${elem}`, afp).classList.toggle('margin');
			__(elem, afp).classList.toggle('margin');
		}, 400);
	}
	
	if (elem == 'saveto' && flag)
		saveTo();
	
	if (!__('.open', afp))
	{
		setTimeout
		( function () {
			afp.classList.toggle('open');
			afp.classList.toggle('margin');
		}, 400);
	}
}

/**
 *	Управление уведомлениями
 */
function openAlert ({text, wait, button, titleOf})
{
	if (titleOf == 'none') __('top', alert).style.setProperty('display', 'none');
	var header = titleOf || 'Уведомление';
	
	__('top', alert).textContent = header;
	__('middle', alert).innerHTML = text;
	
	adoor('alert');
	
	if (wait)
	{
		if (button)
		{
			alert.appendChild
			( dom (`
				<bottom></bottom>
			`));
			
			bottom = __('bottom', alert);
			
			button.forEach
			( function (a) { 
				console.log(a);
				bottom.appendChild
				( dom(`
					<fing onclick="${a.callback}; adoor('alert'); this.parentElement.outerHTML = '';">
						${a.value}
					</fing>
				`));
			});
		}
		
		// На случай бесконечного уведомления возможность закрыть
		__('fullpage backfon.alert').setAttribute
		(
			'onclick',
			`adoor('alert'); this.querySelector('bottom').outerHTML = ''; this.querySelector('top').style = ''; this.onclick = 'return false;'`
		);
	}
	else
	{
		// Временное уведомление закрывается само
		setTimeout
		(function () {
			adoor('alert');
		}, 2000);
	}
}

function loading (bool)
{
	if (bool)
	{
		if (!(typeof bool == boolean)) return;
	}
	else
	{
		
	}
	
	var loader = document.createElement('div');
	loader.className = 'chatLoader';
	loader.innetHTML = '';
}

function notify_turn ()
{
	var turn = localStorage.getItem('chatTurn') || 'false',
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
						localStorage.setItem('chatTurn', true);
						
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
			localStorage.setItem('chatTurn', true);
			
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
		localStorage.setItem('chatTurn', false);
		
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

/**
 *	С любовью к Negezor
 */

function dom (html)
{
	return __('body', new DOMParser().parseFromString(html, 'text/html')).childNodes[0];
}

function putStorage (key, value)
{
	var storage = getStorage(key);

	if (storage === null) 
		return setStorage(key, value);

	return storage;
}

function hasStorage (key)
{ return key in storageCache }

function getStorage (key, value)
{
	if (hasStorage(key))
		return storageCache[key];

	return value !== undefined? value : null;
}

function setStorage (key, value)
{
	storageCache = _getStorage();
	storageCache[key] = value;

	localStorage.setItem(chess, JSON.stringify(storageCache));

	return storageCache[key];
}

function _getStorage ()
{
	var storage = localStorage.getItem(chess);

	if (storage === null)
		storage = {};
	
	else
		storage = JSON.parse(storage);

	return storage;
}

function __ (selector,context) {
	return $_(selector,context)[0] || null;
}

function $_ (selector,context) {
	context = context || document;

	if (!/^(#?[\w-]+|\.[\w-.]+)$/.test(selector)) {
		return Array.prototype.slice.call(context.querySelectorAll(selector));
	}

	switch (selector.charAt(0)) {
		case '#':
			return [context.getElementById(selector.substr(1))];
		case '.':
			return Array.prototype.slice.call(context.getElementsByClassName(
				selector.substr(1).replace(/\./g,' ')
			));
		default:
			return Array.prototype.slice.call(context.getElementsByTagName(selector));
	}
}