import { alt, removable } from '../compose';
import { error } from '../domain';
import { errorBox, input, valueBox } from '../informal';
import { number, parsed } from '../parsed';
import {
    all,
    inRange,
    maxLength,
    minLength,
    valid,
    value,
} from '../validators';

const manualMixing = () => {
    return {
        type: 'manualMixing',
        tasksPerSuite: parsed(number, inRange(0, 1000)),
    };
};

const smartMixing = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store: any = {
        type: 'smartMixing',
        normal: parsed(number, inRange(0, 1000)),
        golden: parsed(number, inRange(0, 1000)),
        training: parsed(number, inRange(0, 1000)),
        notEmptySuite: errorBox(() => {
            if (
                valid(store.normal) === 0 &&
                valid(store.golden) === 0 &&
                valid(store.training) === 0
            ) {
                return error(
                    'There must be at least one type of tasks in suite that is not 0'
                );
            }
        }),

        allowPartialSuite: input<boolean>(),
        minNormal: parsed(
            number,
            inRange(0, () => value(store.normal))
        ),

        minGolden: parsed(
            number,
            inRange(0, () => value(store.golden))
        ),

        minTraning: parsed(
            number,
            inRange(0, () => value(store.training))
        ),
    };

    return store;
};

export const mixing = () =>
    alt(
        {
            smart: smartMixing(),
            manual: manualMixing(),
        }, // consider lazy init
        'smart'
    );

const topNAdjuster = () => {
    return {
        type: valueBox('TopN'),
        count: parsed(number, inRange(1, Infinity)),
    };
};

const topPercentAdjuster = () => {
    return {
        type: valueBox('Top%'),
        percent: input<number>(), // aware of used widget which is somewhat weird
    };
};

// i don't exactly like this api but it does encourage good design
export const adjuster = alt(
    {
        count: topNAdjuster(),
        percent: topPercentAdjuster(),
    },
    'percent'
);

// might feel awnkward but should encourage good design
export const poolInfo = () => {
    return {
        name: input<string>(),
        description: removable(input(maxLength(3000))),
    };
};
