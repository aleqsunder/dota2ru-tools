/**
 *	Все основные переменные для удобства
 */
var fullPageMain = qs('fullpage'),
	smileSett = qs('smiles category', fullPageMain),
	smileList = qs('smile-list', fullPageMain),
	reservetime = qs('asett pages[name="reserve"] reservetime', fullPageMain),
	mainsetting = qsa('asett pages[name="mainsetting"] page', fullPageMain),
	asspages = qsa('asett pages[name="pagesetting"] page', fullPageMain),
	asstabes = qs('asett pages[name="tabsetting"]', fullPageMain),
	assscroll = qs('asett pages[name="scrollbar"]', fullPageMain),
	asschat = qs('asettchat pages[name="st"]', fullPageMain),
	getchat = get('chat'),
	storagePage = JSON.parse(get('page', true)), 
	cath = JSON.parse(get('cath', true)), 
	alert = qs('alert', fullPageMain), aflag = true;

/*
	Отображение сообщений
*/

if (((mode == 'unknown' && qs('head title').innerText == 'Форум Dota 2') || mode == 'chat') 
	&& (getchat == 'true' || getchat == null)) {	
	// Форумный чат

	setInterval (() => {
		let stab = qs('div.smiles-panel ul.tabs');
		
		if (stab) {
			stab.querySelectorAll('a').forEach ((a) => {
				var page = JSON.parse(get('page', true)),
					a = a;
				
				// Проверяем, есть ли вообще такой объект в локалке
				if (page) {
					Object.keys(page).forEach (function (b, index) {
						var index = a.dataset.cat.toString();
						
						if (page[index]) {
							a.textContent = page[index].name;
							
							if (page[index].is == false)
								a.style = 'display: none';
						}
					});
				}
			});
		}
	}, 200);

	qsa(`pages[name='colorpicker'] input`).forEach ((a) => {
		a.addEventListener("change", changebodycolor, false);
		a.value = vars[a.getAttribute('var')];
	});
	
	styleSet('f-color', vars['f-color']);
	styleSet('f-time-color', vars['f-time-color']);
	styleSet('f-background', vars['f-background']);
	styleSet('f-chat-background', vars['f-chat-background']);
	
	qs('input[caller="chat-avatar"]', asschat).checked
		= JSON.parse(get('chat-avatar')) === true;
	
	var old_time = '0',
		array_notify = [];

	Chat.appendToChat = function (data, scroll, skipDuplicates, hideControls) {
		scroll = scroll || 'false';
		skipDuplicates = skipDuplicates || 'true';
		
		// Если между сообщениями прошло меньше минуты - объединить их
		// для экономии места
		let can_new = (old_time > 0 && data.date_sent - old_time > 60) ? false : true;
		old_time = data.date_sent;
		
		// Проверка на дубликат и ЧС, если данное сообщение найдено - пропускаем
		if (skipDuplicates && $(`#chatMessage${data.id}`).length > 0) return false;
		
		let enableUserAvatar = JSON.parse(get('chat-avatar')) === true,
			chatBlock = $('.chatMessages'), yourBlock = $('.yourMessages'),
			liClass = (!data.visible && data.visible !== undefined) ? 'not-visible' : '',
			id = data.id !== undefined ? `id="chatMessage${data.id}"` : '',
			username = (data.username && data.username.length > 0) ? Base64.encode(data.username) : 'NONE', 
			youser = data.user_id == Utils.user_id, nickname = Utils.username,
			repeater = (enableUserAvatar && youser) ? ` type="your message"` : '',
			isGlued = "", html = "", moderation = "";
			
		// Для модераторов
		if (!hideControls) {
			if (Utils.isAdmin || Utils.isSuperModerator || Utils.hasPrivilege(Utils.Privileges.chat_moderation)) {
				if (data.visible !== undefined) {
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
			
			// Начало парса
			text_parsed = text_parsed
				.replace(nickname, `<span class="loggedNick">${nickname}</span>`) 	// Определение вашего никнейма
				.replace(/<img[^>]*>/ig, "<div class='chatSmile'>$&</div>")			// Обрамление смайлов
				
				// Парс картинок
				.replace(/<a[^>]*>(.*?).jpg<\/a>/ig, img_str +"$1.jpg"+ img_end) 	// jpg
				.replace(/<a[^>]*>(.*?).jpeg<\/a>/ig, img_str +"$1.jpeg"+ img_end) 	// jpeg
				.replace(/<a[^>]*>(.*?).png<\/a>/ig, img_str +"$1.png"+ img_end) 	// png
				.replace(/<a[^>]*>(.*?).gif<\/a>/ig, img_str +"$1.gif"+ img_end) 	// gif
				
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
			`<div class='chatAvatar' onclick="open_menu.call(this, 'chatMessage${data.id}')">
				<av style="${bgi_style}">
					<div class='avatarController fa fa-bars'>
					</div>
				</av>
			</div>
			<div class="userMenu">
				<a href="${user_href}" class="userItem">
					<div class="fa fa-user itm"></div> <div class="userLabel">Профиль</div>
				</a>
				<div class="userItem" onclick="Chat.abuseMessageModal(${data.id})">
					<div class="fa fa-flag itm"></div> <div class="userLabel">Жалоба</div>
				</div>
				<div class="userItem" onclick="ignoreUser('${data.username}')">
					<div class="fa fa-ban itm"></div> <div class="userLabel">Игнорировать</div>
				</div>
			</div>`,
			chat_message = 
			`<div class="chatMessage" style='display: block'>
				${text_parsed}
			</div>`,
			match_smile = text_parsed.match(/<div[^>]*>(.*?)<\/div>/ig), // Проверяем, есть ли вообще смайлы
			smile_length = (match_smile) ? match_smile.length : 0,
			smile_once = '';
			
		// Проверка, есть ли только смайлы
		if (last_nickname) {
			if (text_parsed.replace(/<div(.*?)[<\/]div>/ig, '').trim() == '') {
				smile_once = '--f-background: none';
			}
			
			// А так же объединение сообщений
			if (can_new) {
				last_message.css('margin-bottom', '3px');
				isGlued = 'glued';
				
				if (chat_avatar) avatar = '';
			}
		}
		
		html = 
		`<div id='message-${data.id}' li="chatMessage${data.id}" class='fullContentMessage' style='${smile_once}'>
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
		
		if (data.username != nickname || enableUserAvatar != 'inline') html = avatar + html;
		chatBlock.append(`<li name="${data.username}" ${id}${repeater} class="${liClass} ${isGlued}">
			${html}
		</li>`);
		
		// html.match(nickname) && yourBlock.append(html);
		// scroll && this.scrollChat();
		
		// Анимация появления
		
		if (giu().indexOf(data.username) == -1) {
			setTimeout(() => { 
				qs(`#chatMessage${data.id}:not(.animate)`).classList.add('animate');
			}, 100);
		} else {
			qs(`#chatMessage${data.id}:not(.removeUserMessageAnimation)`)
				.classList.add('removeUserMessageAnimation');
		}
		
		if (chatScroll.scrollHeight - (chatScroll.scrollTop + 250) < 100) {
			Chat.scrollChat();
		}
	}
	
	// Фикс момента опоздания присвоения appendToChat
	if (!document.querySelector('#chatBlock .fullContentMessage')) {
		loading();
		Chat.getChatMessages(true);
		
		var load_interval = setInterval (() => {
			if (document.querySelector('#chatBlock .fullContentMessage')) {
				loading(false);
				clearInterval(load_interval);
			}
		}, 1000);
	}
	
	// Переназначим ф-ию ради уведомлений
	Chat.getChatMessages = function (full, scroll) {
		scroll = scroll == undefined ? false : true;
		full != undefined && full && chatBlock.find("li").remove();
		
		let chatBlock = $(".chatMessages"),
			currentMessages = chatBlock.find("li").length;
		
		requestHandler.ajaxRequest("/api/chat/getMessages", {}, function (response) {
			if (response.status == "success") {
				lastUpdate = Math.floor(Date.now() / 1e3);
				
				if (response.data.length != undefined && response.data.length != 0) {
					if (qs("ul.chatMessages li:last-child").id != `chatMessage${response.data[response.data.length - 1].id}`) {
						typeof yourBlock !== "undefined" && (yourBlock.innerHTML = '');
						for (let i = 0; i < response.data.length; i++) Chat.appendToChat(response.data[i], scroll);
						
						if (has('chatTurn')) {
							let data = response.data[response.data.length-1],
								text = Base64.decode(data.content),
								id = data.id.toString(), notify = get('notify', true);
							
							if (notify) {
								notify = notify.split(',');
								
								if (!Array.isArray(notify)) { 
									notify = []
								} else {
									for (var i = 0; i < notify.length; i++) {
										if (+id - +notify[i] > 40) notify.splice(i, 1)
									}
									
									set('notify', notify.join(), true);
								}
							}
							else notify = [];
							
							if (notify.indexOf(id) < 0) {
								notify.push(id);
								set('notify', notify.join(), true);
									
								text = text
									.replace(/<a(.*?)vocaroo.com\/i\/(.*?)<\/a>/ig, "[Голосовое]")
									.replace(/<a(.*?)<\/a>/ig, "[Ссылка]")
									.replace(/<img data\-shortcut\=\"(.*?)\"[^>]*>/ig, "$1");
											
								var note = new Notification  (
									data.username, {
										body: text,
										tab: data.id,
										icon: data.user_avatar
									}
								);
								
								setTimeout(() => {
									note.close();
									
									setTimeout(() => {
										notify[id] = true;
										
										var deleteNotify = get('notify', true).split(',');
										deleteNotify.splice(deleteNotify.indexOf(id), 1);
										
										set('notify', deleteNotify.join(), true);
									}, 30000);
								}, 5000);
							}
						}
						
						Chat._scroll_at_end && Chat.scrollChat();
					}
					
					Chat.lastMessageDate = moment.unix(response.data[response.data.length - 1].date_sent);
					
					if (Chat.updateInterval != Utils.config.chatUpdateInterval) {
						Chat.updateInterval = Utils.config.chatUpdateInterval;
						clearInterval(Chat.chatInterval);
						
						Chat.chatUpdateRunning = false;
						Chat.runChatInterval();
					}
				}
			} else {
				if (Chat.updateInterval == Utils.config.chatUpdateInterval)  Chat.updateInterval = 0;
				if (Chat.updateInterval < 1e4 * Utils.config.chatIdleIntervalLimit) {
					Chat.updateInterval += Utils.config.chatIdleInterval;
					clearInterval(Chat.chatInterval);
					
					Chat.chatUpdateRunning = false;
					Chat.runChatInterval();
				}
			}
			
			app.checkTime();
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
		
		requestHandler.ajaxRequest("/api/chat/sendMessage", { content: contval },  function (response) {
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

	var chatFulled = qs('#chatFull'), chatScroll = qs('.chatContainer', chatFulled),
		chatTitle = qs('h3.content-title', chatFulled);

	qs('a.right').classList.remove('toggle');
	qs('a.right').classList.add('fa');
	qs('a.right').classList.add('fa-minus');

	chatScroll.addEventListener('scroll', () => {
		if (chatScroll.scrollHeight - (chatScroll.scrollTop + 250) > 100) {
			if (!chatScroll.classList.contains('active')) {
				chatScroll.classList.add('active');
			}
		} else {
			if (chatScroll.classList.contains('active')) {
				chatScroll.classList.remove('active');
			}
		}
	});

	chatTitle.appendChild(dom(
		`<a onclick="onFullWindow(); return false" data-id="chatBlock" data-title="На весь экран" href="#" class="right fa fa-arrows"></a>`
	));
	
	chatTitle.appendChild(dom(
		`<a onclick="openWindow('asettchat'); return false" data-id="chatBlock" data-title="Настройки расширения" href="#" class="right fa fa-wrench"></a>`
	));

	chatTitle.appendChild(dom(
		`<a onclick="openIgnoreList(); return false" data-id="chatBlock" data-title="Редактировать список игнора" href="#" class="right fa fa-ban"></a>`
	));
	
	var red = (has('chatTurn')) ? '' : ' red';
	chatTitle.appendChild(dom(
		`<a onclick="notify_turn(); return false" data-id="chatBlock" data-title="Уведомления" href="#" class="right fa fa-bell${red}"></a>`
	));
}

/**
 *	Обновление элементов сайта под текущие значения
 */
function reload () {
	reservetime.innerText = get('reserve-time', true);
	
	mainsetting.forEach((a) => {
		var input = qs('input[type="checkbox"]', a);
		input.checked = (get(input.value) == 'true');
	});
    
    watching ({
        elem: 'input[oldpass]',

        callback: (el) => {
            el.value = has('docs-password', true) ? get('docs-password', true) : get('docs-username', true);
        }
    });
    
    watching ({
        elem: 'input[thispass]',

        callback: (el) => {
            el.value = has('docs-password', true) ? get('docs-password', true) : get('docs-username', true);
        }
    });
	
	if (has('pages', true))
		remove('pages', true);
	
	if (!has('page', true)) {
		set('page', `{"1":{"name":"Стандартные","is":true},"5":{"name":"Твич","is":true},"6":{"name":"Разное","is":true},"7":{"name":"Dota 2 анимированные","is":true},"9":{"name":"Dota 2 герои","is":true},"11":{"name":"Аниме","is":true},"14":{"name":"Пепа","is":true},"16":{"name":"Dota 2 предметы","is":true},"17":{"name":"LoL","is":true},"18":{"name":"Твич-герои","is":true},"-1":{"name":"Популярные","is":true}}`, true);
		storagePage = JSON.parse(get('page', true));
	}
    
    qs('textarea[userstyles]').value = JSON.parse(get('userstyles-css')) || ``;
	
	// Переприсваиваем все разрешённые вкладки смайлов
	asspages.forEach((a) => {
		var input = qs('input[type="checkbox"]', a),
			name = qs('input[type="text"]', a);
			
		name.value = storagePage[input.value.toString()].name;
		input.checked = storagePage[input.value.toString()].is;
	});
	
	// Самый простой способ очистить от всего старого
	smileList.innerHTML = '';
	asstabes.innerHTML = '';
	
	if (!cath) {
		set('cath', `[{"name":"Без категории","index":"100","hidden":"false"}]`, true);
		cath = JSON.parse(get('cath', true));
	}
	
	var arraytabes = [];
	
	qs('listed', smileSett).innerHTML = '';
	
	Object.keys(cath).forEach((tab) => {
		tab = cath[tab];
		arraytabes.push({ name: tab.name, index: tab.index, hidden: tab.hidden });
		asstabes.appendChild(dom(
			`<page class='check' tab='${tab.name}'>
				<input type='text' mode="withoutfone" name='index' value='${tab.index}'>
				<input type='text' mode="withoutfone" name='tab' value='${tab.name}'>
			</page>`
		));
	});
	
	if (arraytabes) {
		arraytabes.sort(function (a, b) {
			return parseFloat(a.index) - parseFloat(b.index);
		});
		
		arraytabes.forEach((a) => {
			var isOpen = (a.hidden == 'true')? 'plus' : 'minus',
				classed = (a.hidden == 'true')? 'class="minimized"' : '';
			
			smileList.appendChild(dom(
			`<tab alt='${a.name}' index='${a.index}' ${classed}>
				<hit>
					${a.name}
					
					<items>
						<remove class='fa fa-eraser' onclick="delTab('${a.name}')"></remove>
						<close class='fa fa-${isOpen}' onclick="ahide('${a.name}')"></close>
					</items>
				</hit>
			</tab>`));
			
			qs('listed', smileSett).appendChild
			(dom(`<tab alt='${a.name}' index='${a.index}' onclick="takeTab('${a.name}')">${a.name}</tab>`));
		});
	}
	
	// Если обнаружены смайлы старого образца - конвертация в новый и обновление
	if (get('a-dota2smiles', true)) {
		chess = 'a-dota2smiles';
		storageCache = _getStorage();
		
		Object.keys(storageCache).forEach((name) => { add({a: name}) });
		remove('a-dota2smiles', true);
		
		chess = 'a-dota2smile';
		save();
		
		document.location.reload();
		return false;
	}
	
	// Перебираем все текущие смайлы (с поддержкой старых версий) и сортируем по алфавиту
	list = [];
	Object.keys(storageCache).forEach((name) => {
		var sc = JSON.parse(storageCache[name]);
		
		if (sc.name) {
			// Раскрыл для наглядности
			if (sc.canEdit == 'true') {
				list.push ({
					'name': sc.name,
					'tab': (sc.tab || sc.tab == '')? sc.tab : 'Без категории',
					'src': sc.src,
					'canEdit': sc.canEdit,
					'width': sc.width,
					'height': sc.height
				});
			} else {
				list.push ({
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

setInterval(() => {
	// Получаем активный tinyMCE
	if (typeof tinymce != 'undefined' && tinymce.activeEditor) { var content = tinymce.activeEditor.contentDocument }
	
	if (content) {
		let head = qs('head style:not(.resized)', content);
		
		// Проверяем, существуют ли (для стабильности, проскакивает "of null")
		if (head) {
			// Добавляем стили и присваиваем класс, чтобы больше на глаза не попадался
			head.innerHTML += 'img[data-smile]:not(.resized)[data-shortcut="canEdit=false"] { width: auto; height: 30px; }';
			head.classList.add('resized');
		}
		
		let allCont = qsa('img[data-smile]:not(.resized)', content);
		
		// Если есть неизменённые смайлы
		if (allCont.length > 0) {
			allCont.forEach(function (a) {
				var getter = a.dataset.shortcut,
					getters = getter.split('&'),
					list = {};
				
				if (a.dataset.shortcut.indexOf('=') > -1) {
					getters.forEach((b) => {
						b = b.split('=');
						
						list[b[0]] = b[1];
					});
					
					// Проверяем, разрешили ли мы вообще изменять размер, мало ли
					if (list.canEdit == 'true') {
						a.width = (list.width != '')? list.width : a.width;
						a.height = (list.height != '')? list.height : a.height;
					} else {
						a.height = '30';
						a.width = a.width;
					}
				} else {
					a.height = '30';
					a.width = a.width;
				}
				
				a.classList.add('resized');
			});
		}
	}
}, 200);