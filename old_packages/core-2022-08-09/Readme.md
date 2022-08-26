Rules
1. Fields manage final value, validation errors. And contain interactionStatus since check needs that. Fields can exist outside forms.
2. Checks behave exactly like fields but have no Value hence no value related validationErrors & methods;
3. Forms just traverse fields and checks inside with no strict rules on them.