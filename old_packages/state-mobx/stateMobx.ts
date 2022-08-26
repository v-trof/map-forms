import { check, Check } from './src/check'
import { field, Field } from './src/field'
import { autoSubmit, submit, noSubmit, getError } from './src/submit'
import { ValidationResult, ValidationError } from './src/validation/validationTypes'

export type {
    Check,
    Field,
    ValidationResult,
    ValidationError
}

export {
    check,
    field,
    autoSubmit,
    submit, noSubmit, getError
}

export * from './src/validation/validators'

export { getErrorAfterInteraction, getHighestPriorityError } from './src/errorPicker/getErrorOnInteractionEnd'

// experimental api
export { ensureValid, valid } from './src/_experiment/valid'
export { modifySubmit, modifyValid } from './src/_experiment/modifyValid'