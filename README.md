# Charlie Slack bot facts and responses

This repo holds facts and autoresponses that feed into TTS's internal slack
bot, [Charlie](https://github.com/18F/Charlie).

## How these lists work

These lists are JSON files that are read by Charlie. After creating a list
here, you'll also need to update
[Charlie's configuration](https://github.com/18F/Charlie/blob/main/config/slack-random-response.json)
to read it. (See
[the documentation about the random responder](https://github.com/18F/Charlie/pull/155)
for configuration information. If you're just updating a list Charlie already
knows about, you can skip this step.)

The JSON file must contain a single array. Each element of the array represents
one possible response to the configured trigger. For example, `dags.json`
represents all the responses for the "Dag Bot," or facts about TTSers' dogs.

A response can either just be text or it can be a more complex object. If it
is just text, you can specify an emoji to use as the bot's avatar by starting
the text with the emoji. For example, the text `":cat: Cats are animals"`
would produce a message like this:

![screenshot of bot response](https://user-images.githubusercontent.com/1775733/50521387-1c1e7200-0a8b-11e9-819e-0dfcaf4bda1a.png)

If the text does not start with an emoji, the avatar will be the default for
the bot, as configured in Charlie.

A response can also be a more complex object, specifying a name and avatar to
use when posting along with the text of the response. For example:

```js
{
  "name": "Dog in Disguise",
  "emoji": ":dog:",
  "text": "I am not a cat"
}
```

would produce a message like this:

![screenshot of bot response](https://user-images.githubusercontent.com/1775733/50521838-3eb18a80-0a8d-11e9-86b6-abbc259de39c.png)

Note that if the bot is configured with a custom name in the Charlie
configuration AND you set a name for this response, the bot's custom name is
included in parentheses.

## Contributing

See a [short video demonstrating how to update the facts](https://i.imgur.com/Ky6JDtE.gifv).

Changes must be submitted as pull requests, as the `main` branch is protected
from direct edits. Pull requests must pass their tests before they can be
merged - the tests just validate that the lists are correctly structured, so
they should run pretty quickly. Once the tests pass, the pull request will merge
itself.

Please read the [contribution guidelines](CONTRIBUTING.md) before submitting a
pull request.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related
> rights in the work worldwide are waived through the
> [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull
> request, you are agreeing to comply with this waiver of copyright interest.
