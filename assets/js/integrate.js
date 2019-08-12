/**
 *	Все основные переменные для удобства
 */
var afp = __('fullpage'),
	smileSett = __('smiles category', afp),
	smileList = __('smile-list', afp),
	reservetime = __('asett pages[name="reserve"] reservetime', afp),
	mainsetting = $_('asett pages[name="mainsetting"] page', afp),
	asspages = $_('asett pages[name="pagesetting"] page', afp),
	asstabes = __('asett pages[name="tabsetting"]', afp),
	assscroll = __('asett pages[name="scrollbar"]', afp),
	asschat = __('asettchat pages[name="st"]', afp),
	getchat = localStorage.getItem('setting--chat'),
	storagePage = JSON.parse(localStorage.getItem('page')), 
	cath = JSON.parse(localStorage.getItem('cath')), 
	alert = __('alert', afp), aflag = true;

/*
	Отображение сообщений
*/
if (mode == 'unknown' && __('head title').innerText == 'Форум Dota 2' && (getchat == 'true' || getchat == null))
{	
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
}

/**
 *	Обновление элементов сайта под текущие значения
 */
function reload ()
{
	reservetime.innerText = localStorage.getItem('reserve-time');
	
	mainsetting.forEach
	( function (a) {
		var input = __('input[type="checkbox"]', a);
		
		input.checked = (localStorage.getItem(`setting--${input.value}`) == 'true');
	});
	
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
			head.innerHTML += 'img[data-smile]:not(.resized)[data-shortcut="canEdit=false"] { width: auto; height: 30px; }';
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
				
				a.classList.add('resized');
			});
		}
	}
}, 200);