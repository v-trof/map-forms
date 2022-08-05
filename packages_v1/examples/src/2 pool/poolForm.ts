import { all, invalid, minValue, required, withValidation } from "@map-forms/core"
import { PoolDTO } from "./poolApi"
import { createStepGeneral, StepGeneral } from "./stepGeneral"
import { createStepPrice, StepPrice } from "./stepPrice"

type PoolForm = {
    steps: {
        general: StepGeneral
        price: StepPrice
    }
}

export const createPoolStore = (id: string) => {
    const stepGeneral = createStepGeneral();
    const stepPrice = createStepPrice();

    const form: PoolForm = {
        steps: {
            general: stepGeneral.form,
            price: stepPrice.form
        }
    }

    const getValue = withValidation(() => {
        const general = stepGeneral.getValue()
        const price = stepPrice.getValue()

        if (!general.isValid || !price.isValid) {
            return invalid;
        }

        if (general.value.type === 'default') {
            const minPriceResult = stepPrice.form.minPrice.validate(all(required, minValue(0.01)));
            if (!minPriceResult.isValid) return invalid;
        }

        const poolDTO: PoolDTO = {
            id,
            publicDescription: general.value.description,
            ...general.value,
            ...price.value
        }

        return poolDTO;
    })

    return { form, getValue }
}