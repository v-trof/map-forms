import { Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';

import { Page, TextInput } from '../../DesignSystem';
import { useSubmit, useTextInput } from '../../antdHooksMobx';
import { post } from '../../fakeNormalAppServices/transport';
import { useTranslation } from '../../fakeNormalAppServices/useTranslation';

import { FancyPasswordChecksStore } from './fancyPasswordChecksStore';

const Check = observer(
    ({ title, passed }: { title: string; passed: boolean }) => {
        return (
            <div>
                {passed ? '✅' : '❌'} {title}
            </div>
        );
    }
);

export const FancyPasswordChecks = observer(
    ({ store }: { store: FancyPasswordChecksStore }) => {
        const t = useTranslation();
        const login = useTextInput(store.login);
        const password = useTextInput(store.password);

        const { handleSubmit, isSubmitting } = useSubmit(
            store,
            async (value) => {
                await post('/sign-in', value, { ok: true, value: 0 });
            }
        );

        return (
            <Page>
                <form onSubmit={handleSubmit}>
                    <TextInput label={t('Login')} {...login} />
                    <br />
                    <TextInput label={t('Password')} {...password} />

                    <div style={{ textAlign: 'left' }}>
                        {t('Password requirements')}
                        <Check
                            title={t('At least 8 characters long')}
                            passed={store.passwordChecks.minLength}
                        />

                        {t('At least 2 of the below')}
                        <Check
                            title={t('Has letters')}
                            passed={store.passwordChecks.letters}
                        />
                        <Check
                            title={t('Has numbers')}
                            passed={store.passwordChecks.numbers}
                        />
                        <Check
                            title={t('Has special characters')}
                            passed={store.passwordChecks.special}
                        />
                    </div>
                    <br />
                    <Button isLoading={isSubmitting} type='submit'>
                        Submit
                    </Button>
                </form>
            </Page>
        );
    }
);
