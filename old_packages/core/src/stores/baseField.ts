import { makeAutoObservable, observable, runInAction } from "mobx";
import { getValue, isRemoved } from "../protocol/accessAnnotations";
import { accessContext } from "../protocol/accessContext";
import { ValidationError, Validator } from "../protocol/error";
import { required } from "../validators/validators";

export type BaseField<Value, ValidValue> = {
    value: Value;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    isValid: boolean;
    interactionStatus: 'new' | 'active' | 'wasActive';
    [getValue]: () => ValidationError | ValidValue;
    [isRemoved]: boolean;
}

export type BaseFieldOptions<Value> = {
    required: boolean;
    initialValue: Value;
    runtimeValidator?: Validator<any>;
}

export const makeBaseField = <Value, ValidValue>(options: BaseFieldOptions<Value>): BaseField<Value, ValidValue> => {
    let value = observable.box(options.initialValue);

    const fieldStore: BaseField<Value, ValidValue> = {
        get value() {
            accessContext.onAccess(fieldStore.interactionStatus, fieldStore.isValid);
            return value.get();
        },
        set value(newValue: Value) {
            fieldStore.validationErrors.backend = undefined;
            value.set(newValue);
        },

        validationErrors: {
            parsing: undefined,
            backend: undefined,
            get runtime() {
                const requiredError = required(fieldStore.value);

                if (requiredError) {
                    return options.required ? requiredError : undefined;
                }

                if (options.runtimeValidator) {
                    // required filters out undefined
                    return options.runtimeValidator(fieldStore.value);
                }

                return undefined;
            },
        },
        get isValid() {
            return !Boolean(fieldStore.validationErrors.parsing || fieldStore.validationErrors.backend || fieldStore.validationErrors.runtime)
        },

        interactionStatus: 'new',

        [getValue]: (): ValidValue | ValidationError => {
            accessContext.onAccess(fieldStore.interactionStatus, fieldStore.isValid);

            if (accessContext.type === 'submit') {
                runInAction(() => {
                    fieldStore.interactionStatus = 'wasActive';
                    fieldStore.validationErrors.backend = undefined;
                });
            }

            const errors = [
                fieldStore.validationErrors.parsing,
                fieldStore.validationErrors.backend,
                fieldStore.validationErrors.runtime
            ].filter(maybeError => maybeError !== undefined);

            if (errors.length > 0) {
                return errors[0]!;
            }

            return fieldStore.value as unknown as ValidValue;
        },
        [isRemoved]: false,
    }

    return makeAutoObservable(fieldStore, { value: false });
}