const reserve =
{
	massive:
	[
		'a-dota2smile',
		'--chat-avatar',
		'cath', 'chatTurn',
		'first', 'page'
	],
	
	get: function (a)
	{
		return localStorage.getItem(a);
	},
	
	set: function (a, b)
	{
		return localStorage.setItem(a, b);
	},
	
	remove: function (a)
	{
		localStorage.removeItem(a);
	},
	
	save: function (a)
	{
		if (a != true)
		{
			if (this.get('reserve-first'))
			{
				openAlert
				({
					wait: true,
					titleOf: 'Резервная копия',
					text: 
						`Осторожно!<br>
						В вашем браузере обнаружена старая резервная копия!<br>
						Дата записи: ${this.get('reserve-time')}<br><br>
						Вы действительно хотите перезаписать резервную копию?`,
					button: 
					[{
						callback: `reserve.save(true)`,
						value: "Сохранить"
					}]
				});
			}
			else
			{
				reserve.save(true);
			}
		}
		else
		{
			this.massive.forEach
			( function (a) {
				reserve.set(`reserve-${a}`, reserve.get(a));
			});
			
			var d = new Date(),
				month = d.getMonth() < 10 ? `0` : ``,
				minutes = d.getMinutes() < 10 ? `0` : ``;
			
			this.set('reserve-time', `${d.getDate()}.${month}${d.getMonth()}.${d.getFullYear()} в ${d.getHours()}:${minutes}${d.getMinutes()}`);
			
			openAlert
			({
				titleOf: 'Резервная копия',
				text: `Сохранено!`
			});
			
			reload();
		}
	},
	
	returnTo: function (a)
	{
		if (a != true)
		{
			if (!this.get('reserve-first'))
			{
				openAlert
				({
					titleOf: 'Резервная копия',
					text: 'Резервная копия не обнаружена! Для начала сохраните Вашу копию'
				});
				
				return false;
			}
			else
			{
				openAlert
				({
					wait: true,
					titleOf: 'Резервная копия',
					text: 
						`Вы действительно хотите заменить текущую сессию резервной копией?<br>
						Дата записи: ${this.get('reserve-time')}<br><br>
						Вы действительно хотите восстановиться до данной контрольной точки?`,
					button: 
					[{
						callback: `reserve.returnTo(true)`,
						value: "Заменить"
					}]
				});
			}
		}
		else
		{
			this.massive.forEach
			( function (a) {
				reserve.set(a, reserve.get(`reserve-${a}`));
			});
			
			if (reserve.get('a-dota2smile') == 'null')
			{
				reserve.set('a-dota2smile', '{}');
				reserve.set('reserve-a-dota2smile', '{}');
			}
			
			openAlert
			({
				titleOf: 'Резервная копия',
				text: 'Данные восстановлены!'
			});
			
			reload();
		}
	},
	
	toDefault: function (a)
	{
		if (a != true)
		{
			openAlert
			({
				wait: true,
				titleOf: 'Восстановление изначальных настроек',
				text: 
					`Вы действительно хотите ВЕРНУТЬСЯ к НАЧАЛЬНЫМ настройкам? Это приведёт так же к удалению резервной копии`,
				button: 
				[{
					callback: `reserve.toDefault(true)`,
					value: "Я подтвержаю: хочу вернуться к НАЧАЛЬНЫМ настройкам"
				}]
			});
		}
		else
		{
			this.massive.forEach
			( function (a) {
				reserve.remove(a);
				reserve.remove(`reserve-${a}`);
			});
			
			reserve.remove('reserve-time');
			
			openAlert
			({
				titleOf: 'Восстановление изначальных настроек',
				text: 'Вы были возвращены к изначальным настройкам. Обновите страницу!'
			});
			
			reload();
		}
	}
}