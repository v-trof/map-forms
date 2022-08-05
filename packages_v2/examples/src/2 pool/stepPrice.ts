import { all, invalid, minValue, numeric, Numeric, required, validationMessage, ValidationMessage, withValidation } from "@map-forms/core"

export type StepPrice = {
    minPrice: Numeric,
    maxPrice: Numeric,
    minLessMax: ValidationMessage;
}

export const createStepPrice = () => {
    const form: StepPrice = {
        minPrice: numeric({ type: 'float' }),
        maxPrice: numeric({ type: 'float' }),

        minLessMax: validationMessage()
    }

    const getValue = withValidation(() => {
        const minPrice = form.minPrice.validate(all(required, minValue(0)))
        const maxPrice = form.maxPrice.validate(all(required, minValue(0)))

        if (minPrice.isValid && maxPrice.isValid) {
            const isMinLessThanMax = form.minLessMax.validate(() => {
                if (minPrice <= maxPrice) {
                    return { isValid: true, value: undefined }
                }

                return { isValid: false, error: { code: 'minPriceMustBeLessThanMax' } }
            })

            if (!isMinLessThanMax.isValid) {
                return invalid;
            }

            return {
                minPrice: minPrice.value,
                maxPrice: maxPrice.value
            }
        }

        return invalid
    })

    return { form, getValue }
}