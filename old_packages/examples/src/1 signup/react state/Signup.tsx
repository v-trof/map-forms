import React, { useState } from "react"
import { useTranslation } from "../../fakeNormalAppServices/useTranslation";
import { Alert, Box, TextField } from '@mui/material'
import {LoadingButton} from '@mui/lab'
import { post } from "../../fakeNormalAppServices/transport";

type InteractionStatus = 'new' | 'active' | 'wasActive'

export const SignupReactState = () => {
    const t = useTranslation();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const [nameStatus, setNameStatus] = useState<InteractionStatus>('new');
    const [passwordStatus, setPasswordStatus] = useState<InteractionStatus>('new');

    const notSameError = name === password && t('error.password=name');
    const nameError = name.length === 0 && t('error.required');
    const passwordError = (password.length < 8 && t('error.minLength', {length: 8})) || (password.length > 20 && t('error.maxLength', {length: 20}));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        setPasswordStatus('wasActive');
        setNameStatus('wasActive');

        if(nameError || passwordError || notSameError) {
            return;
        }

        setIsSubmitting(true);
        try {
            await post('/signup', { name, password })
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form>
             <Box sx={{ mb: 2 }}>
                <TextField 
                    label="Name" 
                    value={name} onChange={(e) => {setName(e.target.value); setNameStatus('active')}}
                    onBlur={() => setNameStatus('wasActive')}
                    error={Boolean(nameStatus === 'wasActive' && nameError)} 
                    helperText={nameStatus === 'wasActive' && (nameError || undefined)} 
                    variant="outlined"/>
            </Box>
            <Box sx={{ mb: 2 }}>
                <TextField 
                    label="Password" 
                    value={password} onChange={(e) => {setPassword(e.target.value); setPasswordStatus('active')}}
                    onBlur={() => setPasswordStatus('wasActive')}
                    error={Boolean(passwordStatus === 'wasActive' && passwordError)} 
                    helperText={passwordStatus === 'wasActive' && (passwordError || undefined)} 
                    variant="outlined"/>
            </Box>
            <Box sx={{ mb: 2 }}>
                {notSameError && (passwordStatus === 'wasActive' || nameStatus === 'wasActive') && !nameError && !passwordError && <Alert severity="error">{notSameError}</Alert>}
            </Box>
            <Box sx={{ mb: 2 }}>
                <LoadingButton loading={isSubmitting} role="submit" onClick={submit}>Submit</LoadingButton>
            </Box>
        </form>
    )
}