import { Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';

import { Page, TextInput } from '../../DesignSystem';
import { useSubmit, useTextInput } from '../../chakraHoksStateMobx';
import { post } from '../../fakeNormalAppServices/transport';
import { useTranslation } from '../../fakeNormalAppServices/useTranslation';

import { SignInStore } from './signInStore';

export const SignIn = observer(({ store }: { store: SignInStore }) => {
    const t = useTranslation();
    const login = useTextInput(store.login);
    const password = useTextInput(store.password);

    const { handleSubmit, isSubmitting } = useSubmit(store, async (value) => {
        await post('/sign-in', value, { ok: true, value: 0 });
    });

    return (
        <Page>
            <form onSubmit={handleSubmit}>
                <TextInput label={t('Login')} {...login} />
                <br />
                <TextInput label={t('Password')} {...password} />
                <br />
                <Button isLoading={isSubmitting} type='submit'>
                    Submit
                </Button>
            </form>
        </Page>
    );
});
