key idea: form is a part of state, do not separate it out at all. we just place fields wherever we need them and call "submit" that searches for fields recursively. 

we can tell apart a field from non-field because of unique symbols 
- getCurrentValue
- getValidValue
- doSubmit

---

please take a look at packages/examples and packages/infromal/src/input test ts and submit test ts to see example usage

----

anatomy of input
- getValidValue -- returns value you can actually submit or validation error
- "approved" -- a way to tell if we expect that the user finished editing input, thus ready to see errors (aimilar to touched in most form libraries)
- "backendErorr" -- validation error we couldn't compute on the client, that we expect, but do no require user to address before clicking sumvit (since backed state it came from couls have changed)
- submit -- does chores like setting approved, clearing old backend errors and returns getValidValue
- getCurrentValue -- returns value of the same type of getValidVlaue but likely not passing certain conatraints: i.e. minimum length of username is 4 characters but we want to update profile preview as the user is typing, so we use current value for it, also useful for saving drafts
- state (parsed inputs only) -- of your current value that makes sense for the rest of the app and method of ently are super different we have "parsed" to tell them apart: i.e. most numer inputs have to be steign inputs under the hood to work peoperly in firefox
- setCurrentValue -- used by autofill to provide intial / persisted values. in case of parsed input also hydrates state 

----

current, valid, submit from access.ts just search recusvely for this symbols above and call methods associated with them

submit calls for just one method, in the following order 
- doSubmit
- getValidValue
- getCurrentValue

valid only calls for
- getValidValue
- getCurrentValue

current calls for 
- getCurrentValue
- getValidValue for rare cases where current value was not suppoeted in cuatom input

--- 

there are a few extra structures to build complex forms 

alt allows you to have multiple braches of the form, uae just one, 
but persist input stte in unused ones 

removalble is sugar for alt input | undefined 

transformSubmitValue allows you to change how valid value looks suring aubmit but leaves the rest of the form intact 

inputArray is just an array of inputs / forms compatible with autofill

inputRecord is an object compatible with autofill

