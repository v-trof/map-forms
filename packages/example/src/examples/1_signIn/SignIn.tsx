import { input } from '@informal/pkg';
import { Button, Input } from 'antd';
import { observer } from 'mobx-react-lite';
import { z } from 'zod';

import { useSubmit, useTextInput } from '../../antdHooksMobx';
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

const InputWithLabel = ({
    label,
    error,
    ...props
}: { label: string; error: string | undefined } & React.ComponentProps<
    typeof Input
>) => (
    <>
        <label>{label}</label>
        <Input {...props} />
        <div style={{ color: 'red' }}>{error}</div>
    </>
);

export const SignIn = observer(({ store }: { store: SignInStore }) => {
    const t = useTranslation();
    const login = useTextInput(store.login);
    const password = useTextInput(store.password);

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
                <InputWithLabel label={t('Login')} {...login} />
                <br />
                <InputWithLabel label={t('Password')} {...password} />
                <br />
                <Button loading={isSubmitting} htmlType='submit'>
                    Submit
                </Button>
            </form>
        </div>
    );
});
