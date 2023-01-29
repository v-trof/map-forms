# Call this shit human interaction lol
Key entities
- parser
    - parse => value() or error()
    - hydrate => state()
- validator value => valid() or error()

- input
- errorBox <- still hope to find a better name for this one

- input has approved flag
- validators in (all) return errors in order they were called
- have a fancy use case -> build your own combinator / error object / reuse validators
- input types

---

input<value> // required, output values same as initial save for undefined
input.optional<value>
input.parsed<state, value>
input.parsed.optional<state, value> // required is the only type changing validator anyway

// allow validate state of a input.parsed


allow building custom error containers and inputs by providing relevant symbols
---

// I'd like to avoid overrides here i guess and go for sparate names
// reader are 100% more complex, so leave nice names for them
ok now what about reading the state?
- state() // raw
    | ^
    v |
- value() // parsed
    |
    v
- valid() // all possible validators passed including submit & state & value, computed
    |
    v
- submit() // parsed + valid, approve evertything on call

.setValue(newValue, {approve})
.setState(newState, {approve})
.setErorr(state | value | value | submit, error)

submit(state)

---

on submit errors: basically an error belonging to a submitted value (which is always approved)

so a beatiful design would be an input with a ladder of values

state
parsed
submitted


and validators corresponding to each of them