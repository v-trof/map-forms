import { error, input, valid, validation } from '@informal/pkg';
import { Button } from 'antd';
import { observer } from 'mobx-react-lite';
import { z } from 'zod';

import { TextInput, useSubmit, Validation } from '../../AntdFields';
import { post } from '../../fakeNormalAppServices/transport';
import { useTranslation } from '../../fakeNormalAppServices/useTranslation';

export const createSignUpStore = () => {
    const store = {
        login: input(z.string()),
        password: input(z.string().min(8).max(40)),
        notSame: validation(() => {
            if (valid(store.login) === valid(store.password)) {
                return error('password equal to login is not secure enough');
            }
        }),
    };

    return store;
};

export type SignUpStore = ReturnType<typeof createSignUpStore>;

export const SignUp = observer(({ store }: { store: SignUpStore }) => {
    const t = useTranslation();
    const { handleSubmit, isSubmitting } = useSubmit(store, async (value) => {
        await post<
            {
                login: string;
                password: string;
            },
            boolean
        >('/sign-in', value, { ok: true, value: true });
    });

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <form onSubmit={handleSubmit}>
                <TextInput label={t('Login')} store={store.login} />
                <br />
                <TextInput label={t('Password')} store={store.password} />
                <br />
                <Validation store={store.notSame} />
                <Button loading={isSubmitting} htmlType='submit'>
                    Submit
                </Button>
            </form>
        </div>
    );
});
