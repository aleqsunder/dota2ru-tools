/**
 *	Загрузка разрешённых стилей и скриптов
 */
if (mode == 'chat') {
	load ([ 'chatpage.css' ]);
}
 
/* Основные */
load ([
	/**** Завязка функционала ****/
    'footerfunctions.js', // Основные ф-ии для работы расширения
    'queryfinder.js', // Упрощенный querySelector/all
    
	/**** Модули ****/
    'reservecopy.js', // Модуль - резервная копия
    'smiles.js', // Модуль - смайлы
    'categories.js', // Модуль - категории
    'alert.js', // Модуль - уведомления
	'customignore.js', // Модуль - кастомный игнор
	/*>*/ 'customignore.css' // Стили для модуля
]);

/* Хлебные крошки */
if (mode == 'threads') { // Только форум
    load  ([
        'breadcrumb.css',
        'breadcrumb.js'
    ]);
}

if (tinyMods.indexOf(mode) > -1)
    load ([
        // Форумные сообщения
        'forumpost.css', 'forumpost.js',
        // Форумный редактор
        'forumredactor.css', 'forumredactor.js',
        // Стили "Фикс сообщений на мобильном"
        'mobileforumfix.css'
    ]);

/* Стили пользователя */
load ([ 'userstyles' ]);

/* Чат на главной */
watching ({
	elem: 'head title',
	
	callback: function (el) {
		if ((mode == 'unknown' && qs('head title').innerHTML == 'Форум Dota 2') || mode == 'chat')
			load ([ 'chat.css', 'chat.js' ]);
	}
});

/**
 *	Начало
 */
document.addEventListener
("DOMContentLoaded", () => {
	var index = -2, button, tabs, name_title = 'Собственные',
		reloadInterval = setInterval(reload, 3000), winn = null;
    
    const User = new datadocs ({
        database_name: 'AKfycbyc5hHlcmND6XnrguiI4uegok1yAd2Mf78z5NzgfQ4uqN0TxpOo'
    });

    if (get('docs-username', true) != null) {
        User.username = get('docs-username', true);
        User.password = has('docs-password', true) ? get('docs-password', true) 
                        : get('docs-username', true);
        
        User.loadSmiles();
    } else {
        User.firstInit();
    }
    
    function takeCall () {
        let cV = JSON.parse(get('callerVariable', true)) || {};
        
        for (arg in cV) {
            switch (arg) {
                case 'getSmiles':
                    let name = JSON.parse(cV[arg]).username || get('docs-username') || null;
                    
                    if (name != null || name != undefined)
                        User.getSmiles(name).then(res => log(`getSmiles > ${res.type} > ${res.name}`));
                    else User.getSmiles().then(res => log(`getSmiles > ${res.type} > ${res.name}`));
                        
                break;
                    
                case 'saveSmiles':
                    User.saveSmiles()
                    .then(res => log(`saveSmiles > ${res.type} > ${res.name}`));
                break;
                    
                case 'changePassword':
                    let oldpassword = JSON.parse(cV[arg]).old,
                        newpassword = JSON.parse(cV[arg]).to;

                    User.changePassword({
                        old: oldpassword,
                        to: newpassword
                    });
                break;
                    
                case 'stayPassword':
                    let password = JSON.parse(cV[arg]).pass;

                    User.stayPassword({
                        password: password
                    });
                break;
                    
                case 'registration':
                    let thispassword = JSON.parse(cV[arg]).password;
                    
                    User.registration({
                        password: thispassword
                    })
                    .then ( function (res) { 
                        if (res.type == 'Успешно') {
                            User.password = password;
                            set('docs-password', password, true);
                            
                            log('registration > Регистрация прошла успешно');
                        }
                    });
                    
                break;
                
                case 'google401':
                    watching ({
                        elem: 'information[smiles]',

                        callback: function (el) {
                            el.innerText = 'Необходима авторизация в Google для синхронизации!';
                            el.classList.add('taked');
                            el.setAttribute('onclick', "sendCall('authorize')");
                        }
                    });
                    
                break;
                    
                case 'authorize':
                    winn = window.open(
                        `https://script.google.com/macros/s/${User.database_name}/exec`,
                        'window', "width=500px, height=400px, left=100px, top=100px"
                    );
                break;
                
                case 'findUsersmiles':
                    User.getSmiles(JSON.parse(cV[arg]).username).then((res) => {
                        if (res.type == 'Успешно') {
                            let main = qs('savetouser'),
                                obj = qs('information[savetouser]', main),
                                bottom = qs('bottom', main),
                                div = document.createElement('div'),
                                smiles = JSON.parse(res.value),
                                coll, smilesDom = dom('<smilepreview></smilepreview>');

                            for (smile in smiles) {
                                let link = JSON.parse(smiles[smile]).src;
                                
                                smilesDom.appendChild(dom(`
                                    <sp title='${smile}'>
                                        <bgnd style="background: url('${link}')"></bgnd>
                                        <ttl>${smile}</ttl>
                                    </sp>
                                `));
                            }
                            
                            bottom.innerHTML = '';
                            bottom.appendChild(dom(`<fing onclick="saveLoadedSmiles()">Сохранить</fing>`));
                            
                            obj.innerHTML = '';
                            obj.appendChild(smilesDom);
                            
                            qs('input[smiles]', main).value = res.value;
                            qs('input[cath]', main).value = res.cath;
                        } else {
                            log('sendCall > findUsersmiles > Несуществующий пользователь')
                        }
                    });
                    
                break;
                    
                default:
                    log('sendCall > Несуществующий тип запроса');
                break;
            }
            
            delete cV[arg];
        }
        
        set('callerVariable', JSON.stringify(cV), true);
    }
    
    let callInterval = setInterval(takeCall, 500);
		
	if (mode == 'conversation') {
		var butt = document.querySelector('blockquote.messageText.baseHtml');
		
		if (butt) {
			if (butt.querySelector('p').innerHTML
				.indexOf('У вас не установлено расширение для использования кастомных смайлов') > -1) {
				butt.querySelector('p').outerHTML = '';
				butt.appendChild
				(dom(
				`<quotebutton>
					Функция более недоступна, для добавления смайлов достаточно ввести никнейм
				</quotebutton>`
				));
			}
		}
	};

	/**
	 *	Обновление элементов и сортировка по алфавиту
	 */
	function reload () {
		list = [];
		Object.keys(storageCache).forEach((name) => {
			var sc = JSON.parse(storageCache[name]);
			
			if (sc.name) {
				// Раскрыл для наглядности
				if (sc.canEdit == 'true') {
					list.push ({
						'name': sc.name,
						'src': sc.src,
						'canEdit': sc.canEdit,
						'width': sc.width,
						'height': sc.height
					});
				} else {
					list.push ({
						'name': sc.name,
						'src': sc.src,
						'canEdit': sc.canEdit
					});
				}
			}
		});
		
		list.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
	}

	reload();

	/**
	 *	Шаг нулевой - определение страницы настроек
	 */
    let htmlResult = '',
        htmlCount = 0,
        htmlInterval = setInterval(() => {
            if (htmlCount === htmlCountNames) {
                document.body.insertBefore (dom(`<fullpage>${htmlResult}</fullpage>`), document.body.firstChild);
                
                watching ({
                    elem: 'div.userbar',
                    callback: function (el) {
                        el.insertBefore( dom(`
                            <a class='icon' onclick="openWindow('smiles')">
                                <i class="fa fa-wrench"></i>
                            </a>
                        `), el.querySelector('a[title="Сообщения"]'));

                        load ([ 'integrate.js', 'checkversion.js' ]);
                    }
                });
                
                clearInterval (htmlInterval);
            }
        }, 200);
    
    htmlSettingNames.forEach((a) => {
        upload(`/assets/html/${a.name}.html`)
        .then( function (tmp) {
            htmlResult += 
            `<backfon back${a.position} class="${a.name}" onclick="openWindow('${a.name}')"></backfon>
            <${a.name} ${a.position}>
                 ${tmp}
            </${a.name}>`;
            
            htmlCount++;
        });
    });
	
	// Если tinyMCE есть на страницах, то продолжить
	if (tinyMods.indexOf(mode) > -1) {
		//Шаг первый - отслеживание timyMCE и присваивание кнопке второго шага
		watching ({
			elem: 'button[aria-label="Смайлы"]',
			bool: true,
			callback: function (el) {
				el.addEventListener('click', createPanel, false);
			}
		});

		// Шаг второй - отслеживание появления блока смайлов
		function createPanel () {
			watching ({
				elem: 'div.smiles-panel ul.tabs',
				
				callback: function () {
					el.querySelectorAll('a').forEach
					( function (a){
						var page = JSON.parse(get('page', this)),
							a = a;
							// получаемая переменная может работать только в пределах своей ф-ии
						
						// Проверяем, есть ли вообще такой объект в локалке
						if (page) {
							Object.keys(page).forEach
							( function (b) {
								var index = parseInt(a.dataset.cat.toString());
								
                                if (page[index] != undefined) {
                                    a.textContent = page[index].name;

                                    if (page[index].is == false)
                                        a.style = 'display: none';
                                } else {
                                    page[index] = {name: a.textContent, is: true};
                                    set('page', JSON.stringify(page), true);
                                    log(`Обнаружена новая вкладка - ${a.textContent}`);
                                }
							});
						}
					});
					
					el.insertBefore( dom(`
						<li class='tab-title'>
							<a href="#smile-cat-${index}" data-cat="${index}">${name_title}</a>
						</li>
					`), el.firstChild);
					
					// Приступаем к созданию контента
					var content = document.querySelector('div.smiles-panel div.tabs-content'),
						div = dom(`<div id='smile-cat-${index}' class='content'></div>`);
					
					// Перебираем все смайлы
					for (var i = 0; i < list.length; i++) {
						// Чтобы не ловить фейспалмы потом от canEdit='hooe' и прочее
						var v = list[i],
							shortcut = (v.canEdit == 'true')
							? `canEdit=true&height=${v.height}&width=${v.width}`
							: `canEdit=false`;
						
						div.appendChild( dom(`
							<div class='smile-content'>
								<a href="#" data-shortcut="${shortcut}" data-mce-url="${v.src}" tabindex="${index}" title=":${v.name}:">
									<img src="${v.src}" role="presentation">
								</a>
							</div>
						`));
					}
					
					content.appendChild(div);
				}
			});
		}
	}
});