# Informal/core


Че-то я устал это писать, лучше словами завтра объясню ребятам, а там посмотрим что очевидно, а что -- нет.
  

## Основаня идея

Форма &mdash; cпособ помочь пользователю ввести данные в понятном модели формате (модель обычно на беке). И в этом смысле форма это не только поля и валидации, но и подсказки в алертах, "итоговая сумма" в форме заказа и т.д. Мы уже умеем использовать React + Mobx, чтобы удобно показывать данные, рендерить controlled инпуты, и гонять бизнес логику, вроде той же "итоговой суммы" в форме заказа. Но менеджить невалидные состояния и зависимости между полями &mdash; боль. Эту боль informal и решает.

**Informal менеджит состояние полей и валидации, не усложняя код обертками на стороми / компонентами**. При этом форма получается typesafe, composable и performant. А код infromal сливается с остальным стором и вьюхой.

## Getting started

Давайте пройдем процесс создания формы регистрации. Начнем с максимально простого варианта и будем постепенно ее усложнять. 

#### В итоге у нас будет форма где
- Есть поля `username` и `password`, оба обязательные и определенной длинны
- Мы проверим что `username` и `password` не совпадаеют
- А так же на беке что `username` не занят
- И покажем все эти ошибки пользователю

#### Начнем с общей идеи формы, у нас будет 2 поля занчения которых &mdash; строки
```ts
import { Field, field } from "@informal/core"

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
}

export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(),
        password: field()
    };

    return makeAutoObservable(store);
}
```
И тут мы уже видим главный концепт informal &mdash; `field`. `field` &mdash; это mobx стор со следующими полями:
```ts
export type Field<Value> = {
    value: Value | undefined;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
    [getValue]: () => ValidationError | Value;
}
```
Давайте разберем что каждое из них делает. 
- `value` &mdash; текущее значение поля. Не обязтельно валидное.
- `validationErrors` &mdash; ошибки валидации котоыре надо будет показать пользователю, когда придет время. Они разделены на несколько типов
    - `parsing` &mdash; когда значение читать бесполезно потому что оно не распарсилось: например если если в number input ввели `1hehehe.`
    - `runtime` &mdash; ошибки валидаторов, как передать вадидаторы посмотрим на следующем шаге.
    - `backend` &mdash; ошибки 

У нас уже есть форма из 2 обязательных полей (поля обязательные по умолчанию). И ts за нас вывел что класть в них можно будет только строки.

#### Добавим валидации на значения полей
```ts
import { Field, field, minLength, maxLength } from "@informal/core"

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
    notSame: Check;
}

export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(minLength(4), maxLength(20)),
        password: field(minLength(8))
    };

    return makeAutoObservable(store);
}
```
У каждого поля валидаторы личные, так оно работает быстрее и композируется легче.

Добавим валидацию, что `username` и `password` не совпадают
Чтобы показывать эту валидацию отдельно, используем `check` 
```ts
import { Field, field, minLength, maxLength, error } from "@informal/core"

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
    notSame: Check;
}

export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(minLength(4), maxLength(20)),
        password: field(minLength(8)),
        notSame: check(() => {
            if (store.login.value === store.password.value) {
                return error('error.password=login');
            }
        })
    };

    return makeAutoObservable(store);
}
```
`check` это такой легковесный `field`, у которого нет значения, а состояние "редактировали ли меня"
Эта ошибка начнет показывать только когда и в `username` и в `password` валидные значения.

<details>
<summary>
    Если бы мы хотели показывать ошибку прямо под паролем а не отдельно можно сделать так:
</summary>

```ts
import { Field, field, minLength, maxLength, error } from "@informal/core"

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
}

export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(minLength(4), maxLength(20)),
        password: field(minLength(8), () => {
            if (store.login.value === store.password.value) {
                return error('error.password=login');
            }
        })
    };

    return makeAutoObservable(store);
}
```   
API валидации у `check` аболютно аналогично api валидации у `field`.

---
</details>

<br />
<br />

**У нас уже есть полностью готовый стор, давайте его рендерить**

```tsx
import { useTextField, useCheck } from "@informal/core"

export const Signup = observer(() => {
    const t = useTranslation();

    const store = useMemo(() => createSignupStore(), []);

    const login = useTextField(store.login);
    const password = useTextField(store.password);
    const notSame = useCheck(store.notSame);

    return (
        <form>
            <label>
                {t('login')}<br />
                <input {...login} />
                {login.error && <div class="error">{login.error}</div>}
            </label>

            <label>
                {t('password')}<br />
                <input {...password} />
                {password.error && <div class="error">{password.error}</div>}
            </label>

            {notSame.error && <div class="error">{notSame.error}</div>}
        </form>
    )
})
```
Мы использовали наши поля через `useTextField`, этот хук принимает один `field` из стора и маппит его в удобный реакту формат. `useCheck` делает то же самое.

<details>
<summary>
    Если бы мы хотели показывать ошибку прямо под паролем а не отдельно можно сделать так:
</summary>

```ts
import { Field, field, minLength, maxLength, error } from "@informal/core"

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
}

export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(minLength(4), maxLength(20)),
        password: field(minLength(8), () => {
            if (store.login.value === store.password.value) {
                return error('error.password=login');
            }
        })
    };

    return makeAutoObservable(store);
}
```   
API валидации у `check` аболютно аналогично api валидации у `field`.

---
</details>

```tsx
import { useTextField, useCheck, useSubmit, error } from "@informal/core"

export type SignupDTO = {
    login: string;
    password: string
};

export const Signup = observer(() => {
    const t = useTranslation();
    const router = useRouter();

    const store = useMemo(() => createSignupStore(), []);

    const login = useTextField(store.login);
    const password = useTextField(store.password);
    const notSame = useCheck(store.notSame);

    const { handleSubmit, isSubmitting } = useSubmit(store, async (values: SignupDTO) => {
        const result = await post('api/signup', values, fakeResponse);
        
        if(result.ok) {
            router.navigate('/profile');
            return;
        }

        runInAction(() => {
            if(result.errors.find(err => err.code === 'USERNAME_TAKEN')) {
                store.login.validationErrors.backend = error('error.usernameTaken')
            }
        })
    });

    return (
        <form onSubmit={handleSubmit}>
            <FormTextarea label={t('login')} {...login} />
            <FormTextarea type="password" label={t('password')} {...password} />

            {notSame && <Alert status='error'><AlertIcon />{notSame}</Alert>}
            
            <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>
                {t('signup')}
            </Button>
        </form>
    )
})
```