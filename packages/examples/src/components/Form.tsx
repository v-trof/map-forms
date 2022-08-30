import { FormControl, FormErrorMessage, FormLabel, Input, InputProps, Select, SelectProps, Textarea, TextareaProps } from "@chakra-ui/react"
import { useMemo } from "react"

let count = 0;
let uniqueId = () => `id-${++count}`;

type ContainerProps = { label: React.ReactNode, error: React.ReactNode };

export const FormInput = ({ id, label, error, ...props}: InputProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id])

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Input
                {...props}
                id={inputId}
                variant="filled"
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}

export const FormTextarea = ({ id, label, error, ...props}: TextareaProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id])

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Textarea
                {...props}
                id={inputId}
                variant="filled"
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}

export const FormSelect = ({ id, label, error, ...props}: SelectProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id])

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Select
                {...props}
                id={inputId}
                variant="filled"
            >
                {props.children}
            </Select>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}