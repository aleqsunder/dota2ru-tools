 /*** Кастомный игнор */
const CustomIgnore = {
	 /**
	  * Получение списка игнорируемых пользователей :: promise
	  */
	getIgnoredUser: async function () {
		 // Сначала проверяем, есть ли в сессии список игнорируемых пользователей
		if (ss.has('ignore-list'))
			return ss.get('ignore-list');
		
		 // Иначе получаем его
		return fetch('https://dota2.ru/forum/settings/ignorelist/').then(r => r.text()).then(r => {
            let q = document.createElement('div');
            q.innerHTML = r;

			let list = qsa('.member-list .username span', q).map(a => a.innerHTML);
			ss.set('ignore-list', list);
			
            return list;
        });
	},
	
	 /**
	  * Игнорирование тем пользователей на главной странице
	  */
	mainPage: (list) => {
		for (item of qsa('.activities-block article')) {
			let author = qs('.author', item).innerText.match(/: (.*?)$/i);
			
			 // Пускаем дальше все темы и новости, у которых нет автора (с главной например)
			if (author !== null) {
				let name = author[1];

				if (list.indexOf(name) !== ~false) {
					item.remove();
				}
			}
		}
	},
	
	 /**
	  * Игнорирование пользователей в списке на форуме
	  */
	forumPage: (list) => {
		let users = '';
		
		switch (mode) {
			 // forum/ 
			case 'unknown':
				users = qsa('.users-online .listInline li');
				
				for (user of users) {
					let nick = qs('span', user).innerText;
					
					if (list.indexOf(nick) !== ~false) {
						user.remove();
					}
				}
			break;
			
			 // forum/threads/name.id/
			case 'threads':
				users = qsa('.secondary-content .listInline li');
			
				for (user of users) {
					let nick = qs('a', user).innerText;
					
					if (list.indexOf(nick) !== ~false) {
						user.remove();
					}
				}
				
				 // Так же не забываем убрать запятую после последнего элемента
				let last = qs('.secondary-content .listInline li:last-child');
				last.innerHTML = qs('a', last).outerHTML;
			break;
			
			 // forum/members/name.id/
			case 'members':
				let posts = qsa(`.profile-wall li[id|="wall-post"]`),
					comments = qsa(`.profile-wall li[id|="wall-comment"]`);
					
				 // Проверка в постах
				for (post of posts) {
					let nick = qs('a.stream-username', post).innerText;
					
					if (list.indexOf(nick) !== ~false) {
						post.remove();
					}
				}
				
				 // Проверка в комментариях
				for (comment of comments) {
					let nick = qs('a.stream-username', post).innerText;
					
					if (list.indexOf(nick) !== ~false) {
						comment.remove();
					}
				}
			break;
			
			 // Неопределённый
			default: 
				log('Данная страница не скрывает игнорируемых пользователей?\nПиши в главную тему расширения, и я исправлю это!');
			break;
		}
	},
	
	 /*** Инициализация */
	init: function () {
		 // Пока грузится страница - получаем список игнорируемых пользователей
		this.getIgnoredUser().then(list => {
			let path = location.pathname;
			
			 // После загрузки DOM'а определяем, с чем работаем
			window.addEventListener('DOMContentLoaded', () => {
				if (path === '/') {
					 // Главная
					this.mainPage(list);
				} else if (path.indexOf('/forum/') !== ~false) {
					 // Форум
					this.forumPage(list);
				}
			})
		});
	}
}

CustomIgnore.init();