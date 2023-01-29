import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    InputProps,
    Select,
    SelectProps,
    Textarea,
    TextareaProps,
    Card,
    CardBody,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';

let count = 0;
const uniqueId = () => `id-${++count}`;

type ContainerProps = { label: React.ReactNode; error: React.ReactNode };

export const TextInput = ({
    id,
    label,
    error,
    ...props
}: InputProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id]);

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Input {...props} id={inputId} variant='filled' />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
};

export const FormTextarea = ({
    id,
    label,
    error,
    ...props
}: TextareaProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id]);

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Textarea {...props} id={inputId} variant='filled' />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
};

export const FormSelect = ({
    id,
    label,
    error,
    ...props
}: SelectProps & ContainerProps) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id]);

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Select {...props} id={inputId} variant='filled'>
                {props.children}
            </Select>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
};

export const Page: React.FC<{
    children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ maxWidth: `calc(100vw - 60px)`, width: '500px' }}>
                <Card>
                    <CardBody>{children}</CardBody>
                </Card>
            </div>
        </div>
    );
};
