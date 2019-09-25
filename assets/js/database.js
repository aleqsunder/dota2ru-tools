class datadocs
{
    constructor ({ database_name, username, password })
    {
        this.database_name = database_name;
        
        this.username = get('docs-username', true) || undefined;
        this.password = get('docs-password', true) || undefined;
    }
    
    saveSmiles ()
    {
        let date = Date.now();
        set('lasttime', date);
        
        return this.send ({
            type: 'setsmiles',
            username: this.username || get('docs-username', true),
            password: this.password || get('docs-password', true) || get('docs-username', true),
            text: get('a-dota2smile', true),
            cath: get('cath', true),
            date: date
        });
    }
    
    getSmiles (name)
    {
        name = name || this.username || get('docs-username', true);
        
        return this.send ({
            type: 'getsmiles',
            username: name
        });
    }
    
    loadSmiles ()
    {
        this.getSmiles()
        .then((res) => {
            if (res.type == 'Успешно')
            {
                if (res.lasttime > JSON.parse(get('lasttime')))
                {
                    log(`GetSmiles > ${res.type} > Смайлы на сервере новее, присваиваем себе`);
                    set('a-dota2smile', res.value, true);
                    set('cath', res.cath, true);
                    set('lasttime', res.lasttime);
                    
                    document.location.reload();
                }
                else
                {
                    log(`GetSmiles > ${res.type} > У вас самые свежие смайлы`);
                }
            }
            else
            {
                log(`GetSmiles > ${res.type} > ${res.name}`);
            }
        });
    }
    
    registration ({ password })
    {
        if (!password)
            return { type: 'Ошибка', name: 'Регистрация не удалась - не указан пароль' }
        
        return this.send ({
            type: 'register',
            username: get('docs-username', true),
            password: password
        });
    }
    
    changePassword ({ old, to })
    {
        let incaps = this;
        
        return this.send ({
            type: 'changepassword',
            username: get('docs-username', true),
            oldpassword: old,
            newpassword: to
        })
        .then((res) => {
            if (res.type == 'Успешно')
            {
                log (`changePassword > ${res.type} > ${res.name}`);
                set('docs-password', res.newpass, true);
                incaps.password = res.newpass;
                
                change('success', `changepassword ifpasschanged`, `${res.type} > ${res.name}`);
            }
            else if (res.caption == 'incorrectOldPassword')
            {
                if (!has('docs-password', true) || get('docs-username') == res.pass)
                {
                    log (`changePassword > Забыли пароль? Напишите мне в личку > AdmAlexander`);
                }
                
                log (`changePassword > ${res.name}`);
                change('failed', `changepassword ifpasschanged`, `${res.type} > ${res.name}`);
            }
            
            change('finally', `changepassword ifpasschanged`);
            __('changepassword input[oldpass]').value = res.newpass;
            __('changepassword input[newpass]').value = ''; 
            
            return res;
        });
    }
    
    stayPassword ({ password })
    {
        let incaps = this;
        
        return this.send ({
            type: 'staypassword',
            username: get('docs-username', true),
            password: password
        })
        .then((res) => {
            console.log(res.type);
            
            if (res.type == 'Успешно')
            {
                log (`stayPassword > ${res.type} > ${res.name}`);
                set('docs-password', res.pass, true);
                incaps.password = res.pass;
                
                change('success', `staypassword ifpasschanged`, `${res.name}`);
                __('staypassword input[thispass]').value = res.pass;
            }
            else if (res.caption == 'incorrectOldPassword')
            {   
                log (`${res.type} > ${res.name}`);
                change('failed', `staypassword ifpasschanged`, `${res.name}`);
            };
            
            change('finally', `staypassword bottom fing`);
            return res;
        });
    }
    
    firstInit ()
    {
        let incaps = this;
        
        watching
        ({
            elem: 'div.userbar span.username',
            callback: function (el)
            {
                set('docs-username', el.innerText, true);
                incaps.username = el.innerText;
                
                incaps.registration({ password: el.innerText })
                .then (function (res) {
                    if (res.type == 'Успешно')
                    {
                        log (`Register > ${res.type} > Пользователь успешно зарегистрирован!`);
                        incaps.password = get('docs-username', true);
                        set('docs-password', get('docs-username', true), true);
                    }
                    else
                    {
                        log(`Register > ${res.type} > ${res.name}`);
                    }
                    
                    incaps.loadSmiles();
                });
            }
        });
    }
    
    send (p)
    {
        let url = `https://script.google.com/macros/s/${this.database_name}/exec`;
        
        return fetch(url, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(p)
        })
        .then(function (res) {
            if (res.status)
            {
                let response = {};
                
                switch (res.status)
                {
                    case 200:
                        response = res.json();
                    break;
                        
                    case 400:
                        response = { type: 'Ошибка', name: 'Некорректный запрос' }
                    break;
                        
                    case 401:
                    case 407:
                        sendCall('google401');
                        response = { type: 'Ошибка', name: 'Необходима авторизация в Google!' }
                    break;
                        
                    case 403:
                        response = { type: 'Ошибка', name: 'Нет доступа' }
                    break;
                        
                    case 404:
                    case 410:
                        response = { type: 'Ошибка', name: 'Файл не найден' }
                    break;
                        
                    case 408:
                        response = { type: 'Ошибка', name: 'Сервер не ответил' }
                    break;
                        
                    case 414:
                        response = { type: 'Ошибка', name: 'Размер URL превышает разрешенный размер' }
                    break;
                        
                    case 429:
                        response = { type: 'Ошибка', name: 'Слишком много запросов, выполнение отклонено' }
                    break;
                        
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                    case 520:
                        response = { type: 'Ошибка', name: 'Внутренняя ошибка сервера' }
                    break;
                        
                    default:
                        response = { type: 'Ошибка', name: `${res.status}: незарегистрированная ошибка` }
                    break;
                }
                
                return response;
            }
            else
            {
                return { type: 'Ошибка', name: 'Ответ не получен' }
            }
        })
        .catch(err => console.log(err));
    }
}