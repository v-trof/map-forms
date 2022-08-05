import { Select, text, Text, select, withValidation, required, alwaysValid, all, minLength, noEmoji, invalid } from "@map-forms/core"
import { PoolType } from "./poolApi";

export type StepGeneral = {
    title: Text;
    description: Text;
    type: Select<PoolType>;
}

export const createStepGeneral = () => {
    const form: StepGeneral = {
        title: text(),
        description: text(),
        type: select()
    }

    const getValue = withValidation(() => {
        const title = form.title.validate(all(required, noEmoji, minLength(4)));
        const description = form.description.validate(alwaysValid);
        const type = form.type.validate(required)

        if (title.isValid && description.isValid && type.isValid) {
            return {
                title: title.value,
                description: description.value,
                type: type.value
            };
        }

        return invalid;
    })

    return { form, getValue }
}