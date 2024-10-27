import { input } from '@informal/pkg';
import { Button } from 'antd';
import { observer } from 'mobx-react-lite';
import { z } from 'zod';

import { TextInput, useSubmit } from '../../AntdFields';
import { post } from '../../fakeNormalAppServices/transport';
import { useTranslation } from '../../fakeNormalAppServices/useTranslation';

export const createSignInStore = () => {
    const store = {
        login: input(z.string()),
        password: input(z.string().min(8).max(40)),
    };

    return store;
};

export type SignInStore = ReturnType<typeof createSignInStore>;

export const SignIn = observer(({ store }: { store: SignInStore }) => {
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
                <Button loading={isSubmitting} htmlType='submit'>
                    Submit
                </Button>
            </form>
        </div>
    );
});
