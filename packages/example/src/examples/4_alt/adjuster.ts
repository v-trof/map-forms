import {
    alt,
    constant,
    error,
    input,
    removable,
    valid,
    validation,
    validSingle,
} from '@informal/pkg';
import { z } from 'zod';

const manualMixing = () => {
    return {
        type: 'manualMixing',
        tasksPerSuite: input(z.number().int().min(0).max(1000)),
    };
};

const smartMixing = () => {
    const normal = input(z.number().int().min(0).max(1000));
    const golden = input(z.number().int().min(0).max(1000));
    const training = input(z.number().int().min(0).max(1000));

    const store = {
        type: 'smartMixing',
        normal: normal,
        golden: golden,
        training: training,
        notEmptySuite: validation(
            z
                .any()
                .refine(
                    () =>
                        valid(normal) !== 0 ||
                        valid(golden) !== 0 ||
                        valid(training) !== 0,
                    error(
                        'There must be at least one type of tasks in suite that is not 0'
                    )
                )
        ),

        allowPartialSuite: input(z.boolean()),
        minNormal: input(
            z
                .number()
                .int()
                .min(0)
                .refine(
                    (value) => value <= validSingle(normal),
                    'value must be less than max normal tasks'
                )
        ),

        minGolden: input(
            z
                .number()
                .int()
                .min(0)
                .refine(
                    (value) => value <= validSingle(normal),
                    'value must be less than max normal tasks'
                )
        ),

        minTraning: input(
            z
                .number()
                .int()
                .min(0)
                .refine(
                    (value) => value <= validSingle(normal),
                    'value must be less than max normal tasks'
                )
        ),
    };

    return store;
};

export const mixing = () =>
    alt(
        {
            smart: smartMixing(),
            manual: manualMixing(),
        },
        'smart'
    );

const topNAdjuster = () => {
    return {
        type: constant('TopN'),
        count: input(z.number().int().min(1)),
    };
};

const topPercentAdjuster = () => {
    return {
        type: constant('Top%'),
        percent: input(z.number().int().min(1).max(100)),
    };
};

export const adjuster = () =>
    alt(
        {
            count: topNAdjuster(),
            percent: topPercentAdjuster(),
        },
        'percent'
    );

export const poolInfo = () => {
    return {
        name: input(z.string().max(3000)),
        description: removable(input(z.string().max(3000))),
        mixing: mixing(),
        adjuster: adjuster(),
    };
};
