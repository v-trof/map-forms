import { Alert, AlertIcon, Box, Button, Flex, VStack } from "@chakra-ui/react";
import { all, check, Check, error, ExtractValue, field, Field, getValue, maxLength, minLength, modifyError, noSubmit, useSubmit } from "@informal/core"
import { makeAutoObservable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useRouter } from "../fakeNormalAppServices/router";
import { post, FakeResponse } from "../fakeNormalAppServices/transport";
import { useTranslation } from "../fakeNormalAppServices/useTranslation";
import { useCheck, useTextField } from "../components/FormHooks";
import { FormInput } from "../components/Form";
import { extractValue } from "@informal/core/src/accessors/submit";

export type SignupDTO = {
    login: string;
    password: string
};

export type SignupStore = {
    login: Field<string>;
    password: Field<string>;
    notSame: Check;
    anyFilled: Check;
}

// Почему валидаторы не принимают сообщения вторым аргументом
export const createSignupStore = () => {
    const store: SignupStore = {
        login: field(minLength(4)),
        password: field(all(minLength(8), maxLength(20))),
        notSame: check(() => {
            if (store.login.value === store.password.value) {
                return error('error.password=login');
            }
        }),
        anyFilled: check(() => {
            const value = extractValue(store);

            if(Object.values(value).filter((v) => v).length === 0) {
                return error('user_complaints_cant_be empty');
            }
        })
    };

    return makeAutoObservable(store);
}

export const Signup = observer(() => {
    const t = useTranslation();
    const router = useRouter();

    const store = useMemo(() => createSignupStore(), []);

    const login = useTextField(store.login);
    const password = useTextField(store.password);
    const notSame = useCheck(store.notSame);

    const { handleSubmit, isSubmitting } = useSubmit(store, async (values: SignupDTO) => {
        const fakeResponse: FakeResponse<undefined> = store.login.value?.includes('taken') ? {ok: false, errors: [{code: 'USERNAME_TAKEN'}]} : {ok:true, value: undefined};
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
        <Flex bg="gray.100" align="center" justify="center" h="100vh" w="100vw">
            <Box bg="white" p={6} rounded="md">
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="flex-start">
                        <FormInput label={t('login')} {...login} />
                        <FormInput type="password" label={t('password')} {...password} />

                        {notSame.error && <Alert status='error'><AlertIcon />{notSame.error}</Alert>}
                        
                        <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>
                            {t('signup')}
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    )
});