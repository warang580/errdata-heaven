# Callbacks/Promises heaven with [err,data] all the way

**Disclaimer** : this is just an experiment for the moment, don't **actually** use it ! Not in production, not in dev, nowhere. At the time of this write, there's actually no working code yet.

Note: If you don't like (my) bad humor, just scan the titles and the examples, that should be enough.

(For branding reasons, I wanted to call this package callback-heaven|heaven but they were already taken :sad:)

Avoid callback/promises hell by handling data/errors/callbacks/promises, etc.
through only [err, data] (what I smartly call errdata) and work on that with an API (that is like an Either monad, or that would be what I would say if I an idea what it really means).

(@TODO: explain that it chooses to not handle "native" errors auto-magically)

# What ? I don't need any tool for that

Let's say our usecase is this :

> Updating some customer information via a webservice
- Incoming request : A user wants to update their data (userid, name, email, age)
- Check that name, email and age are valid
- The appropriate user record in a database is updated with the new data (change updated_at)
- If the email has changed, send an email to that address
- Send an appropriate response to show the results of the request

@TODO: code version

Simple, right ? But that's only the happy path. We didn't handle any errors there.

The "real" usecase is this :

> Updating some customer information via a webservice
- Incoming request : A user wants to update their data (userid, name, email, age)
- Check that name, email and age are valid
  - validation errors ?
  - maybe checking that we don't have any other user with that new email ?
- The appropriate user record in a database is updated with the new data
  - db error ?
  - user not found ?
- If the email has changed, send an email to that address
  - smtp errors ?
- Send an appropriate response to show the results of the request

@TODO: What we're doing now (callback hell => promise hell => await everything [tm])

# Ok, what's your superior way of doing things then ? :thinking:

## Procedural examples

@TODO

## Functional examples

@TODO

# Ok, I'm intrigued, how do I install this ?

- `yarn add errdata` (hopefully I could at least take this name)

# Getting started

- `import H from 'errdata'` (H for heaven :angel:, but anything else could also work)
- ???
- Profit!

## API

@TODO: write nice documentation ! (*and then forgets about it and never does it* :roll:)
