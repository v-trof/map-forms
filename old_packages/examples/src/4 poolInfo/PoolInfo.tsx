import { Box, Button, Checkbox, Flex, Select, VStack } from "@chakra-ui/react";
import { noSubmit as removed } from "@informal/state-mobx";
import { useMemo } from "react"
import { useRouter } from "../fakeNormalAppServices/router";
import { FakeResponse, post } from "../fakeNormalAppServices/transport";
import { useTranslation } from "../fakeNormalAppServices/useTranslation";
import { useSelect, useSubmit, useTextField } from "../ui-hooks/state-mobx/chakraHoksStateMobx";
import { FormInput, FormSelect, FormTextarea } from "../ui-hooks/state-mobx/Form";
import { createPoolInfoStore, PoolInfoDTO } from "./poolInfoStore"

export const PoolInfo = () => {
    const t = useTranslation();
    const router = useRouter();

    const store = useMemo(() => createPoolInfoStore({project:{title: 'wow proj', description: 'so informative'}}), []);
    const { handleSubmit, isSubmitting } = useSubmit(store, async (values: PoolInfoDTO) => {
        const fakeResponse: FakeResponse<undefined> = { ok:true, value: undefined };
        
        const result = await post('api/signup', values, fakeResponse);
        
        if(result.ok) {
            router.navigate('/profile');
            return;
        }
    });

    const title = useTextField(store.title);
    const type = useSelect(store.type);
    const publicDesc = useTextField(store.publicDescription);
    const privateDesc = useTextField(store.privateDescription);

    return (
        <Flex bg="gray.100" align="center" justify="center" h="100vh" w="100vw">
            <Box bg="white" p={6} rounded="md">
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="flex-start">
                        <FormInput label={t('title')} {...title} />

                        {/* This is messy but it would be anyway */}
                        {/* Removed decorator is cool coz it is not a wrapper and you can make it a getter */}
                        <FormTextarea 
                            label={<div>{t('public desc')} <Checkbox checked={publicDesc[removed]} onChange={(e) => publicDesc[removed] = e.target.checked} /></div>}
                            {...publicDesc}
                            isReadOnly={publicDesc[removed]}
                            placeholder={store._projectDescription}
                            value={publicDesc[removed] ? '' : publicDesc.value}
                        />

                        {/* This is more common for a removable and it looks good */}
                        <Button onClick={store.privateDescription.restore}>{t('+ private desc')}</Button>
                        {store.privateDescription.isRemoved === false && (
                            <FormTextarea label={t('private desc')} {...privateDesc} />
                        )}
                        
                        <FormSelect label={t('pool type')} {...type}>
                            <option value='option1'>Option 1</option>
                            <option value='option2'>Option 2</option>
                            <option value='option3'>Option 3</option>
                        </FormSelect>
                        
                        <Button type="submit" colorScheme="purple" width="full" isLoading={isSubmitting}>
                            {t('signup')}
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    )
}