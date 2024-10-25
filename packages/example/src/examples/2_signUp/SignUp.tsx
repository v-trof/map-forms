import { Alert, AlertIcon, AlertTitle, Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';

import { Page, TextInput } from '../../DesignSystem';
import { useError, useSubmit, useTextInput } from '../../antdHooksMobx';
import { post } from '../../fakeNormalAppServices/transport';
import { useTranslation } from '../../fakeNormalAppServices/useTranslation';

import { SignUpStore } from './signUpStore';

export const SignUp = observer(({ store }: { store: SignUpStore }) => {
    const t = useTranslation();
    const login = useTextInput(store.login);
    const password = useTextInput(store.password);
    const notSame = useError(store.notSame);

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
                {notSame && (
                    <>
                        <Alert status='error'>
                            <AlertIcon />
                            <AlertTitle>{notSame}</AlertTitle>
                        </Alert>
                        <br />
                    </>
                )}
                <Button isLoading={isSubmitting} type='submit'>
                    Submit
                </Button>
            </form>
        </Page>
    );
});
