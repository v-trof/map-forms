import { required, text, Text, withValidation, invalid } from "@map-forms/core";

type SignupForm = {
    name: Text;
    password: Text;
}

type SignupDTO = {
    name: string;
    password: string;
}

export const createSignup = () => {
    const form: SignupForm = {
        name: text(),
        password: text()
    }

    const getValue = withValidation<SignupDTO>(() => {
        const name = form.name.validate(required);
        const password = form.password.validate(required);

        if (!name.isValid || !password.isValid) return invalid;

        return {
            name: name.value,
            password: password.value
        }
    })

    return { form, getValue }
}