# Premise
- You already have a design system of controlled components for inputs & error display
- You already have a way to write stores / business logic, and you use mobx for stores
- Forms in your app are more then just fields. They inculde conditions based on your business logic 
or informer views that do not care about your fields at all.

# Vision
- Informal should organically blend into your stores and views. 
Because fields and validations are just a part of the user scenario of filling in data, not it's entirety.

TODO: Narrow this down it is too long r/n
# Value
- Informal helps you to get only valid form values. It can also do so with nested / composed forms (stores).
- Informal does not wrap your non-form code at all. You keep complete control of it.
- Informal helps you to display the most relevant error when the user is ready to see it.
- Informal is typesafe.
- Informal is built with i18n in mind.
- Informal is not render sensitive you can use popup / collapse in your form without hacks.
- Informal supports per field validators, including async ones and managing after submit / value parsing errors.
- Informal supports validators that are based on several independent fields. See `multiValidator`.
Other libararies usually do these as form level validators. Informal handles this case in terms of displaying an error. 

# What informal does not do
- Similar to mobx, Informal does not provide a way to serialise / deserialise state out of the box. TODO: add an article on how to build your own solution.
- Informal does not provide any views such as inputs / error message containers etc. You can use mui / chackra ui with official bidings. TODO: write an adapter.
- Informal does not provide any sugar for settting initial values. Do it the same way you would fill a normal store with data.

# Key ideas
### On validation errors
- ValidationError message only matters for a spot where an error is displayed => `field` & `multiValidator`
- For the rest of the store / form valid value is what matters, and presense of error within it is a marker if invalid state

# Reference
## Key entities
### field
- A mobx observable. Contains state needed to extract value / decide if an error should be shown and which one.
- Is required by default. Use `field.optional` for fields that can be ignored while a part of the form.

### validator
Checks if user needs to do something before submitting a from again.
- Usually a pure function that checks if field's value is valid.
- Async validator does the same but isn't pure.
- External validator (for example errors from backend after submit) uses field's `_errors` state instead of value.

Validators are a middleware, order determines both order of execution and the order in which errors will be returned.
Default order for a `field(otherValidators)` is `parsing -> backend -> required -> otherValidators`

### multiValidator
- A mobx observable. Takes validator as an argument.
- **Computes** state needed to decide if an error should be shown and which one 
based on fields that were accessed during validator's execution.

### accessor
A way to get a value out of a store that contains informal's fields
- `submit` gets valid value or an error. Removes errors that do not block submit. Marks fields and multiValidators as "was submitted".
- `valid` gets valid value or throws an error, does not mutate state
TODO: do I need both

### annotation
Informal uses ES6 unique symbols to differentiate it's stores (field, error, multiValidator) form your fields and values.
That is need to make `accessors` safe to use while maintianing consise api. 
You can override informal's default behaviour by using an annotation on your own stores.
