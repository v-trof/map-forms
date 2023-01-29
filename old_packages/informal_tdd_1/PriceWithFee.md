# Situation
We were making a freelance platform. There was a form to post a new task. It had a price field, that sets how much the freelancer will earn for completing the task. Let's look at the requirements and implementation just for that field.


# Requirements
So there would be 
- a price input with the recommended price pre filled in it
- a view showing platform fee that is based on the filled in price
- "Set recommended price button" that if clicked fills "recommended price" back into the input

Sounds fairy simple. Let's start to dig into the details though.


# Actual requirements
**Price value**
- When user submits the form a valid price must be submitted. Otherwise the form must not submit and scroll to the price input.
- A valid price is
    - a number
    - with a precision of 2 decimals at most (because cents) (example: 6.55 is ok, 6.557 is not)
    - that cannot be lower than 5
    - that cannot be higher than 100 000


**Price field UI**
- User can type in a price
- User can paste the price form clipboard
- User can set the recommened price using a button in the UI
- User can use both `.` and `,` as a decimal separator

- User should not be able to type in letters, spaces and special characters into the price field
- User should not be able to type decimals after the 2nd one
- If user tries to do that the field wiggles slightly


**The fee**
- The fee must be shown based on the price the user has filled in
- The fee must update in real time as the user types into the price input
- The fee should be calculated even if the price looks slightly weird: like if the user has typed in `15.`, but didn't type in the cents yet
- If the price makes no sense at all the fee should be replace with "type in the price to see the fee"
    - no sense at all means empty or it is like 'gahksjgsadk' or "."
- The fee is calculated on the backend


**The recommended price button**
- The recommended price is calculated on the backend before the form is shown and does not change
- Recommended price is the default value of the price field
- There is a button "Set recommended price" that replaces current value in the price field with the recommended price


**Validation errors**
- If the user leaves the field empty there should be an error "This field is required"
- If the user filled in an incorrect number, say `150,` there should be an error **"Error text"**
- If the user filled in more than 2 decimal digits there should be an error **"Error text"**
- If the user filled in a price below minimum there should be an error **"Error text"**
- If the user filled in a price above maximum there should be an error **"Error text"**

- Errors should be shown when the user finishes typing into the field
    - Finished typing means either removing focus form the field or not changing anything for 5 seconds while the focus is still in the field
- Errors should be shown after submit even if the user didn't interact with the price field in any way
- Even after submit errors should not be shown while the user is typing

Bonus: ml used for calculating the recommnended price can go wrong, so here are some cases related to that
- Default price does not cause errors to show unless the form was submitted 
- Clicking "Use recommended price" button does cause errors to show it recommended price happend to be invalid 


# Doing it the imperative way
### 1st render
- Set price to `recommendedPrice`
- Set fee text to "type in the price to see the fee"
- Try to parse price
    - if it is impossible -- do nothing
- Request & Display the fee


### Changing price
Since the fee is based on the price value, we can just look at the price change event. But there are at least 3 ways for a price to change.

1. The user clicks "set recommended price"
    - Set price to `recommendedPrice`

    - Remove old validation error messages
    - Cancel old fee request
    - Set fee text to "type in the price to see the fee"

    - Try to parse price
        - if it is impossible show an error **"Error text"**
    - Request & Display the fee

    - Validate price
        - If it is not valid -- show an error

2. The user types into the price field
    - Check if types character is allowed
        - if not wiggle the field

    - Remove old validation error messages
    - Cancel old fee request
    - Set fee text to "type in the price to see the fee"

    - Try to parse price
        - if it is impossible show an error **"Error text"**

    - Request & Display the fee

3. The user pasted into the price field form cliboard
    - Trim start and end spaces
    - Check if clipboard content characters are allowed

    - Remove old validation error messages
    - Cancel old fee request
    - Set fee text to "type in the price to see the fee"

    - Try to parse price
        - if it is impossible show an error **"Error text"**

    - Request & Display the fee

4. The user remvoed focus form the price field / 5 seconds has passed since last action, but the focus is still in the price field
    - Validate price
        - If it is not valid -- show an error


### Submission
- Validate price
    - If it is not valid -- show an error, scroll to the price field
- Submit the form

# Getting a decent DX out of it
- We want all this logic in the same place not 3 different places (first render, field change handlers, submission)
- We want to avoid duplication as it would be very easy to, say, forget to update the fee
- We want to avoid doign stuff like validations / updating ui twice for perf reasons


So let's take a closer look at what behaviour is repeated
- Show error: submission, filling in the price by clicking a button or finishing typing. In other words when we think the user has no intention to make any more changes.
- Remove old validation messages and update fee: any change, including initial value, **regardless of wether the value is valid/parsed or not**.
- 



### Code

Option 1
```ts
const validatePrice = all(inRange(5, 100_000), maxDecimals(2));

const parsePriceForFee = (price: string) => {
    let parsedPrice = 0;

    try {
        if(price.endsWith('.') || price.endsWith(',')) {
            parsedPrice = parseFloat(price.substring(0, price.length - 1), 10);
        } else {
            parsedPrice = parseFloat(price, 10);
        }
    } catch(err) {
        log(err)
        return undefined
    }
    
    return round(parsedPrice, 2);
}

const fetchFee = (price: number) => {

}

const getFee = async (price: string | undefined) => {
    if(price === undefined) {
        return 'input a price to see the fee'
    }

    const parsedPrice = parsePriceForFee(price);

    if(parsedPrice === undefined) {
        return 'input a valid price to see the fee';
    }

    try {
        const fee = await fetchFee(parsedPrice)

        return fee;
    } catch(err) {
        return 'could not reach server to calculate fee, check your internet connection'
    }
}
```

```ts
const createPriceStore = (recommended: number) => {
    const priceStore = observable({
        input: input(all(parseNumber, required, validatePrice)).initialValue(recommended),
        fee: asyncComputed(() => getFee(priceStore.input.state))
        recommended,
    })

    return priceStore
}
```

```ts
const createPriceStore = (recommended: number) => {
    const priceStore = observable({
        input: inputParsed(parseNumber, validatePrice).initialValue(recommended),
        fee: asyncComputed((priceStore.input.state) => price, (price) => getFee(priceStore.input.state))
        recommended,
    })

    return priceStore
}
```

```ts
const createPriceStore = (recommended: number) => {
    const priceStore = observable({
        input: input.parsed(parseNumber, validatePrice).initialValue(recommended),
        fee: asyncComputed((get) => getFee(get(priceStore.input.state)))
        recommended,
    })

    return priceStore
}
```

```ts
const createPriceStore = (recommended: number) => {
    const priceStore = observable({
        // unlike validators parser required reverse transformation, so it is ok to have a separate parsedField))
        input: input.parsed(parseNumber, validatePrice),
        fee: asyncComputed((get) => getFee(get(priceStore.input.state)))
        recommended,
    })

    input.setValue(recommended, { approved: false })

    return priceStore
}
```


Ok settle on parser and validator being different things