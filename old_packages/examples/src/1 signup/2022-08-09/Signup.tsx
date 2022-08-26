import { autoSubmit, check, Check, error, field, Field, useAutoSubmit, useCheck, useTextField, ValidationResult } from "@stateful-forms/core-2022-08-09"
import { makeAutoObservable } from "mobx";
import { FC, useTransition } from "react";
import { useRouter } from "../../fakeNormalAppServices/router";
import { post } from "../../fakeNormalAppServices/transport";
import { useTranslation } from "../../fakeNormalAppServices/useTranslation";

type SignupDTO = {
    name: string;
    password: string;
}

type SignupStore = {
    name: Field<string>;
    password: Field<string>;
    notSame: Check;
}

const createSignup = () => {
    const signup: SignupStore = makeAutoObservable({
        name: field<string>(),
        password: field<string>(),
        notSame: check(() => {
            if(signup.name.value === signup.password.value) {
                return error('signup.error.name=password')
            }
        })
    })

    return signup;
}

export const Signup: FC<{store: SignupStore}> = ({ store }) => {
    const t = useTranslation();
    const router = useRouter();
    
    const name = useTextField(store.name);
    const password = useTextField(store.password);

    const notSame = useCheck(store.notSame);

    const { isSubmitting, onSubmit } = useAutoSubmit(store, async (value) => {
        const result = await post<SignupDTO>('/user/signup', value);
        
        if(result.ok) {
            router.navigate('user/profile');
            return;
        }

        const usernameTaken = result.errors.find(err => err.message === 'usernameTaken');
        
        if(usernameTaken) {
            store.name.validationErrors.backend = usernameTaken;
            return 'error';
        }

        if(!usernameTaken || result.errors.length > 1) {
            alert(JSON.stringify(result.errors));
        }
    });

    return (
        <form onSubmit={onSubmit}>
            <label>Name</label>
            <input {...name} />
            {name.error && <div className="error">{t(name.error.message, name.error.params)}</div>}

            <label>Password</label>
            <input type='password' {...password} />
            {password.error && <div className="error">{t(password.error.message, password.error.params)}</div>}

            {notSame.error && (
                <div className="alert-danger">{t(notSame.error.message, notSame.error.params)}</div>
            )}

            {isSubmitting ? <button>{t('submit')}</button> : 'Submitting...'}
        </form> 
    )
}